const User = require("../models/users");
const ErrorHandler = require("../exceptions/ErrorHandler")
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const sendToken = require("../utils/jwtToken");
const sendMail = require("../utils/sendEmail");
const crypto = require('crypto');
const jwt = require("jsonwebtoken");


const register = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password, role } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    })

    sendToken(user, 200, res, req);
})

const login = catchAsyncErrors(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email && !password) {
        return next(new ErrorHandler("Email and Password is required."), 400)
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Email or Password is invalid."))
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("Email and Password is invalid."), 400)
    }

    sendToken(user, 200, res, req);

})

const forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("Email is not found."), 404);
    }
    const resetToken = await user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset password url
    const resetUrl = `${req.protocal ? req.protocal + "://" : ""}${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset link is as follow:\n\n ${resetUrl}
    \n\n If you have not request this, then please ignore that.`;

    try {
        await sendMail({
            email: user.email,
            subject: "Password Recovery",
            text: message,
        });

        res.status(200).json({
            success: true,
            message: `Email send successfully to : ${user.email}`
        })
    } catch (error) {

        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;

        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(`Email is not sent.`, 500))
    }

})

// reset password
const resetPassword = catchAsyncErrors(async (req, res, next) => {
    
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler("Password Reset token is invalid.", 400))
    }

    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();


    sendToken(user, 200, res, req);
})

const logout = catchAsyncErrors(async (req, res, next) => {

    res.cookie("token", 'none', {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully."
    })
})

const refreshToken = catchAsyncErrors(async (req, res, next) => {

    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return next(new ErrorHandler("Access Denied. No refresh token provided.", 401));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
        return next(new ErrorHandler("Something whend wrong.", 401));
    }

    sendToken(user, 200, res, req);
})

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword
}