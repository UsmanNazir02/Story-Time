const { query } = require('express');
const { sign } = require('jsonwebtoken');
const { mongoose, Schema, model } = require('mongoose');
const { ROLES } = require('../utils/constants');

const userSchema = new Schema(
    {
        firstName: { type: String, default: null },
        lastName: { type: String, default: null },
        countryCode: { type: String, default: null },
        phoneCode: { type: String, default: null },
        phoneNo: { type: String, default: null },
        completePhone: { type: String, select: false },
        email: { type: String, default: null },
        fcmToken: { type: String, default: null },
        city: { type: String, default: null },
        zipCode: { type: String, default: null },
        state: { type: String, default: null },
        password: { type: String, default: null },
        confirmPassword: { type: String, default: null },
        isVerified: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        fcmToken: { type: String, default: null },
        isActive: { type: Boolean, default: true },
        role: { type: String, default: ROLES.USER, enum: Object.values(ROLES) },
    }, { timestamps: true, versionKey: false }

);

const userModel = model('User', userSchema);

exports.createUser = (obj) => userModel.create(obj);

exports.findUser = (query) => userModel.findOne(query);

exports.updateUser = (query, obj) => userModel.findOneAndUpdate(query, obj);


// generate token
exports.generateToken = (user) => {
    const { JWT_EXPIRATION, JWT_SECRET } = process.env;

    const token = sign({
        id: user._id,
        email: user.email,
        role: user.role,
    }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    return token;
};
// generate refresh token
exports.generateRefreshToken = (user) => {
    const refreshToken = sign({ id: user._id }, process.env.REFRESH_JWT_SECRET, {
        expiresIn: process.env.REFRESH_JWT_EXPIRATION, // Set the expiration time for the refresh token
    });

    return refreshToken;
};

// get FcmToken
exports.getFcmToken = async (userId) => {
    const user = await UserModel.findById(userId).select('fcmToken');
    return user?.fcmToken;
}

exports.generateResetToken = (user) => {
    const { RESET_TOKEN_EXPIRATION, JWT_SECRET } = process.env;

    const token = sign({
        id: user._id,
        email: user.email,
        role: user.role,
    }, JWT_SECRET, { expiresIn: RESET_TOKEN_EXPIRATION });

    return token;
};


exports.findMembers = async (email) => {
    const user = await userModel.findOne({ email: { $regex: `^${email}@`, $options: 'i' }, isDeleted: false });
    return user;
  };