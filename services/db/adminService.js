const Admin = require('../../models/admin/adminModel')
const { generateHashPassword } = require('../security/encryptService')
const {
    generateVerificationToken,
    hashToken,
} = require('../security/tokenService')

const checkExistingAdmin = async ({ email }) => {
    const existingAdmin = await Admin.exists({ email: email })
    return !!existingAdmin
}

const findAdminByEmail = async (email) => {
    return await Admin.findOne({ email: email }).lean()
}
const findAdminByHandle = async (user_handle) => {
    return await Admin.findOne({ user_handle: user_handle })
}

const findAdminById = async (id) => {
    return Admin.findById(id).lean()
}

const updateAdminOtp = async (admin, hashedOtp, otpExpires) => {
    admin.otp = hashedOtp
    admin.otpExpires = otpExpires
    await admin.save()
}

const incrementOtpAttemptsAdmin = (accountId) => {
    return Admin.updateOne({ _id: accountId }, { $inc: { otpAttempts: 1 } })
}

const clearOtpAdmin = (accountId) => {
    return Admin.updateOne(
        { _id: accountId },
        {
            $unset: {
                otp: '',
                otpExpires: '',
                otpAttempts: '',
                otpLastSentAt: '',
            },
        }
    )
}

const updateAdminPasswordAndClearOtp = async (userId, password) => {
    const hashedPassword = await generateHashPassword(password)
    return Admin.updateOne(
        { _id: userId },
        {
            $set: {
                password: hashedPassword,
            },
            $unset: {
                otp: '',
                otpExpires: '',
                otpAttempts: '',
                otpLastSentAt: '',
            },
        }
    )
}

const logoutAdmin = async (adminId) => {
    return Admin.updateOne(
        { _id: adminId },
        {
            $unset: {
                'refreshToken.hashedRefreshToken': 1,
                'refreshToken.jti': 1,
            },
        }
    )
}

const loginAdmin = async (adminId, refreshToken, jti, fcmToken) => {
    const hashedToken = await hashToken(refreshToken)
    const admin = await Admin.findByIdAndUpdate(
        adminId,
        {
            refreshToken: { hashedRefreshToken: hashedToken, jti },
            fcmToken: fcmToken,
        },
        { new: true }
    )
    return admin
}

const updateAdminVerificationStatus = async ({ adminId, signatureKey }) => {
    return Admin.updateOne(
        { _id: adminId },
        {
            $set: {
                isVerified: true,
                signature_url: signatureKey,
            },
            $unset: {
                hashedJti: 1,
            },
        }
    )
}

const getMyProfile = async (adminId) => {
    return Admin.findById(adminId)
        .select('_id role Profile_avtar user_name user_handle  email')
        .lean()
}

const updateAdminPasswordById = async (adminId, newPassword) => {
    const hashedPassword = await generateHashPassword(newPassword)
    return Admin.findByIdAndUpdate(adminId, {
        $set: {
            password: hashedPassword,
        },
    })
}

const updateAdminProfileById = async (
    adminId,
    username,
    userhandle,
    profile_avatar
) => {
    return Admin.findByIdAndUpdate(adminId, {
        $set: {
            user_name: username,
            user_handle: userhandle,
            Profile_avtar: profile_avatar,
        },
    })
}

const deletAdminById = async (adminId) => {
    return Admin.findByIdAndDelete(adminId)
}
module.exports = {
    checkExistingAdmin,
    findAdminByEmail,
    findAdminByHandle,
    updateAdminOtp,
    incrementOtpAttemptsAdmin,
    clearOtpAdmin,
    updateAdminPasswordAndClearOtp,
    logoutAdmin,
    updateAdminVerificationStatus,
    loginAdmin,
    getMyProfile,
    findAdminById,
    updateAdminPasswordById,
    updateAdminProfileById,
    deletAdminById,
}
