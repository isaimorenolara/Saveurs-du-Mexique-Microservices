const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { signToken } = require('../utils/jwt');
const { isEmail, isAdult, isZip, isRole } = require('../utils/validators');

// GET /me  (protegido con requireAuth)
async function me(req, res) {
    try {
        const userId = req.user?.sub;
        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ status: 'error', error: 'NOT_FOUND' });
        const { passwordHash, ...safe } = user;
        return res.json(safe);
    } catch {
        return res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
    }
}

// PUT /me  or  PATCH /users/:id
// Body: { account:{ email?, password?:{ current?:string, new:string }, dob?, role? }, profile:{ firstName?, lastName? }, address:{ street?, streetNumber?, zip? } }
async function updateProfile(req, res) {
    try {
        const requesterId = req.user?.sub;
        const requesterRole = req.user?.role;

        const targetId = req.params.id || requesterId;
        const isSelfUpdate = targetId === requesterId;

        if (!isSelfUpdate && requesterRole !== 'admin') {
            return res.status(403).json({ status: 'error', error: 'FORBIDDEN' });
        }

        const { account, profile, address } = req.body || {};
        const user = await User.findById(targetId);
        if (!user) return res.status(404).json({ status: 'error', error: 'NOT_FOUND' });

        let tokenNeedsRefresh = false;

        if (account && typeof account.email === 'string') {
            const email = String(account.email).trim().toLowerCase();
            if (!isEmail(email)) return res.status(400).json({ status: 'error', error: 'INVALID_EMAIL' });
            if (email !== user.email) {
                const exists = await User.findOne({ email });
                if (exists) return res.status(409).json({ status: 'error', error: 'EMAIL_IN_USE' });
                user.email = email;
                tokenNeedsRefresh = true;
            }
        }

        if (account && account.password && typeof account.password === 'object') {
            const current = account.password.current;
            const next = account.password.new;
            if (!next) return res.status(400).json({ status: 'error', error: 'MISSING_NEW_PASSWORD' });
            if (!isStrongPassword(next)) return res.status(400).json({ status: 'error', error: 'WEAK_PASSWORD' });

            if (isSelfUpdate) {
                if (!current) return res.status(400).json({ status: 'error', error: 'MISSING_CURRENT_PASSWORD' });
                const ok = await bcrypt.compare(String(current), user.passwordHash);
                if (!ok) return res.status(401).json({ status: 'error', error: 'INVALID_CURRENT_PASSWORD' });
            } else if (requesterRole !== 'admin') {
                return res.status(403).json({ status: 'error', error: 'FORBIDDEN' });
            }

            user.passwordHash = await bcrypt.hash(String(next), 10);
        }

        if (account && typeof account.dob === 'string') {
            if (!isAdult(account.dob)) return res.status(400).json({ status: 'error', error: 'UNDER_AGE' });
            user.dob = account.dob;
        }

        if (account && typeof account.role !== 'undefined') {
            if (requesterRole !== 'admin') {
                return res.status(403).json({ status: 'error', error: 'FORBIDDEN_ROLE_CHANGE' });
            }
            const nextRole = String(account.role);
            if (!isRole(nextRole)) return res.status(400).json({ status: 'error', error: 'INVALID_ROLE' });
            if (user.role !== nextRole) {
                user.role = nextRole;
                tokenNeedsRefresh = true;
            }
        }

        if (profile) {
            if (typeof profile.firstName === 'string') {
                user.firstName = profile.firstName.trim();
                tokenNeedsRefresh = true;
            }
            if (typeof profile.lastName === 'string') {
                user.lastName = profile.lastName.trim();
                tokenNeedsRefresh = true;
            }
        }

        if (address) {
            if (typeof address.street === 'string') user.address.street = address.street;
            if (typeof address.streetNumber === 'string') user.address.streetNumber = address.streetNumber;
            if (typeof address.zip === 'string') {
                if (!isZip(address.zip)) return res.status(400).json({ status: 'error', error: 'INVALID_ZIP' });
                user.address.zip = address.zip;
            }
        }

        await user.save();

        let newToken;
        if (tokenNeedsRefresh) {
            newToken = signToken({
                id: user.id,
                role: user.role,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            });
        }

        const safe = user.toObject();
        delete safe.passwordHash;

        return res.json({
            status: 'success',
            user: safe,
            ...(newToken ? { token: newToken } : {}),
        });
    } catch {
        return res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
    }
}

// GET /users?page=1&pageSize=10&sortBy=createdAt|name&order=asc|desc
async function listUsers(req, res) {
    try {

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const pageSizeRaw = parseInt(req.query.pageSize || req.query.perPage, 10) || 10;
        const pageSize = Math.min(100, Math.max(1, pageSizeRaw));

        const sortBy = String(req.query.sortBy || 'createdAt').toLowerCase();
        const order = String(req.query.order || 'desc').toLowerCase() === 'asc' ? 1 : -1;

        const sort =
            sortBy === 'name'
                ? { lastName: order, firstName: order }
                : { createdAt: order };

        const filter = {};

        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter)
                .select('-passwordHash')
                .sort(sort)
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .collation({ locale: 'es', strength: 1 })
                .lean(),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / pageSize));

        return res.json({
            status: 'success',
            pagination: {
                total,
                page,
                pageSize,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
            users,
        });
    } catch {
        return res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
    }
}

module.exports = { me, updateProfile, listUsers };