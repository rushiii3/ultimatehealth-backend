const BlacklistedToken = require('../../models/blackListedToken');

const blackListToken = async (token) => {
    const blacklistedToken = new BlacklistedToken({ token: token });
    await blacklistedToken.save();
}

const addTokenToBlacklist = async (jti, expiresAt) => {
  const blacklistedToken = new BlacklistedToken({ jti, expiresAt });
  await blacklistedToken.save();
}

module.exports = {
    blackListToken,
    addTokenToBlacklist
}