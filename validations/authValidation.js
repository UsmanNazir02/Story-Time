const Joi = require('joi');
const { ROLES } = require('../utils/constants');

exports.registerUserValidation = Joi.object({
    email: Joi.string().email().required(),
    phoneCode: Joi.string().regex(/^\+\d*$/).min(2).max(4).required().messages({
        'string.pattern.base': 'phone code is not valid.',
        'string.min': 'phone code must be at least {#limit} characters long.',
        'string.max': 'phone code must be at most {#limit} characters long.',
        'any.required': 'phone code is required.',
    }),
    // regex like 'PK', 'US' length is 2
    countryCode: Joi.string().regex(/^[A-Z]{2}$/).length(2).required().messages({
        'string.pattern.base': 'country code is not valid.',
        'any.required': 'country code is required.',
    }),

    phoneNo: Joi.string().regex(/^\d*$/).min(7).max(14)
        .required().messages({
            'string.pattern.base': 'phone number is not valid.',
            'string.min': 'phone number must be at least {#limit} characters long.',
            'string.max': 'phone number must be at most {#limit} characters long.',
            'any.required': 'phone number is required.',
        }),

    fcmToken: Joi.string().required(),
    role: Joi.string().valid(ROLES.USER).required(),
    firstName: Joi.string().regex(/^[a-zA-Z]+[0-9]*$/).min(3).max(30).required().messages({
        "string.pattern.base": "First name is not valid.",
        "string.min": "First name must be at least {#limit} characters long.",
        "string.max": "First name must be at most {#limit} characters long.",
        "any.required": "First name is required.",
    }),
    lastName: Joi.string().regex(/^[a-zA-Z]+[0-9]*$/).min(3).max(30).required().messages({
        "string.pattern.base": "Last name is not valid.",
        "string.min": "Last name must be at least {#limit} characters long.",
        "string.max": "Last name must be at most {#limit} characters long.",
        "any.required": "Last name is required.",
    }),
    zipCode: Joi.string().pattern(/^\d{5}$/).required(),
    city: Joi.string().min(2).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(8).max(30).required(),
    confirmPassword: Joi.string().min(1).max(30).required(),
});

exports.loginUserValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).required(),
    fcmToken: Joi.string().required(),
});

exports.sendCodeValidation = Joi.object({
    email: Joi.string().email().optional(),
    completePhone: Joi.string().optional()

})

exports.codeValidation = Joi.object({
    code: Joi.string().min(6).max(6).required(),
});

exports.resetPasswordValidation = Joi.object({
    newPassword: Joi.string().min(8).max(30).required(),
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

exports.refreshTokenValidation = Joi.object({
    refreshToken: Joi.string().required(),
});


