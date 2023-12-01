const { generateResponse } = require('../utils');

exports.DefaultHandler = (req, res, next) => {
    generateResponse(null, 'Welcome to the Project - API', res);
};