const { Router } = require('express');
const { addCategory, addSubCategory, } = require('../Controllers/categoriesController');

class CategoryAPI {
  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  setupRoutes() {
    let router = this.router;
    
    router.post('/add-category', addCategory);
    router.post('/add-subCategory', addSubCategory);

  }

  getRouter() {
    return this.router;
  }

  getRouterGroup() {
    return '/category';
  }
}

module.exports = CategoryAPI;