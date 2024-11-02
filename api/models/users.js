const mongoose = require("mongoose")
const validator = require("validator");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email address'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address']
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'employer'],
            message: 'Please select correct role'
        },
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter password for your account'],
        minlength: [8, 'Your password must be at least 8 characters long'],
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_TIME })
}

userSchema.methods.getJwtRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_TIME })
}
userSchema.methods.comparePassword = async function (passwordEnter) {
    return await bcrypt.compare(passwordEnter, this.password);
}

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {

    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    return resetToken;
}

userSchema.virtual("jobPublished", {
    ref: "Job",
    localField: "_id",
    foreignField: "user",
    justOne: false
})

const USER = mongoose.model("User", userSchema);
USER.createIndexes();
module.exports = USER;