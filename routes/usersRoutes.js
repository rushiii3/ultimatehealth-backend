const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  sendOTPForForgotPassword,
  verifyOtpForForgotPassword,
  deleteByUser,
  deleteByAdmin,
  getprofile,
  getProfileImage,
  follow,
  //getFollowers,
  getUserProfile,
  getSocials,
  getUserWithArticles,
  getUserLikeAndSaveArticles,
  //getFollowings,
  checkOtp,
  refreshToken,
  updateProfileImage,
  getUserDetails,
  updateUserPassword,
  updateUserGeneralDetails,
  updateUserContactDetails,
  updateUserProfessionalDetails,
  checkUserHandle
} = require("../controllers/usersControllers");

const {
  verifyEmail,
  sendVerificationEmail,
  Sendverifymail,
  resendVerificationEmail,
} = require("../controllers/emailservice");
const authenticateToken = require("../middleware/authentcatetoken");

router.get("/hello", (req, res) => {
  console.log("Hello World Route Executed");
  res.send("Hello World");
});

// Register New User

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user or doctor
 *     tags:
 *       - User
 *     description: |
 *       Registers a new user. If `isDoctor` is true, additional doctor-specific information is stored.
 *       The system checks for duplicate emails and handles verification through a token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_name
 *               - user_handle
 *               - email
 *               - password
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: "John Doe"
 *               user_handle:
 *                 type: string
 *                 example: "john_doe_91"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               isDoctor:
 *                 type: boolean
 *                 example: false
 *               Profile_image:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/profile.jpg"
 *               qualification:
 *                 type: string
 *                 example: "MBBS"
 *               specialization:
 *                 type: string
 *                 example: "Cardiology"
 *               Years_of_experience:
 *                 type: integer
 *                 example: 10
 *               contact_detail:
 *                 type: string
 *                 example: "+1-202-555-0173"
 *     responses:
 *       201:
 *         description: Registration successful. Verification email sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registration successful. Please verify your email."
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request - missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Please provide all required fields"
 *       409:
 *         description: Conflict - Email or user handle already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email or user handle already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/user/register", register);

// Login User Route

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Auth
 *     description: |
 *       Authenticates a user with email and password.  
 *       Requires FCM Token for push notifications.  
 *       Handles verification, banned/block checks, and issues JWT tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fcmToken
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               fcmToken:
 *                 type: string
 *                 description: Firebase Cloud Messaging token for push notifications
 *                 example: "abcd1234efgh5678ijkl"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: Logged-in user object
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 message:
 *                   type: string
 *                   example: "Login Successful"
 *       400:
 *         description: Missing fields or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Please provide email and password and FCM Token"
 *       401:
 *         description: Invalid password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid password"
 *       403:
 *         description: Email not verified or user is banned/blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email not verified. Please check your email."
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/user/login", login);

// Refresh Token

/**
 * @deprecated
 */

/**
 * @swagger
 * /user/refreshToken:
 *   post:
 *     summary: Refresh access and refresh tokens
 *     tags:
 *       - Auth
 *     description: |
 *       Accepts a valid refresh token, verifies it, and returns a new access token and a new refresh token.  
 *       Also updates the refresh token stored in the database and sets cookies accordingly.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The current refresh token issued during login
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Refresh token not provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Refresh token required"
 *       403:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid refresh token"
 */
router.post("/user/refreshToken", refreshToken);

// Get profile

/**
 * @swagger
 * /user/getprofile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the profile of the authenticated user including their articles, saved articles, and reposted articles with tags.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 profile:
 *                   type: object
 *                   $ref: '#/components/schemas/User'
 *                   description: "User profile information"
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized access. Please log in."
 *       403:
 *         description: Forbidden - Email not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email not verified. Please check your email."
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */
router.get("/user/getprofile", authenticateToken, getprofile);

// Get profile image

/**
 * @swagger
 * /user/getprofileimage/{userId}:
 *   get:
 *     summary: Get profile image by user ID
 *     description: Retrieves the profile image URL of a specific user by their ID.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve the profile image for
 *     responses:
 *       200:
 *         description: Profile image retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile_image:
 *                   type: string
 *                   example: "https://example.com/images/user123.jpg"
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized access. Please log in."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Author not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/user/getprofileimage/:userId',authenticateToken, getProfileImage);
// Get Other's Profile
router.get("/user/getuserprofile", authenticateToken, getUserProfile);

// Follow and Unfollow Routes
router.post("/user/follow", authenticateToken, follow);

router.get("/user/socials", authenticateToken, getSocials);
// Forget password
router.post("/user/forgotpassword", sendOTPForForgotPassword);
router.post("/user/verifyOtp", checkOtp);
// verify password
router.post("/user/verifypassword", verifyOtpForForgotPassword);

router.post("/user/deleteUser", deleteByUser);
router.post("/admin/deleteUser", deleteByAdmin);

router.get("/user/verifyEmail", verifyEmail);
router.post("/user/verifyEmail", Sendverifymail);
router.post("/user/resend-verification-mail", resendVerificationEmail);



// Get user with articles
router.get("/user/articles", authenticateToken, getUserWithArticles);

// Get user liked and saved articles
router.get(
  "/user/liked-saved-articles",
  authenticateToken,
  getUserLikeAndSaveArticles
);

router.post("/user/logout", authenticateToken, logout);
router.post(
  "/user/update-profile-image",
  authenticateToken,
  updateProfileImage
);

// Get user details
router.get("/user/getdetails", authenticateToken, getUserDetails);

// Update user password
router.put("/user/update-password", updateUserPassword);

// Update user general details
router.put("/user/update-general-details", authenticateToken, updateUserGeneralDetails);

// Update user contact details
router.put("/user/update-contact-details", authenticateToken, updateUserContactDetails);

// Update user professional details
router.put("/user/update-professional-details", authenticateToken, updateUserProfessionalDetails);
router.post("/user/check-user-handle", checkUserHandle); // registration process, open routing
module.exports = router;
