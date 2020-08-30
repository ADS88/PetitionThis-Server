const petitionsPhotosController = require('../controllers/petitions.photos.controller');

module.exports = function (app) {

    app.route(app.rootUrl + '/petitions/:id/photo')
        .get(petitionsPhotosController.getPetitionPhoto)
        .put(petitionsPhotosController.replacePetitionPhoto)
};