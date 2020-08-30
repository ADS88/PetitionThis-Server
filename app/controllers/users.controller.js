const users = require('../models/users.model');
const {body, validationResult} = require('express-validator')
const bcrypt = require('bcrypt');
const crypto = require('crypto')

exports.validate = (method) => {
    switch (method) {
        case 'registerUser': {
            return [
                body('name', "data should have required property 'name'").exists(),
                body('name', "data.name should not be shorter than 1 characters").isLength({ min: 1 }),
                body('email', 'data.email should match the format "email"').exists().isEmail(),
                // body('email', 'email already in the database').custom(val => !users.isEmailInDatabase(val)),
                body('password', ' data.password should NOT be shorter than 1 characters').exists().isLength({ min: 1 })
            ]
        }
    }
}

exports.registerUser = async function (req, res) {
    try {
        const errors = await validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

        //Validating data is all there and email is in correct format
        if (!errors.isEmpty()) {
            res.status(400).send()
            return;
        }

        //Check if user email already in db
        const email = req.body.email
        const emailInDatabase = await users.isEmailInDatabase(email)
        if(emailInDatabase){
            res.status(400).send("User already in database")
            return;
        }

        const name = req.body.name
        const password = req.body.password
        const city = req.body.city
        const country = req.body.country

        const newUserId = await users.registerUser(name, email, password, city, country);
        res.status(201).send({"userId": newUserId});

    } catch (err) {
        res.status(500).send(`ERROR getting users ${err}`);
    }
};

exports.loginUser =  async function (req, res) {
    try {
        const email = req.body.email
        const password = req.body.password
        const isLoginValid = await users.isLoginValid(email, password);
        if (!isLoginValid) {
            res.status(400).send(`invalid email or password supplied`);
        }
        const token = crypto.randomBytes(16).toString('hex');
        await users.addTokenToUser(email, token)
        const userId = await users.getIdFromEmail(email);
        res.status(200).send({"userId": userId, "token": token})
    } catch (err) {
        res.status(500).send(`ERROR logging in user ${err}`);
    }
};

exports.logoutUser = async function (req, res) {
    try{
        const token = req.header('x-authorization')
        const isTokenValid = await users.isTokenInDatabse(token)
        if(!isTokenValid){
            res.status(401).send()
        }
        await users.removeToken(token)
        res.status(200).send()
    } catch (err){
        res.status(500).send(`ERROR getting users ${err}`);
    }
};

exports.getSingleUser = async function (req, res) {
    try{
        const token = req.header('x-authorization')
        const requestedId = req.params.id
        let isTokenValid;
        let isViewingOwnDetails;

        //Check if request has a valid token
        if(token === undefined){
            isTokenValid = false
        } else {
            isTokenValid = await users.isTokenInDatabse(token)
        }

        //Checks if the user they are after exists in the database
        const userInDatabase = await users.isUserInDatabse(requestedId)
        if(!userInDatabase){
            res.status(404).send()
        }

        //Checks if the user is requesting to view their own profile
        if(isTokenValid) {
            const loggedInUserId = await users.getIdFromToken(token)
            isViewingOwnDetails = loggedInUserId == requestedId;
        } else {
            isViewingOwnDetails = false;
        }

        const user = await users.getUserById(requestedId, isViewingOwnDetails)

        res.status(200).send(user)
    } catch (err){
        res.status(500).send(`ERROR getting users ${err}`);
    }
};

exports.editUser = async function (req, res) {

    try{
        //Checking if the token is valid
        const token = req.header('x-authorization')
        const isTokenValid = await users.isTokenInDatabse(token)
        if(!isTokenValid){
            res.status(401).send("Invalid token")
        }

        //Checking if the user is in the database
        const id = req.params.id;
        const isUserValid = await users.isUserInDatabse(id)
        if(!isUserValid){
            res.status(400).send("No user exists with that ID")
        }

        //Ensure request isn't empty
        if (Object.keys(req.body).length === 0) {
            res.status(400).send("No data given")
        }

        //Checking if the user is trying to edit their own profile
        const requestedId = req.params.id
        let isEditingOwnDetails;
        const loggedInUserId = await users.getIdFromToken(token)
        isEditingOwnDetails = loggedInUserId == requestedId;
        if(!isEditingOwnDetails){
            res.status(403).send("You cannot edit this users details!")
        }

        //Getting data from request body
        const name = req.body.name;
        const city = req.body.city;
        const country = req.body.country;
        const email = req.body.email;
        let password = req.body.password;
        const currentPassword = req.body.currentPassword

        //Check if user email already in db
        const emailInDatabase = await users.isEmailInDatabase(email)
        if(emailInDatabase){
            res.status(400).send("User already in database")
            return;
        }

        //Checking current password matched db if user is editing
        if(password !== undefined || currentPassword!= undefined) {
            const currentPassword = req.body.currentPassword;
            const passwordInDb = await users.getPasswordById(requestedId)
            const match = await bcrypt.compare(currentPassword, passwordInDb);
            if(!match){
                res.status(403).send("Incorrect password!")
                return;
            } else {
                password = await new Promise((resolve, reject) => {
                    bcrypt.hash(password, 1, function (err, hash) {
                        if (err) reject(err)
                        resolve(hash)
                    });
                })
            }

        }

        const user = {name: name,
            city: city,
            country: country,
            email: email,
            password: password
            }

        await users.editUser(requestedId, user)

        res.status(200).send()
    } catch (err){
        res.status(500).send(`ERROR getting users ${err}`);
    }
};



