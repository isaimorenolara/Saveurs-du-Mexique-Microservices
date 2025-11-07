function isEmail(str = '') {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(String(str));
}

function isStrongPassword(str = '') {
    return /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(String(str));
}

function isAdult(dob = '') {
    if (!dob) return false;
    const d = new Date(dob);
    const t = new Date();
    let age = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
    return age >= 18;
}

function isZip(str = '') {
    return /^[0-9]{5}$/.test(String(str));
}

function isRole(str = '') {
    return ['customer', 'seller', 'admin'].includes(String(str));
}

module.exports = { isEmail, isStrongPassword, isAdult, isZip, isRole };