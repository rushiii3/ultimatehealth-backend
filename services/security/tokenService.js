const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAccessToken = (payload, expiresIn = "1h") => {
    const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: expiresIn }
    );

    return accessToken;
}

const verifyToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
}

module.exports = {
    generateAccessToken,
    verifyToken,
}