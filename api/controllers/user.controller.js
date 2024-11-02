const User = require("../models/users");
const ErrorHandler = require("../exceptions/ErrorHandler")
const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const sendToken = require("../utils/jwtToken");
const sendMail = require("../utils/sendEmail");
const crypto = require('crypto');

const getUerProfile = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).populate({
        path : "jobPublished",
        select : "title postingDate"
    });

    res.status(200).json({
        success: true,
        data: user
    })

});

const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isMatchd = await user.comparePassword(req.body.currentPassword);
    if (!isMatchd) {
        return next(new ErrorHandler("Old Password is incorrect.", 401))
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res, req);

})

const updateUser = catchAsyncErrors(async(req, res, next)=>{

    const newUserData = {
        name : req.body.name,
        email : req.body.email,
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new : true,
        runValidators : true
    })

    res.status(200).json({
        success: true,
        data: user
    })

});

// delete current user => api/v1/me/delete
const deleteUser = catchAsyncErrors( async(req,res,next)=>{

    const user = await User.findByIdAndDelete(req.user.id);

    res.cookie("token","none",{
        expires : new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message : "Your account has been deleted."
    })
})
module.exports = {
    getUerProfile,
    updatePassword,
    updateUser,
    deleteUser
}