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
 *       - User
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
 *       - User
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
/**
 * @swagger
 * /user/getuserprofile:
 *   get:
 *     summary: Get user profile by ID or handle
 *     tags:
 *       - User
 *     description: |
 *       Retrieve a public user profile by either user ID or handle. 
 *       Requires authentication via Bearer token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: false
 *         description: The MongoDB ObjectId of the user.
 *       - in: query
 *         name: handle
 *         schema:
 *           type: string
 *         required: false
 *         description: The unique handle/username of the user.
 *     responses:
 *       200:
 *         description: Successful response with user public profile
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
 *                   description: Public user profile data (excluding sensitive fields)
 *       400:
 *         description: Missing both user ID and handle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User handle or id is required.
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: User is blocked or banned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is blocked or banned
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An unexpected error occurred
 */
router.get("/user/getuserprofile", authenticateToken, getUserProfile);

/**
 * @swagger
 * /user/follow:
 *   post:
 *     summary: Follow or unfollow a user
 *     description: >
 *       Allows the authenticated user to follow or unfollow another user.
 *       You can follow someone either via their article ID (to follow the article's author) or directly using their user ID.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               articleId:
 *                 type: integer
 *                 example: 123
 *                 description: ID of the article whose author you want to follow
 *               followUserId:
 *                 type: string
 *                 format: uuid
 *                 example: "64aebc7d3f7f5b2fc8c12e01"
 *                 description: ID of the user to follow directly
 *     responses:
 *       200:
 *         description: Successfully followed or unfollowed the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Follow successfully
 *                 followStatus:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request (e.g., following yourself, missing IDs, blocked/banned user)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: You cannot follow or unfollow yourself
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Resource not found (e.g., article or user not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
// Follow and Unfollow Routes
router.post("/user/follow", authenticateToken, follow);

/**
 * @swagger
 * /user/socials:
 *   get:
 *     summary: Get followers, followings, or contributors
 *     description: >
 *       Fetches social connections of a user (followers, followings) or contributors of an article.
 *       Requires authentication.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *         description: >
 *           Type of social data to fetch:
 *           - 1: Followers
 *           - 2: Followings
 *           - 3: Contributors (used only when `articleId` is provided). Contributors are users who helped improve the article.
 *       - in: query
 *         name: articleId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID of the article to get contributors for
 *       - in: query
 *         name: social_user_id
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID whose followers or followings you want to fetch. If omitted, uses the logged-in user.
 *     responses:
 *       200:
 *         description: Successfully fetched social data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         example: "64aebc7d3f7f5b2fc8c12e01"
 *                       user_name:
 *                         type: string
 *                         example: "john_doe"
 *                       Profile_image:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                       followers:
 *                         type: array
 *                         items:
 *                           type: string
 *         examples:
 *           application/json:
 *             value:
 *               followers:
 *                 - user_id: "64aebc7d3f7f5b2fc8c12e01"
 *                   user_name: "john_doe"
 *                   Profile_image: "https://example.com/image.jpg"
 *                   followers: ["user_id_1", "user_id_2"]
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid request
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Resource not found (e.g., article or user not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Author not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

router.get("/user/socials", authenticateToken, getSocials);
// Forget password

/**
 * @swagger
 * /user/forgotpassword:
 *   post:
 *     summary: Send OTP for forgot password
 *     description: Sends an OTP to the user's email address for password reset. Works for both users and verified admins.
 *     tags:
 *       - User-Admin
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
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent to your email.
 *                 otp:
 *                   type: string
 *                   example: "123456"
 *       400:
 *         description: Bad request (e.g., user/admin not found or admin not verified)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/user/forgotpassword", sendOTPForForgotPassword);

/**
 * @swagger
 * /user/verifyOtp:
 *   post:
 *     summary: Check OTP validity
 *     description: Verifies if the provided OTP is valid for the given email. Works for both users and admins.
 *     tags:
 *       - User-Admin
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
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP is valid.
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/user/verifyOtp", checkOtp);
// verify password

/**
 * @swagger
 * /user/verifypassword:
 *   post:
 *     summary: Reset password using OTP
 *     description: Resets the password if the provided OTP is valid and new password is different from the old one.
 *     tags:
 *       - User-Admin
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
 *                 example: user@example.com
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewStrongPassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful.
 *       400:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       402:
 *         description: New password is the same as old password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/user/verifypassword", verifyOtpForForgotPassword);


/**
 * @swagger
 /user/delete:
  delete:
    summary: Delete user account
    description: >
      Allows an authenticated and verified user to permanently delete their own account.
      The API accepts authentication token via cookies (`token`) or the `Authorization: Bearer <token>` header.
      User must provide correct password for identity confirmation.
    tags:
      - User
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - password
            properties:
              password:
                type: string
                example: "userPassword123"
    responses:
      "200":
        description: Account successfully deleted
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: boolean
                  example: true
                message:
                  type: string
                  example: "account has been removed from database"
      "401":
        description: Authorization token missing or invalid password
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: string
                  example: "Invalid password"
      "403":
        description: Email not verified
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: string
                  example: "Email not verified. Please check your email."
      "404":
        description: User not found
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: string
                  example: "User not found"
      "500":
        description: Server error
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: string
                  example: "Internal server error"
*/
router.post("/user/delete", deleteByUser);

router.get("/delete-account", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "delete-account-user.html"));
});

/**
 * @deprecated
 */
router.post("/admin/deleteUser", deleteByAdmin);

/**
 * @openapi
 * /user/verifyEmail:
 *   get:
 *     summary: Verify User Email
 *     description: |
 *       This endpoint verifies the email address of a user or an admin based on the provided verification token.
 *       
 *       - If `isAdmin=true`, it verifies the email of an existing admin account by marking it as verified.
 *       - If `isAdmin=false` or not provided, it verifies a regular user by migrating them from the UnverifiedUser collection to the verified User collection.
 *       
 *       This process ensures that the email is valid, registered, and belongs to a real user. It helps confirm the authenticity of the account.
 *       A successful verification returns a confirmation HTML page.
 *     tags:
 *       [User]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token received via email for account verification.
 *       - in: query
 *         name: isAdmin
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Optional flag to indicate if the verification is for an admin.
 *     responses:
 *       200:
 *         description: Email verified successfully – returns an HTML confirmation page.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body>Email Verified</body></html>"
 *       201:
 *         description: Informational response – user not found or already verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found, register yourself first
 *       400:
 *         description: Missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token is missing
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
router.get("/user/verifyEmail", verifyEmail);


/**
 * @openapi
 * /user/verifyEmail:
 *   post:
 *     summary: Send verification email
 *     description: |
 *       Sends a verification email to either a new user or an admin after registration.
 *       
 *       - Accepts an email and a JWT token.
 *       - If `isAdmin=true`, it targets an existing admin account.
 *       - If `isAdmin=false` or not provided, it targets a user in the UnverifiedUser collection.
 *       - Implements a cooldown mechanism to prevent multiple verification emails from being sent within a short time window (1 hour). This helps avoid spamming the user's inbox and reduces unnecessary email traffic.
 *       - During this 1 hour, you cannot request a new verification email.
 *
 *     tags: [User]
 *   
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               token:
 *                 type: string
 *                 example: your.jwt.token.here
 *               isAdmin:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Verification email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent
 *       400:
 *         description: Missing required fields or user not found/already verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found or already verified
 *       429:
 *         description: Rate limit – verification email already sent recently.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email already sent
 */
router.post("/user/verifyEmail", Sendverifymail);

/**
 * @openapi
 * /user/resend-verification-mail:
 *   post:
 *     summary: Resend verification email
 *     description: |
 *       This endpoint allows users or admins to request a new verification email in case the original link was missed, expired, or not received.
 *       
 *       - This is only applicable to accounts that are not yet verified.
 *       - If the account is already verified, the request will be rejected.
 *       - A new verification token is generated and sent via email.
 *       
 *       This feature is helpful when users are unable to access the application due to unverified email status. However, to prevent abuse or email spamming, a cooldown period is enforced.
 *       
 *       **Cooldown Rule:** Once a verification email is sent, you must wait 1 hour before requesting another one.
 *     
 *     tags: [User]
 *       
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               isAdmin:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Verification email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent
 *       400:
 *         description: User not found or already verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found or already verified
 *       429:
 *         description: Too many requests — verification email already sent recently.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email already sent
 */
router.post("/user/resend-verification-mail", resendVerificationEmail);

/**
 * @openapi
 * /user/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the currently authenticated user by blacklisting the refresh token and clearing cookies.
 *     tags: [User]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized Invalid token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/user/logout", authenticateToken, logout);


/**
 * @swagger
 * /user/update-profile-image:
 *   post:
 *     summary: Update user's profile image
 *     description: >
 *       Allows an authenticated user to update their profile image URL.
 *       The user must not be banned or blocked.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profileImageUrl
 *             properties:
 *               profileImageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/images/profile.jpg
 *     responses:
 *       200:
 *         description: Profile image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile image updated successfully.
 *                 Profile_image:
 *                   type: string
 *                   format: uri
 *                   example: https://example.com/images/profile.jpg
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User ID and profile image URL are required.
 *       403:
 *         description: User is blocked or banned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is banned or blocked.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post(
  "/user/update-profile-image",
  authenticateToken,
  updateProfileImage
);

// Get user details

/**
 * @openapi
 * /user/getdetails:
 *   get:
 *     summary: Get user details
 *     description: |
 *       Retrieves the profile information of the currently authenticated user.
 *       
 *       - Requires a valid JWT access token in the Authorization header.
 *       - The user's email must be verified to access this route.
 *       - Returns user details if authenticated and verified.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
 *         content:
 *           application/json:
 *             schema:
 *             type: object
 *             properies:
 *               status:
 *                  type: boolean
 *                  example: true
 *               profile:
 *                   type: object
 *                   $ref: '#/components/schemas/User'
 *                   description: User Public Profile (Excluding Sensitive Info)
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
router.get("/user/getdetails", authenticateToken, getUserDetails);


/**
 * @swagger
 * /user/update-password:
 *   put:
 *     summary: Update User Password
 *     description: Allows a user to update their password by providing the old and new password.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - old_password
 *               - new_password
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64f213f9e0f35d7f30b9d111"
 *               old_password:
 *                 type: string
 *                 example: "OldPass123"
 *               new_password:
 *                 type: string
 *                 example: "NewPass456"
 *     responses:
 *       200:
 *         description: Password successfully updated
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
 *         description: Bad request (e.g., missing fields, password too short, same as old password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing passwords and user id
 *       401:
 *         description: Unauthorized (e.g., invalid old password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid old password
 *       403:
 *         description: Forbidden (e.g., user is banned or blocked)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is banned or blocked.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */
router.put("/user/update-password", updateUserPassword);

// Update user general details
/**
 * @swagger
 * /user/update-general-details:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user general details
 *     description: Update the general details of a logged-in user. This is a protected route.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - userHandle
 *               - email
 *               - about
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *                 description: The user's full name
 *               userHandle:
 *                 type: string
 *                 example: john123
 *                 description: The user's unique handle/username
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *                 description: The user's email address
 *               about:
 *                 type: string
 *                 example: Software developer and tech enthusiast.
 *                 description: A brief description about the user
 *     responses:
 *       200:
 *         description: User details updated successfully
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
 *                   example: User details updated successfully
 *       400:
 *         description: Bad request - missing fields or email/user handle already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Please provide all required fields
 *       401:
 *         description: Unauthorized - user is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - user is banned or blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is banned or blocked.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       409:
 *         description: Conflict - duplicate email or user handle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email or user handle already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 *
 */

router.put("/user/update-general-details", authenticateToken, updateUserGeneralDetails);

// Update user contact details

/**
 * @swagger
 * /user/update-contact-details:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user contact details
 *     description: Update the contact details (email and phone) of the logged-in user. Protected route.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *                 description: The user's email address
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *                 description: The user's phone number
 *     responses:
 *       200:
 *         description: User contact updated successfully
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
 *                   example: User contact updated successfully
 *       400:
 *         description: Bad request - missing fields or email/phone already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Please provide all required fields
 *       401:
 *         description: Unauthorized - user is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - user is banned or blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is banned or blocked.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       409:
 *         description: Conflict - duplicate email or phone number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email or user handle already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 *
 */

router.put("/user/update-contact-details", authenticateToken, updateUserContactDetails);

// Update user professional details
/**
 * @swagger
 * /user/update-professional-details:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user professional details
 *     description: Update the professional details of the logged-in user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specialization
 *               - qualification
 *               - experience
 *             properties:
 *               specialization:
 *                 type: string
 *                 example: Cardiology
 *                 description: The user's area of specialization
 *               qualification:
 *                 type: string
 *                 example: MBBS, MD
 *                 description: The user's professional qualification(s)
 *               experience:
 *                 type: number
 *                 example: 10
 *                 description: Years of professional experience
 *     responses:
 *       200:
 *         description: User details updated successfully
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
 *                   example: User details updated successfully
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Please provide all required fields
 *       401:
 *         description: Unauthorized - user is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - user is banned or blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User is banned or blocked.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 *
 */

router.put("/user/update-professional-details", authenticateToken, updateUserProfessionalDetails);

/**
 * @swagger
 * /user/check-user-handle:
 *   post:
 *     tags:
 *       - User
 *     summary: Check if a user handle is unique
 *     description: Checks whether a user handle already exists in the system (including verified users, unverified users, and admins).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userHandle
 *             properties:
 *               userHandle:
 *                 type: string
 *                 example: john_doe
 *                 description: The user handle to be checked
 *     responses:
 *       200:
 *         description: Successfully checked the user handle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                   description: Indicates whether the handle is already taken
 *                 message:
 *                   type: string
 *                   example: User handle is available.
 *       400:
 *         description: Bad request - user handle not provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User handle is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/user/check-user-handle", checkUserHandle); 



/**
 * @later
 */

// Get user with articles
router.get("/user/articles", authenticateToken, getUserWithArticles);

/**
 * @later
 */
// Get user liked and saved articles
router.get(
  "/user/liked-saved-articles",
  authenticateToken,
  getUserLikeAndSaveArticles
);

module.exports = router;
