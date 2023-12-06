// routes/userRoutes.js

const { Router } = require('express');
const {findMembers} = require('../Controllers/userController');

class UserAPI {
  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  setupRoutes() {
    let router = this.router;
    router.post('/find-member', findMembers);
  }

  getRouter() {
    return this.router;
  }

  getRouterGroup() {
    return '/users'; 
  }
}

module.exports = UserAPI;
