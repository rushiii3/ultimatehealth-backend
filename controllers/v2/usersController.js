const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const UnverifiedUser = require("../models/UnverifiedUserModel");
const { verifyUser } = require("../middleware/authMiddleware");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const moment = require("moment");
const Article = require("../models/Articles");
const adminModel = require("../models/admin/adminModel");
const BlacklistedToken = require('../models/blackListedToken');
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();

const {
  createUnverifiedUser,
  findUserById,
  findUnverifiedUserByEmail,
  findUnverifiedUserByHandle,
  findUserByEmail,
  findUserByHandle,
  checkExistingUser,
  getMyProfile,
  getPublicProfile,
  isSamePassword,
  updateUserPassword,
  updateUserOtp,
  loginUser,
  deleteUserByEmail,
  followUser,
  unfollowUser
} = require('../../services/db/userService');

const { findAdminByEmail, findAdminByHandle, updateAdminOtp } = require('../../services/db/adminService');
const { generateAccessToken, verifyToken } = require('../../services/security/tokenService');
const { blackListToken } = require('../../services/db/dbTokenService');

const { findArticleById } = require('../../services/db/articleService');
const { sendOtpMail } = require("../emailservice");


module.exports.register = expressAsyncHandler(
  async (req, res) => {
    try {
      const {
        user_name,
        user_handle,
        email,
        isDoctor,
        Profile_image,
        password,
        qualification,
        specialization,
        Years_of_experience,
        contact_detail,
      } = req.body;

      if (!user_name || !user_handle || !email || !password) {
        return res
          .status(400)
          .json({ error: "Please provide all required fields" });
      }


      const [existingUser, existingAdmin] =
        await Promise.all([
          await checkExistingUser({
            email: email,
            user_handle: user_handle
          }),
          await findAdminByEmail(email)
        ]);

      if (existingUser || existingAdmin) {
        return res.status(400).json({ error: "Email or user handle already in use" });
      }

      // Generate a verification token

      const jwt_secret = process.env.JWT_SECRET;

      const verificationToken = await createUnverifiedUser({
        user_name,
        user_handle,
        email,
        isDoctor,
        Profile_image,
        password,
        qualification,
        specialization,
        Years_of_experience,
        contact_detail,
        jwt_secret
      });

      if (verificationToken == null) {
        return res.status(400).json({ error: "Error creating  user" });
      } else {
        res.status(201).json({
          message: "Registration successful. Please verify your email.",
          token: verificationToken,
        });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ error: error.message });
    }
  }
)

module.exports.checkUserHandle = expressAsyncHandler(

  async (req, res) => {
    const userHandle = req.body.userHandle;

    if (!userHandle) {
      return res.status(400).json({ error: "User handle is required" });
    }

    try {

      const [user, unverifiedUser, admin] = await Promise.all([
        findUserByHandle(userHandle),
        findUnverifiedUserByHandle(userHandle),
        findAdminByHandle(userHandle)
      ])


      if (user || unverifiedUser || admin) {
        return res.status(200).json({ status: true, message: "User handle already exists" });
      }

      return res.status(200).json({ status: false, message: 'User handle is available.' });

    } catch (err) {
      console.error("Error checking user handle:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
)

module.exports.getprofile = expressAsyncHandler(
  async (req, res) => {
    try {
      const user = await getMyProfile(req.userId)
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (!user.isVerified) {
        return res
          .status(403)
          .json({ error: "Email not verified. Please check your email." });
      }
      res.json({ status: true, profile: user });
    } catch (error) {
      console.error("Error getting user profile:", error);
      res.status(500).json({ error: error.message });
    }
  }
)

module.exports.getUserProfile = expressAsyncHandler(
  async (req, res) => {
    try {
      const userId = req.query.id;
      const userHandle = req.query.handle;

      if (!userHandle && !userId) {
        return res.status(400).json({ error: "User handle or id is required." });
      }

      let user = await getPublicProfile(userId, userHandle);


      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.isBlockUser || user.isBannedUser) {
        return res.status(403).json({ error: "User is blocked or banned" });
      }

      res.json({ status: true, profile: user });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  }
)

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

module.exports.sendOTPForForgotPassword = expressAsyncHandler(
  async (req, res) => {

    try {
      const { email } = req.body;
      const [user, admin] = await Promise.all([
        findUserByEmail(email),
        findAdminByEmail(email),
      ]);

      if (!user && !admin) {
        return res
          .status(400)
          .json({ message: "User with this email does not exist." });
      }

      const otp = generateOTP();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      if (user) {
        await updateUserOtp(user, otp, otpExpires);
      } else {

        if (!admin.isVerified) {
          return res.status(400).json({ message: "Admin is not verified." });
        }
        await updateAdminOtp(admin, otp, otpExpires);
      }
      const result = await sendOtpMail(email, otp);
      if (result) {
        return res.status(200).json({ message: "OTP sent to your email." });
      } else {
        return res.status(500).json({ message: "Error sending OTP email." });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


module.exports.verifyOtpForForgotPassword = expressAsyncHandler(
  async (req, res) => {

    const { email, newPassword } = req.body;

    try {
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      const isPasswordSame = await isSamePassword(user.password, newPassword);

      if (isPasswordSame) {
        return res
          .status(402)
          .json({ message: "New password should not be same as old password." });
      }

      await updateUserPassword(user, newPassword);

      res.status(200).json({ message: "Password reset successful." });

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
)

module.exports.checkOtp = expressAsyncHandler(
  async (req, res) => {
    const { email, otp } = req.body;
    try {
      const [user, admin] = await Promise.all([
        findUserByEmail(email),
        findAdminByEmail(email)
      ]);

      if (!user && !admin) {
        return res.status(401).json({ message: "User not found" });
      }
      if (user) {

        if (user.otp !== otp || user.otpExpires < Date.now()) {
          return res.status(400).json({ message: "Invalid or expired OTP." });
        }
      } else {

        if (!admin || admin.otp !== otp || admin.otpExpires < Date.now()) {
          return res.status(400).json({ message: "Invalid or expired OTP." });
        }
      }


      res.status(200).json({ message: "OTP is valid." });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports.login = expressAsyncHandler(
  async (req, res) => {
    try {
      const { email, password, fcmToken } = req.body;

      if (!email || !password || !fcmToken) {
        return res
          .status(400)
          .json({ error: "Please provide email and password and FCM Token" });
      }

      let user = await findUserByEmail(email);

      if (!user) {
        user = await findUnverifiedUserByEmail(email);
        if (!user) return res.status(404).json({ error: "User not found" });
        return res
          .status(403)
          .json({ error: "Email not verified. Please check your email." });
      }

      if (!user.isVerified) {
        return res
          .status(403)
          .json({ error: "Email not verified. Please check your email." });
      }

      if (user.isBannedUser || user.isBlockUser) {
        return res.status(403).json({ error: "User is banned or blocked" });
      }

      const isPasswordValid = await isSamePassword(user.password, password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // Blacklist the token
      if (user.refreshToken != null) {
        await blackListToken(user.refreshToken);
      }

      // Generate JWT Access Token
      const accessToken = generateAccessToken(
        { userId: user._id, email: user.email, role: 'user' },
        "15m"
      );

      // Generate Refresh Token
      const refreshToken = generateAccessToken(
        { userId: user._id, email: user.email, role: 'user' },
        "7d"
      );

      await loginUser(user, refreshToken, fcmToken);

      // Set cookies for tokens
      res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 900000 });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 604800000,
      });

      res
        .status(200)
        .json({ user, accessToken, refreshToken, message: "Login Successful" });
    } catch (error) {
      console.log("Login Error", error);
      return res.status(500).json({ error: error.message });
    }
  }
)

module.exports.logout = expressAsyncHandler(
  async (req, res) => {


    try {
      // Find the user and remove the refresh token
      const user = await findUserById(req.userId);

      if (user) {

        // BlackList the token first
        await blackListToken(user.refreshToken);

        user.refreshToken = null;
        await user.save();
      }

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
)

module.exports.refreshToken = expressAsyncHandler(
  async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    try {
      // Verify the refresh token
      const decoded = verifyToken(refreshToken);

      const user = await findUserById(decoded.userId);
      if (!user) {
        return res.status(403).json({ error: "Invalid refresh token" });
      }

      const newAccessToken = generateAccessToken(
        { userId: user._id, email: user.email, role: 'user' },
        "15m"
      );
      const newRefreshToken = generateAccessToken(
        { userId: user._id, email: user.email, role: 'user' },
        "7d"
      );

      user.refreshToken = newRefreshToken;
      await user.save();

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 900000,
      }); // 15 minutes
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: 604800000,
      }); // 7 days

      res
        .status(200)
        .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
      res.status(403).json({ error: "Invalid refresh token" });
    }
  }
)

module.exports.deleteByUser = expressAsyncHandler(
  async (req, res) => {
    let token;
    if (req.cookies && req.cookies["token"]) {
      token = req.cookies["token"];
    } else {
      token = req.headers.authorization?.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }
    try {
      const { password } = req.body;
      const email = await verifyUser(token);
      const user = await findUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.isVerified) {
        return res
          .status(403)
          .json({ error: "Email not verified. Please check your email." });
      }
      const isPasswordValid = await isSamePassword(user.password, password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }
      // console.log("email : ", email + " password  : ", password);
      await deleteUserByEmail(email);
      res.json({
        status: true,
        message: "account has been removed from database",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
)

module.exports.deleteByAdmin = expressAsyncHandler(
  async (req, res) => {
    try {
      const { adminEmail, adminPassword, userEmail } = req.body;
      const admin = await findAdminByEmail(adminEmail);
      if (!admin) res.status(404).json({ message: "user not found" });
      else {
        // console.log(admin);
        const validAdimin = await isSamePassword(
          adminPassword,
          admin.
            adminPassword
        );
        if (!validAdimin) res.status(404).json({ message: "password not match" });

        else {
          const result = await deleteUserByEmail(userEmail);
          res.json({ messge: "user delerted sucessfully", result });
        }
      }
    } catch (error) {
      res.json({ messge: error.message });
    }
  }
)


// follow a user
module.exports.follow = expressAsyncHandler(
  async (req, res) => {
    try {
      const { articleId, followUserId } = req.body;
      if (!articleId && !followUserId) {
        return res.status(400).json({ error: "Article id or follow user id are required" });
      }
      let article;
      if (articleId) {

        article = await findArticleById(Number(articleId));

        if (!article || article.is_removed) {
          return res.status(404).json({ error: "Article not found" });
        }
      }

      if (article && req.userId === article.authorId) {
        return res
          .status(400)
          .json({ message: "You cannot follow or unfollow yourself" });
      }

      // Find the user who is following
      const user = await findUserById(req.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Find the user to be followed
      let userToFollow;
      if (article) {
        userToFollow = await findUserById(article.authorId);
      }
      else {
        userToFollow = await findUserById(followUserId);
      }

      if (!userToFollow)
        return res.status(404).json({ message: "User to follow not found" });

      if (userToFollow.isBlockUser || userToFollow.isBannedUser) {
        return res.status(400).json({ message: "User to follow is blocked or banned" });
      }

      if (user.isBlockUser || user.isBannedUser) {
        return res.status(400).json({ message: "You are blocked or banned" });
      }

      const followerUserset = new Set(
        userToFollow.followers.filter((id) => id).map((id) => id.toString())
      );
      const followingUserSet = new Set(
        user.followings.filter((id) => id).map((id) => id.toString())
      );

      if (
        followerUserset.has(req.userId.toString()) ||
        followingUserSet.has(userToFollow._id.toString())
      ) {
        // Unfollow
        await unfollowUser(user._id, userToFollow._id);
        res.json({ message: "Unfollow successfully", followStatus: false });
      } else {
        // Follow
        await followUser(user._id, userToFollow._id);
        res.json({ message: "Follow successfully", followStatus: true });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
)
// Get Follower
module.exports.getFollowers = expressAsyncHandler(
  async (req, res) => {
    const userId = req.userId;
    const author = await User.findById(userId).
      populate({
        path: "followers",
        select: "user_id user_name followers Profile_image",
        match: {
          isBannedUser: false,
          isBlockUser: false
        }
      }).exec();

    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }

    if (author.followers) {
      author.followers = author.followers.filter(user => user !== null);
    }
    return res.status(200).json({ followers: author.followers });
  }
)
// GET followings
module.exports.getFollowings = expressAsyncHandler(
  async (req, res) => {
    const userId = req.userId;
    const author = await User.findById(userId).
      populate({
        path: "followings",
        select: "user_id user_name followers Profile_image",
        match: {
          isBannedUser: false,
          isBlockUser: false
        }
      }).exec();

    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }
    if (author.followings) {
      author.followings = author.followings.filter(user => user !== null);
    }
    return res.status(200).json({ followers: author.followings });
  }
)
