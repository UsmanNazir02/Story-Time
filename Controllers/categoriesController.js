const { STATUS_CODES } = require('../utils/constants');
const { parseBody, generateResponse } = require('../utils/index');
const { createCategory, findCategory, updateCategory } = require('../models/categoriesModel');
const { addCategoryValidation, addSubCategoryValidation } = require('../validations/productsValidation');



exports.addCategory = async (req, res, next) => {
  const body = parseBody(req.body);

  // Joi Validation
  const { error } = addCategoryValidation.validate(body);
  if (error) {
    return next({
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
      message: error.details[0].message,
    });
  }

  try {
    const newCategory = await createCategory(body);
    generateResponse(newCategory, 'Category added successfully', res);
  } catch (error) {
    next(error);
  }
};


// exports.addSubCategory = async (req, res, next) => {
//   const  body = parseBody(req.body);

//   // Joi Validation
//   const { error } = addSubCategoryValidation.validate(body);
//   if (error) {
//     return next({
//       statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
//       message: error.details[0].message,
//     });
//   }

//   try {
//     const { categoryId, name, description } = body;
//     // Find the category by ID
//     //const category = await findCategory(categoryId);//({ categoryId: body?.categoryId})
//     const category = await findCategory(categoryId);
//     console.log("dd",body?.categoryId);
//     if (!category) {
//       return next({
//         statusCode: STATUS_CODES.NOT_FOUND,
//         message: 'Category not found',
//       });
//     }

//     // Add sub-category to the category
//     category.subCategories.push({ name, description });
//     await category.save();

//     generateResponse(category, 'Sub-category added successfully', res);
//   } catch (error) {
//     next(error);
//   }
// };



exports.addSubCategory = async (req, res, next) => {
  const body = parseBody(req.body);

  // Joi Validation
  const { error } = addSubCategoryValidation.validate(body);
  if (error) {
    return next({
      statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
      message: error.details[0].message,
    });
  }

  try {
    const { categoryId, name, description } = body;

    // Find the category by ID
    const category = await findCategory(categoryId);

    if (!category) {
      return next({
        statusCode: STATUS_CODES.NOT_FOUND,
        message: 'Category not found',
      });
    }

    // Add sub-category to the category
    category.subCategories.push({ name, description });
    await category.save();

    generateResponse(category, 'Sub-category added successfully', res);
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};

