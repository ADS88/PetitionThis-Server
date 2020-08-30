const petitionsController = require('../controllers/petitions.controller');

module.exports = function (app) {

    app.route(app.rootUrl + '/petitions/categories')
        .get(petitionsController.getAllPetitionCategories);

    app.route(app.rootUrl + '/petitions')
        .get(petitionsController.getAllPetitions)

    app.post(app.rootUrl + '/petitions',
        petitionsController.validate('createPetition'),
        petitionsController.createPetition )


    app.route(app.rootUrl + '/petitions/:id')
        .get(petitionsController.getSinglePetition)
        .delete(petitionsController.deletePetition)
        .patch(petitionsController.editPetition);
};