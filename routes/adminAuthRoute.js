const express = require("express");
const router = express.Router();
const { register, login, logout, getprofile, updateAdminPassword, editProfile, deleteAdmin } = require('../controllers/admin/adminAuthController');
const {
  verifyEmail,
  Sendverifymail,
  resendVerificationEmail,
} = require("../controllers/emailservice");
const path = require("path");
const authenticateToken = require("../middleware/adminAuthenticateToken");




router.post("/admin/register", register);


/**
 * @openapi
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     description: >
 *       Authenticates an admin user using email, password, and FCM token.  
 *       An admin cannot stay logged in on more than one device.  
 *       With every new login, the previous session automatically expires.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin@123
 *               fcmToken:
 *                 type: string
 *                 description: Firebase Cloud Messaging token for device identification
 *                 example: "d4hfgdhs7sd78sd7f7sdf8sdf8sd7f"
 *             required:
 *               - email
 *               - password
 *               - fcmToken
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/Admin'
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI..."
 *                 message:
 *                   type: string
 *                   example: "Login Successful"
 *       400:
 *         description: Bad request (missing fields / validation error)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 value:
 *                   error: "Please provide email and password and FCM Token"
 *               validationError:
 *                 value:
 *                   error: "Validation error message"
 *       401:
 *         description: Invalid password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid password"
 *       403:
 *         description: Email not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Email not verified. Please check your email."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */


router.post("/admin/login", login);

/**
 * @openapi
 * /admin/logout:
 * 
 *   post:
 *     summary: Logout admin
 *     description: Logs out the currently authenticated user by blacklisting the refresh token and clearing cookies.
 *     tags: [Admin]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */


router.post("/admin/logout", authenticateToken, logout);




router.get("/admin/verifyEmail", verifyEmail);



router.post("/admin/verifyEmail", Sendverifymail);


router.post("/admin/resend-verification-mail", resendVerificationEmail);

/**
 * @openapi
 * /admin/getprofile:
 *   get:
 *     summary: Get admin profile
 *     description: |
 *       Retrieves the profile information of the currently authenticated admin user.
 *       
 *       - Requires a valid JWT access token in the Authorization header.
 *       - The user's email must be verified to access this route.
 *       - Returns user details if authenticated and verified.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved admin profile.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       403:
 *         description: Email not verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email not verified. Please check your email.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

router.get('/admin/getprofile', authenticateToken, getprofile);

/**
 * @openapi
 * /admin/update-password:
 *   post:
 *     summary: Update admin password
 *     description: |
 *       Allows an admin to update their password using their email address.
 *       
 *       - The new password must be at least 6 characters long.
 *       - The new password must not be the same as the current one.
 *       - Returns an error if the email is not associated with any admin.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - new_password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               new_password:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password updated
 *       400:
 *         description: Bad request (e.g. missing fields, same password, too short).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Password too short
 *       404:
 *         description: Admin not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */
router.post('/admin/update-password', updateAdminPassword);

/**
 * @openapi
 * /admin/update-profile:
 *   post:
 *     summary: Update admin profile
 *     description: |
 *       Allows an authenticated admin to update their profile details such as name, handle, avatar, and password.
 *       
 *       - Requires a valid JWT token in the Authorization header.
 *       - All fields are optional except for the new password, which must be different from the current one.
 *       - If the new password matches the old one, the request will be rejected.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: John Doe
 *               user_handle:
 *                 type: string
 *                 example: johndoe123
 *               profile_avtar:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/avatar.jpg
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePassword123
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated
 *       400:
 *         description: New password is the same as the old password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Same as old password
 *       401:
 *         description: Unauthorized – missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Admin user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */

router.post('/admin/update-profile', authenticateToken, editProfile);


/**
 * @swagger
 * /admin/delete:
 *   post:
 *     summary: Delete user account
 *     description: |
 *       Permanently deletes the authenticated admin's account.  
 *       The user must be verified and must provide the correct password.  
 *       Authentication is accepted via:
 *       - Cookie: `token`
 *       - Authorization Header: `Bearer <token>`
 *     tags:
 *       - [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: "userPassword123"
 *     responses:
 *       200:
 *         description: Account successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "account has been removed from database"
 *
 *       401:
 *         description: Authorization token missing or invalid password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid password"
 *
 *       403:
 *         description: Email not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email not verified. Please check your email."
 *
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post("/admin/delete", authenticateToken, deleteAdmin);

router.get("/admin/delete-account", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login-admin.html"));
});


module.exports = router;


