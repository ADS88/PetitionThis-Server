const petitionsSignaturesModel = require('../models/petitions.signatures.model');
const users = require('../models/users.model');

exports.getSignaturesOfPetition = async function (req, res) {
    try {
        const petitionId = req.params.id;

        const doesPetitionExist = await petitionsSignaturesModel.doesPetitionExist(petitionId)
        if(!doesPetitionExist){
            res.status(404).send("Petition does not exist")
        }

        const result = await petitionsSignaturesModel.getSignaturesFromPetition(petitionId);
        res.status(200).send(result);

    } catch (err) {
        res.status(500).send(`ERROR getting users ${err}`);
    }
};

exports.signPetition = async function (req, res) {
    try {
        const petitionId = req.params.id;

        //Checking authorization
        const token = req.header('x-authorization')
        const isTokenValid = await users.isTokenInDatabse(token)
        if(!isTokenValid){
            res.status(401).send("Invalid token")
            return
        }

        const doesPetitionExist = await petitionsSignaturesModel.doesPetitionExist(petitionId)
        if(!doesPetitionExist){
            res.status(404).send("Petition does not exist")
        }

        //Checks if the user is requesting to view their own profile
        const userId = await users.getIdFromToken(token)

        const hasAlreadySignedPetition = await petitionsSignaturesModel.hasSignedPetition(userId, petitionId)
        if(hasAlreadySignedPetition) {
            res.status(403).send("Already signed")
            return
        }

        //Checks if petition has already finished
        const petitionClosingDate = await petitionsSignaturesModel.getPetitionClosingDate(petitionId);
        const isDate = !isNaN(Date.parse(petitionClosingDate));
        if(isDate){
            const closingDateAsDate = Date.parse(petitionClosingDate)
            if(closingDateAsDate < new Date()){
                res.status(403).send("Petition has already closed!")
                return;
            }
        }

        await petitionsSignaturesModel.signPetition(userId, petitionId)
        res.status(201).send("petition signed");

    } catch (err) {
        res.status(500).send(`ERROR getting users ${err}`);
    }
}

exports.removeSignature = async function(req, res){
    try{
        //Checking authorization
        const petitionId = req.params.id
        const token = req.header('x-authorization')
        const isTokenValid = await users.isTokenInDatabse(token)
        if(!isTokenValid){
            res.status(401).send("Invalid token")
            return
        }

        const doesPetitionExist = await petitionsSignaturesModel.doesPetitionExist(petitionId)
        if(!doesPetitionExist){
            res.status(404).send("Petition does not exist")
        }

        //Checks if the user is requesting to view their own profile
        const userId = await users.getIdFromToken(token)

        const hasAlreadySignedPetition = await petitionsSignaturesModel.hasSignedPetition(userId, petitionId)
        if(!hasAlreadySignedPetition) {
            res.status(403).send("You haven't signed this petition")
            return
        }

        //Checks petitions closing date is in the future
        const petitionClosingDate = await petitionsSignaturesModel.getPetitionClosingDate(petitionId);
        const isDate = !isNaN(Date.parse(petitionClosingDate));
        if(isDate){
            const closingDateAsDate = Date.parse(petitionClosingDate)
            if(petitionClosingDate < new Date()){
                res.status(403).send("Petition has already closed!")
                return;
            }
        }

        await petitionsSignaturesModel.deleteSignature(userId, petitionId)
        res.status(200).send("Signature removed");


    } catch (err) {
        res.status(500).send(`ERROR getting users ${err}`);
    }
}