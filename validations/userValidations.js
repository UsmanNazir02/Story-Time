const Joi = require('joi');

exports.findMembersValidation = Joi.object({
  search: Joi.string().required(),
});