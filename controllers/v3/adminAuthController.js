// moderator registration
// moderator verification
// moderator and admin login
// moderator and admin logout
// moderator account deletion
const bcrypt = require('bcrypt')
const expressAsyncHandler = require('express-async-handler')
const Admin = require('../../models/admin/adminModel')
const BlacklistedToken = require('../../models/blackListedToken')
const User = require('../../models/UserModel')
const UnverifiedUser = require('../../models/UnverifiedUserModel')
const { deleteFileFn } = require('../uploadController')
const {
    verifyVerificationToken,
    generateRefreshToken,
    generateVerificationToken,
    hashToken,
    generateSignature,
    generateVerificationSignature,
} = require('../../services/security/tokenService')

const { throwError } = require('../../utils/throwError')
const { sendSuccess } = require('../../utils/response')
const { HTTP_STATUS, ERROR_CODES } = require('../../constants/errorConstants')

const {
    checkExistingAdmin,
    updateAdminVerificationStatus,
    findAdminByEmail,
    loginAdmin,
    logoutAdmin,
    getMyProfile,
    findAdminById,
    updateAdminPasswordById,
    findAdminByHandle,
    updateAdminProfileById,
    deletAdminById,
} = require('../../services/db/adminService')
const { checkExistingUser } = require('../../services/db/userService')
const { ROLES } = require('../../constants/roles')
const {
    isSamePassword,
    generateHashPassword,
} = require('../../services/security/encryptService')
const { generatePDF } = require('../../utils/pdf')
const { uploadPdf, getPdf } = require('../../utils/storage')
const { compressSignature } = require('../../utils/compresion')

module.exports.register = expressAsyncHandler(async (req, res) => {
    const { user_name, user_handle, email, Profile_avtar, password } = req.body

    // Check if user already exists in User or UnverifiedUser collections

    const [existingUser, existingAdmin] = await Promise.all([
        checkExistingUser({
            email: email,
            user_handle: user_handle,
        }),
        checkExistingAdmin({ email: email }),
    ])

    if (existingUser || existingAdmin) {
        return sendSuccess(
            res,
            HTTP_STATUS.CREATED,
            'If the account can be registered, please verify your email.'
        )
    }

    const hashedPassword = await generateHashPassword(password)
    const role = ROLES.MODERATOR
    const { verificationToken, jti } = generateVerificationToken({
        email,
        role,
    })
    const hashedJti = await hashToken(jti)

    // Create new unverified user
    const adminuser = new Admin({
        user_name,
        user_handle,
        email,
        password: hashedPassword,
        Profile_avtar,
        hashedJti,
    })

    await adminuser.save()

    if (process.env.NODE_ENV === 'development') {
        console.log('Verification Token', verificationToken)
    }
    if (process.env.NODE_ENV === 'production') {
        await sendVerificationEmail(email, verificationToken)
    }

    return sendSuccess(
        res,
        HTTP_STATUS.CREATED,
        'If the account can be registered, please verify your email.'
    )
})
const verifyAdminToken = (token) => {
    if (!token || typeof token !== 'string' || !token.trim()) {
        throwError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.MISSING_REQUIRED_FIELD,
            'Verification token is required'
        )
    }
    const decoded = verifyVerificationToken(token)
    const { role, email, jti } = decoded
    if (role !== ROLES.MODERATOR && role !== ROLES.ADMIN) {
        throwError(
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.INVALID_TOKEN,
            'Invalid token role'
        )
    }
    return { email, jti }
}
module.exports.generateAdminSignature = expressAsyncHandler(
    async (req, res) => {
        const { token } = req.query
        const { email, jti } = verifyAdminToken(token)
        const admin = await Admin.findOne({ email }).lean()
        if (!admin) {
            throwError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.TOKEN_INVALID,
                'Invalid or expired verification link'
            )
        }
        if (admin.isVerified) {
            throwError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.EMAIL_ALREADY_VERIFIED,
                'Email is already verified'
            )
        }
        const hashedJti = await hashToken(jti)
        if (hashedJti !== admin.hashedJti) {
            throwError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.VERIFICATION_LINK_INVALID,
                'Invalid or expired verification link'
            )
        }
        const payload = {
            userId: admin._id,
            email: admin.email,
            role: admin.role,
        }
        const signature = await generateSignature(payload)

        return sendSuccess(res, HTTP_STATUS.OK, 'Signature generated', {
            name: admin.user_name,
            signature,
        })
    }
)

module.exports.generateAdminAgreement = expressAsyncHandler(
    async (req, res, next) => {
        // const __dirname = path.dirname(fileURLToPath(''))

        const { signature, signatureHash, isAgreed, token } = req.body
        if (isAgreed !== true) {
            throwError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.MISSING_REQUIRED_FIELD,
                'You must agree to the terms to proceed'
            )
        }
        const { email, jti } = verifyAdminToken(token)
        const admin = await Admin.findOne({ email }).lean()
        if (!admin) {
            throwError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.TOKEN_INVALID,
                'Invalid or expired verification link'
            )
        }
        if (admin.isVerified) {
            throwError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.EMAIL_ALREADY_VERIFIED,
                'Email is already verified'
            )
        }
        const hashedJti = await hashToken(jti)
        if (hashedJti !== admin.hashedJti) {
            throwError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.VERIFICATION_LINK_INVALID,
                'Invalid or expired verification link'
            )
        }
        const payload = {
            userId: admin._id,
            email: admin.email,
            role: admin.role,
        }
        const generatedSignature = await generateSignature(payload)
        const generatedVerificationSignature =
            await generateVerificationSignature(signature, generatedSignature)
        if (generatedVerificationSignature !== signatureHash) {
            throwError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.VERIFICATION_LINK_INVALID,
                'Invalid signature'
            )
        }
        const signedDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
        const signerIp =
            req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.socket.remoteAddress ||
            'Unknown'

        const compressedSignature = await compressSignature(signature)
        const { agreementId, pdfBuffer } = await generatePDF({
            admin,
            signedDate,
            signerIp,
            compressedSignature,
        })

        if (!agreementId || !pdfBuffer) {
            throwError(
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                ERROR_CODES.INTERNAL_ERROR,
                'Failed to generate agreement PDF'
            )
        }

        const pdfKey = `agreements/${agreementId}/agreement.pdf`
        const { key, etag } = await uploadPdf(pdfBuffer, pdfKey)
        console.log('PDF uploaded with key:', key, 'and etag:', etag)
        if (!key || !etag) {
            throwError(
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                ERROR_CODES.INTERNAL_ERROR,
                'Failed to upload agreement PDF'
            )
        }

        const updatedStatus = await updateAdminVerificationStatus({
            adminId: admin._id,
            signatureKey: key,
        })
        if (updatedStatus.modifiedCount !== 1) {
            throwError(
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                ERROR_CODES.INTERNAL_ERROR,
                'Failed to update admin verification status'
            )
        }

        return sendSuccess(
            res,
            HTTP_STATUS.OK,
            'Signature verified, agreement accepted'
        )
    }
)

module.exports.login = expressAsyncHandler(async (req, res) => {
    const { email, password, fcmToken } = req.body

    const admin = await findAdminByEmail(email)

    if (!admin) {
        throwError(
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.ACCESS_DENIED,
            'Invalid email or password'
        )
    }

    if (!admin.isVerified && admin.signature_url === '') {
        throwError(
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.ACCESS_DENIED,
            'Email not verified. Please verify your email first.'
        )
    }

    const isPasswordValid = await isSamePassword(password, admin.password)
    if (!isPasswordValid) {
        throwError(
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.ACCESS_DENIED,
            'Invalid email or password'
        )
    }

    // logout existing sessions refresh token if present
    if (admin.refreshToken && admin.refreshToken.hashedRefreshToken) {
        await logoutAdmin(admin._id)
    }

    // Generate Refresh Token
    const { refreshToken, jti } = generateRefreshToken(
        {
            userId: admin._id,
            role: admin.role,
        },
        '7d'
    )

    await loginAdmin(admin._id, refreshToken, jti, fcmToken)

    // Set cookies for tokens
    // res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 900000 }); // 15 minutes

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return sendSuccess(res, HTTP_STATUS.OK, 'Login successful', {
        admin: {
            // _id: user._id,
            email: admin.email,
            user_name: admin.user_name,
            role: admin.role,
            isVerified: admin.isVerified,
            user_handle: admin.user_handle,
        },
        refreshToken,
    })
})

module.exports.logout = expressAsyncHandler(async (req, res) => {
    const { userId, role } = req.user
    await logoutAdmin(userId)

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    })
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    })

    return sendSuccess(res, HTTP_STATUS.OK, 'Logged out successfully')
})

module.exports.getprofile = expressAsyncHandler(async (req, res) => {
    const admin = await getMyProfile(req.user.userId)
    if (!admin) {
        throwError(
            HTTP_STATUS.NOT_FOUND,
            ERROR_CODES.RESOURCE_NOT_FOUND,
            'User not found'
        )
    }
    sendSuccess(res, HTTP_STATUS.OK, 'User profile fetched successfully.', {
        admin,
    })
})

// update user password
module.exports.updateAdminPassword = expressAsyncHandler(async (req, res) => {
    const userId = req?.user.userId
    const { new_password, old_password } = req.validateBody

    const admin = await findAdminById(userId)
    if (!admin) {
        throwError(
            HTTP_STATUS.NOT_FOUND,
            ERROR_CODES.RESOURCE_NOT_FOUND,
            'Admin not found'
        )
    }
    // Check if the old password matches the stored password
    const isOldPasswordValid = await isSamePassword(
        old_password,
        admin.password
    )
    if (!isOldPasswordValid) {
        throwError(
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.INVALID_CREDENTIALS,
            'Invalid old password'
        )
    }

    // Ensure the new password is not the same as the old password
    const isSameAsOldPassword = await isSamePassword(
        new_password,
        admin.password
    )
    if (isSameAsOldPassword) {
        throwError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR,
            'Same as old password'
        )
    }

    const updatedAdminPassword = await updateAdminPasswordById(
        admin._id,
        new_password
    )
    if (!updatedAdminPassword) {
        throwError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            'Failed to update password'
        )
    }

    sendSuccess(res, HTTP_STATUS.OK, 'Password updated successfully')
})

// Edit profile: user_name, user_handle, password, profile_avtar

module.exports.editProfile = expressAsyncHandler(async (req, res) => {
    const { user_name, user_handle, profile_avtar } = req.validateBody
    const userId = req?.user.userId
    const isHandleExists = await findAdminByHandle(user_handle)

    if (isHandleExists) {
        throwError(
            HTTP_STATUS.CONFLICT,
            ERROR_CODES.RESOURCE_ALREADY_EXISTS,
            'User handle already exists'
        )
    }
    const updateProfile = await updateAdminProfileById(
        userId,
        user_name,
        user_handle,
        profile_avtar
    )
    if (!updateProfile) {
        throwError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            'Failed to update user info'
        )
    }

    sendSuccess(res, HTTP_STATUS.OK, 'Profile updated successfully')
})

// Duplicate logout function removed - using expressAsyncHandler version above

module.exports.deleteAdmin = expressAsyncHandler(async (req, res) => {
    const { password } = req.validateBody
    const userId = req?.user.userId
    const admin = await findAdminById(userId)
    if (!admin) {
        throwError(
            HTTP_STATUS.NOT_FOUND,
            ERROR_CODES.RESOURCE_NOT_FOUND,
            'Admin not found'
        )
    }

    const isOldPasswordValid = await isSamePassword(password, admin.password)
    if (!isOldPasswordValid) {
        throwError(
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.INVALID_CREDENTIALS,
            'Invalid old password'
        )
    }

    // delete profile image from aws
    // const avatar = admin?.Profile_avtar
    // if (
    //     typeof avatar === 'string' &&
    //     avatar.trim() !== '' &&
    //     !avatar.startsWith('http://') &&
    //     !avatar.startsWith('https://') &&
    //     !avatar.startsWith('//') &&
    //     !avatar.startsWith('data:')
    // ) {
    //     await deleteFileFn(avatar)
    // }

    const deletedAdmin = await deletAdminById(userId)

    if (!deletedAdmin) {
        throwError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            'Failed to delete account'
        )
    }

    sendSuccess(res, HTTP_STATUS.OK, 'Account deleted successfully!')
})

module.exports.getAgreementPDF = expressAsyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user.userId
    const key = `agreements/${id}/agreement.pdf`
    const admin = await findAdminById(userId)
    if (!admin) {
        throwError(
            HTTP_STATUS.NOT_FOUND,
            ERROR_CODES.RESOURCE_NOT_FOUND,
            'Admin not found'
        )
    }
    if (admin.signature_url !== key) {
        throwError(
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.ACCESS_DENIED,
            'You do not have access to this agreement'
        )
    }

    const pdfStream = await getPdf(key)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=agreement-${id}.pdf`
    )

    pdfStream.on('error', (err) => {
        console.error(err)
        if (!res.headersSent) {
            res.status(500).end()
        }
    })

    pdfStream.pipe(res)
})
