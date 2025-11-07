const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

function signToken(user) {
    const payload = {
        sub: user.id,
        role: user.role,
        email: user.email,
        nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    };

    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
}

function verifyToken(token) {
    return jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
    });
}

module.exports = { signToken, verifyToken };