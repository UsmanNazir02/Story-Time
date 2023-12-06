const { Schema, model } = require("mongoose");

const subCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});


const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  subCategories: [subCategorySchema], 
}, { timestamps: true, versionKey: false });

const categoryModel = model('Category', categorySchema);

exports.createCategory = (obj) => categoryModel.create(obj);

exports.findCategory = (query) => categoryModel.findById(query);

exports.updateCategory = (query, obj) => categoryModel.findOneAndUpdate(query, obj);

