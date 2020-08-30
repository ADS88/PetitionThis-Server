const petitions = require('../models/petitions.model');
const users = require('../models/users.model');
const {body, validationResult} = require('express-validator')

exports.validate = (method) => {
    switch (method) {
        case 'createPetition': {
            return [
                body('title', "data should have required property 'name'").exists(),
                body('description', "data.name should not be shorter than 1 characters").exists(),
                body('categoryId', 'data.email should match the format "email"').exists()
            ]
        }
    }
}

exports.getAllPetitions = async function(req, res){
    try {

        //Handle starting index query param
        let startIndex = req.query.startIndex;
        startIndex == undefined ? startIndex = 0 : startIndex
        if(startIndex < 0 || startIndex != Number.parseInt(startIndex)){
            res.status(400).send("Start index must be positive number")
            return
        }

        //Handle count query param
        let count = req.query.count

        const queryString = req.query.q

        const categoryId = req.query.categoryId

        //Check if category exists
        if(categoryId !== undefined){
            const categoryValid = await petitions.doesCategoryExist(categoryId)
            if(!categoryValid){
                res.status(400).send("Invalid category")
                return
            }
        }

        const authorId = req.query.authorId
        if(authorId !== undefined){
            if(authorId < 0 || authorId != Number.parseInt(authorId)){
                res.status(400).send("Invalid Author Id")
                return
            }
        }

        let sortBy = req.query.sortBy
        if(sortBy === "ALPHABETICAL_ASC"){
            sortBy = "order by title ASC"
        } else if(sortBy === "ALPHABETICAL_DESC"){
            sortBy = "order by title DESC"
        } else if(sortBy === "SIGNATURES_ASC"){
            sortBy = "order by signatureCount ASC"
        } else if(sortBy === "SIGNATURES_DESC" || sortBy === undefined) {
            sortBy = "order by signatureCount DESC"
        } else {
            res.status(400).send()
            return
        }

        let result = await petitions.getAllPetitions(queryString, categoryId, authorId, sortBy);
        if(result === undefined){
            res.status(400).send()
            return
        }

        //Handle starting index
        result = result.splice(startIndex)

        //Handle count of items
        if(count !== undefined){
            if(count < 0 || count != Number.parseInt(count)){
                res.status(400).send("Count must be positive number")
                return
            }
            if(count < result.length) {
                result = result.slice(0, count)
            }
        }

        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(`ERROR getting users ${err}`);
    }
};

exports.createPetition = async function(req, res){

    try {
        //Validating data is all there
        const errors = await validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send("Empty field")
            return;
        }

        //Check if token is valid
        const token = req.header('x-authorization')
        const isTokenValid = await users.isTokenInDatabse(token)
        if(!isTokenValid){
            res.status(401).send("Invalid token")
            return;
        }

        //Check if category Id exists
        const categoryId = req.body.categoryId;
        const categoryExists = await petitions.doesCategoryExist(categoryId)
        if(!categoryExists){
            res.status(400).send("category does not exist")
            return;
        }

        //Check if closing date is in the future
        const closingDate = req.body.closingDate;
        const isDate = !isNaN(Date.parse(closingDate));
        const closingDateAsDate = Date.parse(closingDate)
        if(closingDateAsDate < new Date() || !isDate){
            res.status(400).send("closing date must be future!")
            return;
        }

        const authorId = await users.getIdFromToken(token);
        const title = req.body.title;
        const description = req.body.description;


        const petitionId = await petitions.createPetition(title, description, categoryId, closingDate, authorId)
        res.status(201).send({"petitionId": petitionId});
    } catch (err) {
        res.status(500).send(`ERROR creating petition : ${err}`);
    }
};

exports.getSinglePetition = async function(req, res){
    const id = req.params.id;
    try {
        const result = await petitions.getOnePetition(id);
        if (result === undefined) {
            res.status(404).send('Invalid Id');
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        res.status(500).send(`ERROR reading user ${id}: ${err}`);
    }
};

exports.deletePetition = async function(req, res){
    const petitionId = req.params.id;
    try {

        //Check if token is valid
        const token = req.header('x-authorization')
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
            res.status(403).send("You are not authorized to delete this petition")
            return
        }

        await petitions.deletePetition(petitionId)
        res.status(200).send();
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.editPetition = async function(req, res){
    const petitionId = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const closingDate = req.body.closingDate;

    //Check if token is valid
    const token = req.header('x-authorization')
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

    //Check if petition has already closed
    const currentClosingDate = await petitions.getPetitionClosingDate(petitionId)
    const currentClosingDateAsDate = Date.parse(currentClosingDate)
    if(currentClosingDateAsDate < new Date()){
        res.status(400).send("Petition already closed and cannot be edited!")
        return;
    }

    //Check if closing date is in the future
    if(closingDate !== undefined){
        const isDate = !isNaN(Date.parse(closingDate));
        const closingDateAsDate = Date.parse(closingDate)
        if(closingDateAsDate < new Date() || !isDate){
            res.status(400).send("closing date must be future!")
            return;
        }
    }

    const data = {title: title,
        description: description,
        category_id: categoryId,
        closing_date: closingDate}

    try {
        await petitions.editPetition(petitionId, data)

        res.status(200).send();
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

exports.getAllPetitionCategories = async function(req, res){
    try {
        const result = await petitions.getAllPetitionCategories()
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

