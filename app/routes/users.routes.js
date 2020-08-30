const usersController = require('../controllers/users.controller');
const {check, validationResult} = require('express-validator');

module.exports = function (app) {

    app.post(app.rootUrl + '/users/register',
         usersController.validate('registerUser'),
         usersController.registerUser )

    app.post(app.rootUrl + '/users/login',
        usersController.loginUser )

    app.post(app.rootUrl + '/users/logout',
        usersController.logoutUser )

    app.get(app.rootUrl + '/users/:id',
        usersController.getSingleUser);

    app.patch(app.rootUrl + '/users/:id',
        usersController.editUser)

};