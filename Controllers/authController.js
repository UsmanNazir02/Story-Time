const { generateResponse, parseBody, generateRandomOTP } = require('../utils');
const {
    createUser,
    findUser,
    generateToken,
    updateUser,
    generateRefreshToken,
    generateResetToken,
} = require('../models/userModel');
const { STATUS_CODES, ROLES } = require('../utils/constants');
const { registerUserValidation, loginUserValidation, sendCodeValidation, codeValidation, resetPasswordValidation, refreshTokenValidation } = require('../validations/authValidation');
const { compare, hash } = require('bcrypt');
const { deleteOTPs, addOTP, getOTP } = require('../models/otpModel');
const { sendEmail } = require('../utils/mailer');

exports.register = async (req, res, next) => {
    const body = parseBody(req.body);

    // Joi validation
    const registrationValidationResult = registerUserValidation.validate(body);
    if (registrationValidationResult.error) {
        return next({
            statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
            message: registrationValidationResult.error.details[0].message
        });
    }

    body.completePhone = body.phoneCode + body.phoneNo;

    if (body.role === ROLES.USER) body.isVerified = true;
    else body.isVerified = false;

    try {
        const userWithEmail = await findUser({ email: body?.email, isDeleted: false });
        const userWithPhone = await findUser({ completePhone: body?.completePhone, isDeleted: false });

        if (userWithEmail && userWithPhone) return next({
            statusCode: STATUS_CODES.CONFLICT,
            message: 'Both email and phone already exist'
        });
        else if (userWithEmail) return next({
            statusCode: STATUS_CODES.CONFLICT,
            message: 'Email already exists'
        });
        else if (userWithPhone) return next({
            statusCode: STATUS_CODES.CONFLICT,
            message: 'Phone already exists'
        });

        // create user in db
        let newUser = await createUser(body);

        // Hash passwords and update password information
        const hashedPassword = await hash(body.password, 10);
        body.password = hashedPassword;
        const hashedRetypePassword = await hash(body.confirmPassword, 10);
        body.confirmPassword = hashedRetypePassword;
        const updatedUserPassword = await updateUser({ _id: newUser._id }, { $set: body });

        const accessToken = generateToken(updatedUserPassword);
        const refreshToken = generateRefreshToken(updatedUserPassword);

        req.session.accessToken = accessToken;

        const user = await updateUser({ _id: updatedUserPassword._id }, { $set: { refreshToken } });
        const response = { user, accessToken, refreshToken };
        console.log('Register response:', response);
        generateResponse(response, 'Register successful', res);
    } catch (error) {
        next(error);
    }
}

exports.login = async (req, res, next) => {
    const body = parseBody(req.body);

    // Joi validation
    const { error } = loginUserValidation.validate(body)
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        let user = await findUser({ email: body?.email, isDeleted: false }).select('+password');
        if (!user) return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'Invalid Email or Password'
        })

        const isMatch = await compare(body.password, user.password);
        if (!isMatch) return next({
            statusCode: STATUS_CODES.UNAUTHORIZED,
            message: 'Invalid password'
        });

        const accessToken = generateToken(user)
        const refreshToken = generateRefreshToken(user)

        req.session.accessToken = accessToken;

        //update user fcmToken
        user = await updateUser({ _id: user._id }, {
            $set: { fcmToken: body.fcmToken, refreshToken }
        })
        generateResponse({ user, accessToken, refreshToken }, 'Login Successful', res);

    } catch (error) {
        next(error);
    }

}

// logout user
exports.logout = async (req, res, next) => {
    req.session = null;
    generateResponse(null, 'Logout successful', res);
}

exports.sendVerificationCode = async (req, res, next) => {
    const body = parseBody(req.body);

    // Joi Validation
    const { error } = sendCodeValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].error
    });

    const { email, completePhone } = body;
    let query = {
        isDeleted: false,
        $or: []
    };

    if (email) {
        query.$or.push({ email });
    }

    if (completePhone) {
        
        query.$or.push({ completePhone});
    }
    console.log("Phone:",completePhone);

    if (query.$or.length === 0) {
        return next({
            statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
            message: 'Either email or phone is required.'
        });
    }

    try {
        const user = await findUser(query).select('email completePhone');
        if (!user) {
            return next({
                statusCode: STATUS_CODES.NOT_FOUND,
                message: 'Invalid Information, Record Not Found!'
            });
        }

        // Delete all previous OTPs
        await deleteOTPs(query);

        const otpObj = await addOTP({
            email: user.email,
            completePhone: user.completePhone,
            otp: generateRandomOTP(),
        });

        if (email) {
            console.log(`Your OTP Code is ${otpObj.otp}`);
            //await sendEmail({ email, subject: 'Verification Code', message: `Your OTP Code is ${otpObj.otp}` });
        } else if (completePhone) {
            console.log(`Your OTP Code is ${otpObj.otp}`);
        }

        generateResponse({ code: otpObj.otp }, 'Code is Generated Successfully', res);

    } catch (error) {
        next(error);
    }
};


exports.verifyCode = async (req, res, next) => {
    const body = parseBody(req.body);

    //Joi Validation
    const { error } = codeValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].error
    })

    try {
        const otpObj = await getOTP({ otp: body.code })
        if (!otpObj) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Invalid OTP'
        })

        if (otpObj.isExpired()) return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'OTP expired'
        });

        const user = await findUser({
            isDeleted: false,
            $or: [{ email: otpObj.email }]
        });

        // throw error if user not found
        if (!user) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'User not found'
        });

        const accessToken = generateResetToken(user);
        generateResponse({ accessToken }, 'Code is verified successfully', res);


    } catch (error) {
        next(error)
    }
}

exports.resetPassword = async (req, res, next) => {
    const userId = req.user.id
    const body = parseBody(req.body);

    // Joi validation
    const { error } = resetPasswordValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        const hashedPassword = await hash(body.newPassword, 10);
        const retypehashedPassword = await hash(body.confirmPassword, 10);
        
        const user = await updateUser(
            { _id: userId },
            { $set: { password: hashedPassword, confirmPassword: retypehashedPassword } }
        );
    
        generateResponse(user, 'Password reset successfully', res);
    } catch (error) {
        next(error);
    }
    
}

// get refresh token
exports.getRefreshToken = async (req, res, next) => {
    const body = parseBody(req.body);

    // Joi validation
    const { error } = refreshTokenValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        const user = await findUser({ refreshToken: body.refreshToken, isDeleted: false }).select('+refreshToken');
        if (!user) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Invalid token'
        });

        const accessToken = generateToken(user);
        const newRefreshToken = generateRefreshToken(user);
        req.session.accessToken = accessToken;

        // update user with fcmToken
        const updatedUser = await updateUser({ _id: user._id }, { $set: { refreshToken: newRefreshToken } });

        if (!updatedUser) return next({
            statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: 'Refresh token update failed'
        });

        generateResponse({ accessToken, refreshToken: newRefreshToken }, 'Token refreshed', res);
    } catch (error) {
        next(error);
    }
}
