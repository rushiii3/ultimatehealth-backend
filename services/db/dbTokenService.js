const BlacklistedToken = require('../../models/blackListedToken');

const blackListToken = async (token) => {
    const blacklistedToken = new BlacklistedToken({ token: token });
    await blacklistedToken.save();
}

module.exports = {
    blackListToken
}