const petitionPhotosModel = require('../models/petitions.photos.model');
const users = require('../models/users.model');
const petitions = require('../models/petitions.model');
const fs = require('mz/fs');
var mime = require('mime-types')

const photoDirectory = './storage/photos/';
const defaultPhotoDirectory = './storage/default/';

var path = require('path');


exports.getPetitionPhoto =  async function (req, res) {
    //TODO Implement this method correctly
    try {
        const id = req.params.id;
        const doesPhotoExist = await petitionPhotosModel.doesPhotoExist(id);
        if(!doesPhotoExist){
            res.status(404).send("That photo does not exist")
            return;
        }
        const filename = await petitionPhotosModel.getPhoto(id)

        if(await fs.exists(photoDirectory + filename)){
            const image = await fs.readFile(photoDirectory + filename)
            const mimeType = mime.lookup(filename)
            res.status(200).contentType(mimeType).send(image)
            return;
        } else {
            res.status(404).send("That photo does not exist")
            return;
        }

    } catch (err) {
        res.status(500).send(`ERROR getting users ${err}`);
    }
};

exports.replacePetitionPhoto = async function(req, res){

    try {

        //Check if token is valid
        const token = req.header('x-authorization')
        const petitionId = req.params.id
        const photoName = "petition" + petitionId
        const isTokenValid = await users.isTokenInDatabse(token)
        if(!isTokenValid){
            res.status(401).send("Invalid token")
            return;
        }

        const petitionExists = await petitions.doesPetitionExist(petitionId)
        if(!petitionExists){
            res.status(404).send("Petition does not exist")
            return;
        }

        const requestId = await users.getIdFromToken(token);
        const petitionCreatorId = await petitions.getPetitionAuthor(petitionId);
        if(requestId != petitionCreatorId){
            res.status(403).send("You are not authorized to edit this petition")
            return
        }

        let fileExtension = req.header('content-type')

        //Use path library
        const filePath = path.dirname(require.main.filename) + "/storage/photos/"


        //Convert file extension to string
        if(fileExtension === "image/jpeg"){
            fileExtension = ".jpg"
        } else if(fileExtension === "image/png"){
            fileExtension = ".png"
        } else if(fileExtension ==="image/gif") {
            fileExtension = ".gif"
        } else {
            res.status(400).send("Invalid file type")
            return;
        }

        await fs.writeFile(filePath + photoName + fileExtension, req.body, "binary")
        const status = await petitionPhotosModel.addPhotoToPetition(petitionId, photoName + fileExtension)
        res.status(status).send()


    } catch(err) {
        res.status(500).send(`ERROR posting image ${err}`);
    }
}