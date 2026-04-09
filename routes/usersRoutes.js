const express = require("express");
const router = express.Router();
const path = require("path");
const {
  register,
  login,
  getTokenStatus,
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

router.get("/tokenstatus", getTokenStatus);


router.post("/user/register", register);

router.post("/user/login", login);

/**
 * @deprecated
 */
router.post("/user/refreshToken", refreshToken);

router.get("/user/getprofile", authenticateToken, getprofile);

router.get('/user/getprofileimage/:userId',authenticateToken, getProfileImage);

router.get("/user/getuserprofile", authenticateToken, getUserProfile);

router.post("/user/follow", authenticateToken, follow);

router.get("/user/socials", authenticateToken, getSocials);
router.post("/user/forgotpassword", sendOTPForForgotPassword);

router.post("/user/verifyOtp", checkOtp);
router.post("/user/verifypassword", verifyOtpForForgotPassword);


router.post("/user/delete", deleteByUser);

router.get("/delete-account", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login-user.html"));
});

/**
 * @deprecated
 */
router.post("/admin/deleteUser", deleteByAdmin);

router.get("/user/verifyEmail", verifyEmail);


router.post("/user/verifyEmail", Sendverifymail);

router.post("/user/resend-verification-mail", resendVerificationEmail);

router.post("/user/logout", authenticateToken, logout);


router.post(
  "/user/update-profile-image",
  authenticateToken,
  updateProfileImage
);

router.get("/user/getdetails", authenticateToken, getUserDetails);


router.put("/user/update-password", updateUserPassword);

router.put("/user/update-general-details", authenticateToken, updateUserGeneralDetails);

router.put("/user/update-contact-details", authenticateToken, updateUserContactDetails);

router.put("/user/update-professional-details", authenticateToken, updateUserProfessionalDetails);

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
