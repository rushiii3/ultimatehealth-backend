const adminModel = require("../../models/admin/adminModel");

const findAdminByEmail = async (email) => {
    return await adminModel.findOne({ email: email });
}
const findAdminByHandle = async (user_handle) => {
    return await adminModel.findOne({ user_handle: user_handle });
}

const updateAdminOtp = async (admin, otp, otpExpires) => {
    admin.otp = otp;
    admin.otpExpires = otpExpires;
    await admin.save();
}

module.exports = {
    findAdminByEmail,
    findAdminByHandle,
    updateAdminOtp
}