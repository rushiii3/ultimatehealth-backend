const User = require("../../models/UserModel");
const UnverifiedUser = require("../../models/UnverifiedUserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const createUser = async ({
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
}) => {
    const newUser = new User({
        user_name: user_name,
        user_handle: user_handle,
        email: email,
        password: password,
        isDoctor: isDoctor,
        specialization: specialization,
        qualification: qualification,
        Years_of_experience: Years_of_experience,
        contact_detail: contact_detail,
        Profile_image: Profile_image,
        isVerified: true
    });

    await newUser.save();

    if (newUser) {
        return newUser;
    }
    return null;
}

const createUnverifiedUser = async ({
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
}) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a verification token

    const verificationToken = jwt.sign({ email }, jwt_secret, {
        expiresIn: "1h",
    });

    const newUser = new UnverifiedUser({
        user_name: user_name,
        user_handle: user_handle,
        email: email,
        password: hashedPassword,
        isDoctor: isDoctor,
        specialization: specialization,
        qualification: qualification,
        Years_of_experience: Years_of_experience,
        contact_detail: contact_detail,
        Profile_image: Profile_image,
        verificationToken
    });

    await newUser.save();

    if (newUser) {
        return verificationToken;
    }
    return null;
}

const findUnverifiedUserByEmail = async (email) => {

    if (!email) return null;
    const user = await UnverifiedUser.findOne({ email: email });

    return user;
}

const findUnverifiedUserByHandle = async (user_handle) => {

    if (!user) return null;
    const user = await UnverifiedUser.findOne({ user_handle: user_handle });
    return user;
}

const findUnverifiedUserById = async (_id) => {

    const user = await UnverifiedUser.findById(_id);

    return user;
}

const findUserByEmail = async (email) => {

    if (!email) return null;
    const user = await User.findOne({ email: email });

    return user;
}

const findUserByHandle = async (user_handle) => {

    if (!user) return null;
    const user = await User.findOne({ user_handle: user_handle });
    return user;
}

const findUserById = async (_id) => {

    const user = await User.findById(_id);

    return user;
}

const getMyProfile = async (userId) => {

    const user = await User.findOne({ _id: userId })
        .populate({
            path: "articles",
            populate: { path: "tags" },
        })
        .populate({
            path: "savedArticles",
            populate: { path: "tags" },
        })
        .populate({
            path: "repostArticles",
            populate: { path: "tags" },
        })
        .exec();
    return user;
}

const getPublicProfile = async (userId, userHandle) => {

    let user;

    if (userId) {

        user = await User.findById(userId)
            .populate({
                path: "articles",
                match: { status: 'published' },
                populate: { path: "tags" },
            })
            .populate({
                path: "repostArticles",
                populate: { path: "tags" },
            })
            .populate({
                path: "improvements",
                populate: { path: "tags" },
            })
            .exec();
    }
    else if (userHandle) {

        user = await User.findOne({ user_handle: userHandle }).populate({
            path: "articles",
            match: { status: 'published' },
            populate: { path: "tags" },
        })
            .populate({
                path: "repostArticles",
                populate: { path: "tags" },
            })
            .exec();
    }

    if (!user) return null;
    const {
        password,
        refreshToken,
        verificationToken,
        otp,
        otpExpires,
        ...publicProfile
    } = user._doc;

    return publicProfile;
}

const checkExistingUser = async ({ email, user_handle }) => {

    const exitingEmail = await findUserByEmail(email);
    const existingUnverifiedEmail = await findUnverifiedUserByEmail(email);
    const existingUserHandle = await findUserByHandle(user_handle);
    const existingUnverifiedByHandle = await findUnverifiedUserByHandle(user_handle);

    return exitingEmail || existingUserHandle || existingUnverifiedEmail || existingUnverifiedByHandle;
}

const isSamePassword = async (userPassword, newPassword) => {
    return await bcrypt.compare(userPassword, newPassword);
}

const updateUserPassword = async (user, newPassword) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

}

const updateUserOtp = async (user, otp, otpExpires) => {
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
}

const loginUser = async (user, refreshToken, fcmToken) => {

    user.refreshToken = refreshToken;
    user.fcmToken = fcmToken;
    await user.save();
}

const deleteUserByEmail = async (email) => {
    await User.deleteOne({ email: email });
}

const followUser = async (userId, targetUserId) => {

    const user = await User.findById(userId);
    const userToFollow = await User.findById(targetUserId);

    user.followings.push(userToFollow._id);
    user.followingCount += 1;
    await user.save();

    userToFollow.followers.push(user._id);
    userToFollow.followerCount += 1;
    await userToFollow.save();
}

const unfollowUser = async (userId, targetUserId) => {

    const user = await User.findById(userId);
    const userToFollow = await User.findById(targetUserId);

    await user.followings.pull(userToFollow._id);
    user.followingCount = Math.max(0, user.followingCount - 1);
    await user.save();

    await userToFollow.followers.pull(user._id);
    userToFollow.followerCount = Math.max(0, userToFollow.followerCount - 1);
    await userToFollow.save();
}
module.exports = {
    createUser,
    createUnverifiedUser,
    findUnverifiedUserByEmail,
    findUnverifiedUserByHandle,
    findUnverifiedUserById,
    findUserByEmail,
    findUserByHandle,
    findUserById,
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
}
// Left
// 1. Update User
// 2. Delete User
// 3. Delete Unverified User



