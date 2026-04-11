const jwt = require("jsonwebtoken");
require("dotenv").config();


const generateAccessToken = (payload, expiresIn) => {
    const expiry = expiresIn || process.env.JWT_ACCESS_EXPIRY || "15m";
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

    const accessToken = jwt.sign(
        payload,
        secret,
        { expiresIn: expiry }
    );

    return accessToken;
}


const generateRefreshToken = (payload, expiresIn) => {
    const expiry = expiresIn || process.env.JWT_REFRESH_EXPIRY || "7d";
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

    const refreshToken = jwt.sign(
        payload,
        secret,
        { expiresIn: expiry }
    );

    return refreshToken;
}

const generateVerificationToken = (payload, expiresIn) => {
    const expiry = expiresIn || process.env.JWT_VERIFICATION_EXPIRY || "1h";
    const secret = process.env.JWT_VERIFICATION_SECRET || process.env.JWT_SECRET;

    const verificationToken = jwt.sign(
        payload,
        secret,
        { expiresIn: expiry }
    );

    return verificationToken;
}


const verifyAccessToken = (token) => {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    return decoded;
}


const verifyRefreshToken = (token) => {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    return decoded;
}


const verifyVerificationToken = (token) => {
    const secret = process.env.JWT_VERIFICATION_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    return decoded;
}


const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    return decoded;
}

module.exports = {
    // Generation functions
    generateAccessToken,
    generateRefreshToken,
    generateVerificationToken,

    // Verification functions
    verifyAccessToken,
    verifyRefreshToken,
    verifyVerificationToken,

    // Legacy (backward compatibility)
    verifyToken,
}