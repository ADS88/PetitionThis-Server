const userPhotosController = require('../controllers/users.photos.controller');

module.exports = function (app) {

    app.route(app.rootUrl + '/users/:id/photo')
        .get(userPhotosController.getUserPhoto)
        .put(userPhotosController.editUserPhoto)
        .delete(userPhotosController.deleteUserPhoto)
};