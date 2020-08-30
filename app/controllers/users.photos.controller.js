const usersPhotosModel = require('../models/users.photos.model');
var fs = require('mz/fs');
var path = require('path');
const users = require('../models/users.model');
var mime = require('mime-types')
const photoDirectory = './storage/photos/';


exports.getUserPhoto =  async function (req, res) {
    //TODO Implement this method correctly
    try {
        const id = req.params.id;
        const doesPhotoExist = await usersPhotosModel.doesPhotoExist(id);
        if(!doesPhotoExist){
            res.status(404).send("That photo does not exist")
            return
        }
        const filename = await usersPhotosModel.getPhoto(id)

        if(await fs.exists(photoDirectory + filename)){
            const image = await fs.readFile(photoDirectory + filename)
            const mimeType = mime.lookup(filename)
            res.status(200).contentType(mimeType).send(image)
            return
        } else {
            res.status(404).send("That photo does not exist")
            return
        }

    } catch (err) {
        res.status(500).send(`ERROR getting user photo ${err}`);
    }
};

exports.editUserPhoto = async function(req, res){
    //TODO Implement this method correctly
    try {

        //Check if token is valid
        const token = req.header('x-authorization')
        const userId = req.params.id
        const photoName = req.params.id
        const isTokenValid = await users.isTokenInDatabse(token)
        if(!isTokenValid){
            res.status(401).send("Invalid token")
            return;
        }

        const userExists = await users.isUserInDatabse(userId)
        if(!userExists){
            res.status(404).send("User does not exist")
            return;
        }

        const loggedInId = await users.getIdFromToken(token)
        const isEditingOwnDetails = loggedInId == userId;
        if(!isEditingOwnDetails){
            res.status(403).send("You cannot edit this users details!")
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

        const oldFileName = await usersPhotosModel.getPhoto(userId)
        if(oldFileName !== null){
            await fs.unlinkSync(filePath + oldFileName)
        }
        await fs.writeFile(filePath + userId + fileExtension, req.body, "binary")
        const status = await usersPhotosModel.addPhotoToUser(userId, photoName + fileExtension)
        res.status(status).send()

    } catch(err) {
        res.status(500).send(`ERROR posting image ${err}`);
    }
}

exports.deleteUserPhoto = async function(req, res){
    try {
        //TODO Implement this method correctly
        //Check if token is valid
        const token = req.header('x-authorization')
        const userId = req.params.id
        const isTokenValid = await users.isTokenInDatabse(token)
        if(!isTokenValid){
            res.status(401).send("Invalid token")
            return;
        }

        const userExists = await users.isUserInDatabse(userId)
        if(!userExists){
            res.status(404).send("User does not exist")
            return;
        }

        const loggedInId = await users.getIdFromToken(token)
        const isEditingOwnDetails = loggedInId == userId;
        if(!isEditingOwnDetails){
            res.status(403).send("You cannot edit this users details!")
            return;
        }

        const fileName = await usersPhotosModel.getPhoto(userId)
        await usersPhotosModel.deletePhoto(userId)
        //TODO actually delete the photo from system
        if(fileName != undefined){
            fs.unlink(photoDirectory + fileName, (err) => {
                if (err) throw err;
                console.log('path/file.txt was deleted');
            });
        }
        res.status(200).send();

    } catch(err) {
        res.status(500).send(`ERROR deleting photo ${err}`);
    }
}