const express = require('express')
const router = express.Router()
const {
    register,
    login,
    logout,
    getprofile,
    updateAdminPassword,
    editProfile,
    deleteAdmin,
} = require('../controllers/admin/adminAuthController')

const {
    register: adminRegister,
    generateAdminSignature,
    generateAdminAgreement,
    getAgreementPDF,
    login: adminLogin,
    logout: adminLogout,
    getprofile: adminProfile,
    updateAdminPassword: adminPasswordUpdate,
    editProfile: adminProfileUpdate,
    deleteAdmin: adminProfileDelete,
} = require('../controllers/v3/adminAuthController')

const {
    verifyEmail,
    Sendverifymail,
    resendVerificationEmail,
} = require('../controllers/emailservice')
const path = require('path')
const authenticateToken = require('../middleware/adminAuthenticateToken')

const { uploadAgreementPDF } = require('../controllers/uploadController')

const { authenticate } = require('../middleware/authenticate')
const { authorize } = require('../middleware/authorization')
const { ROLES } = require('../constants/roles')
const {
    validateBody,
    validateParams,
    validateQuery,
} = require('../middleware/validator')
const { registerLimiter, loginLimiter } = require('../middleware/ratelimit')
const {
    adminRegisterSchema,
    agreementSchema,
    loginSchema,
    updatePasswordSchema,
    adminUpdateProfile,
    adminDeleteProfile,
} = require('../validators/auth.schema')

const enforceMinDuration = (minDuration = 700) => {
    return (req, res, next) => {
        const start = Date.now()

        const originalEnd = res.end.bind(res)

        res.end = (...args) => {
            const elapsed = Date.now() - start
            const remaining = Math.max(0, minDuration - elapsed)

            setTimeout(() => {
                originalEnd(...args)
            }, remaining)
        }

        next()
    }
}

router.post('/admin/register', register)

router.post('/admin/login', login)
router.post('/admin/upload-agreement', uploadAgreementPDF)

router.post('/admin/logout', authenticateToken, logout)

router.get('/admin/verifyEmail', verifyEmail)

router.post('/admin/verifyEmail', Sendverifymail)

router.post('/admin/resend-verification-mail', resendVerificationEmail)

router.get('/admin/getprofile', authenticateToken, getprofile)

router.post('/admin/update-password', updateAdminPassword)

router.post('/admin/update-profile', authenticateToken, editProfile)

router.post('/admin/delete', authenticateToken, deleteAdmin)

router.get('/admin/delete-account', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login-admin.html'))
})

router.get('/admin/agreement', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin-agreement.html'))
})

// new routes for admin
router.post(
    '/v3/admin/register',
    enforceMinDuration(700),
    registerLimiter,
    validateBody(adminRegisterSchema),
    adminRegister
)

router.get('/v3/admin/signature', generateAdminSignature)

router.post(
    '/v3/admin/agreement',
    enforceMinDuration(700),
    registerLimiter,
    validateBody(agreementSchema),
    generateAdminAgreement
)

router.get(
    '/v3/admin/agreements/:id/agreement.pdf',
    authenticate,
    authorize(ROLES.MODERATOR),
    getAgreementPDF
)

router.post(
    '/v3/admin/login',
    enforceMinDuration(700),
    loginLimiter,
    validateBody(loginSchema),
    adminLogin
)

router.post(
    '/v3/admin/logout',
    authenticate,
    authorize(ROLES.MODERATOR),
    adminLogout
)

router.get(
    '/v3/admin/getprofile',
    authenticate,
    authorize(ROLES.MODERATOR),
    adminProfile
)

router.put(
    '/v3/admin/update-password',
    authenticate,
    authorize(ROLES.MODERATOR),
    validateBody(updatePasswordSchema),
    adminPasswordUpdate
)

router.put(
    '/v3/admin/update-profile',
    authenticate,
    authorize(ROLES.MODERATOR),
    validateBody(adminUpdateProfile),
    adminProfileUpdate
)

router.delete(
    '/v3/admin/delete',
    authenticate,
    authorize(ROLES.MODERATOR),
    validateBody(adminDeleteProfile),
    adminProfileDelete
)

module.exports = router
