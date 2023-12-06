const Joi = require('joi');

exports.addCategoryValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
  });

exports.addSubCategoryValidation = Joi.object({
    categoryId: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string(),
  });