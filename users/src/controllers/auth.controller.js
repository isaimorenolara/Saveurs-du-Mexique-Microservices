const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { signToken } = require('../utils/jwt');
const { isEmail, isStrongPassword, isAdult, isRole, isZip } = require('../utils/validators');

const ok = (res, token) => res.json({ status: 'success', ...(token ? { token } : {}) });
const err = (res, code, message) => res.status(code).json({ status: 'error', error: message });

// POST /auth/sign-up
// Body: { account:{email,password,dob,role}, profile:{firstName,lastName}, address:{street,streetNumber,zip} }
async function signUp(req, res) {
    try {
        const { account, profile, address } = req.body || {};
        if (!account) return err(res, 400, 'MISSING_ACCOUNT');

        const email = String(account.email || '').trim().toLowerCase();
        const password = String(account.password || '');
        const dob = String(account.dob || '');
        const role = account.role || 'customer';

        if (!isEmail(email)) return err(res, 400, 'INVALID_EMAIL');
        if (!isStrongPassword(password)) return err(res, 400, 'WEAK_PASSWORD');
        if (!isAdult(dob)) return err(res, 400, 'UNDER_AGE');
        if (!isRole(role)) return err(res, 400, 'INVALID_ROLE');
        if (address?.zip && !isZip(address.zip)) return err(res, 400, 'INVALID_ZIP');

        const exists = await User.findOne({ email });
        if (exists) return err(res, 409, 'EMAIL_IN_USE');

        const passwordHash = await bcrypt.hash(password, 10);
        const doc = await User.create({
            email,
            passwordHash,
            role,
            dob,
            firstName: profile?.firstName || '',
            lastName: profile?.lastName || '',
            address: {
                street: address?.street || '',
                streetNumber: address?.streetNumber || '',
                zip: address?.zip || '',
            },
        });

        const token = signToken({
            id: doc.id,
            role: doc.role,
            email: doc.email,
            firstName: doc.firstName,
            lastName: doc.lastName,
        });

        return ok(res, token);
    } catch (e) {
        return err(res, 400, e.message || 'SIGN_UP_ERROR');
    }
}

// POST /auth/sign-in
// Body: { email, password }
async function signIn(req, res) {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const password = String(req.body?.password || '');

        if (!isEmail(email)) return err(res, 400, 'INVALID_EMAIL');
        if (!password) return err(res, 400, 'MISSING_PASSWORD');

        const user = await User.findOne({ email });
        if (!user) return err(res, 401, 'INVALID_CREDENTIALS');

        const okPwd = await bcrypt.compare(password, user.passwordHash);
        if (!okPwd) return err(res, 401, 'INVALID_CREDENTIALS');

        const token = signToken({
            id: user.id,
            role: user.role,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });

        return ok(res, token);
    } catch (e) {
        return err(res, 400, e.message || 'SIGN_IN_ERROR');
    }
}

module.exports = { signUp, signIn };