const petitionsSignatureController = require('../controllers/petitions.signatures.controller');

module.exports = function (app) {


    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(petitionsSignatureController.getSignaturesOfPetition)
        .post(petitionsSignatureController.signPetition)
        .delete(petitionsSignatureController.removeSignature)

};