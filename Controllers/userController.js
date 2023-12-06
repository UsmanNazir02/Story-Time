// controllers/userController.js

const { findMembers } = require('../models/userModel');
const { generateResponse, parseBody} = require('../utils/index');
const { STATUS_CODES, ROLES } = require('../utils/constants');
const { findMembersValidation } = require('../validations/userValidations');

exports.findMembers = async (req, res, next) => {
  const  body  = parseBody(req.body);

  // Joi Validation
  const { error } = findMembersValidation.validate(body)
  if (error) {
    return next({
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
      message: error.details[0].message,
    });
  }

  try {
    const { search } = body;
    const user = await findMembers(search);
    if (!user) {
      return next({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: 'User not found',
      });
    }
    console.log("user",user);
    console.log("user:",search);

    generateResponse(user, 'User found successfully', res);
  } catch (error) {
    next(error);
  }
};
