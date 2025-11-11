function isAdmin(req) {
    return req.user?.role === 'admin';
}

function ownerOrAdmin(req, doc) {
    return isAdmin(req) || String(doc.sellerId) === String(req.user?._id);
}

module.exports = { isAdmin, ownerOrAdmin };