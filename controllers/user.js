const User = require('../models/User');
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { createAccessToken, errorHandler } = require("../auth");


// User Registration
module.exports.registerUser = (req, res) => {

    if (!req.body.email.includes("@")){
        return res.status(400).send({ message: "Invalid email format" });
    } else if (req.body.password.length < 8) {
        return res.status(400).send({ message: "Password must be atleast 8 characters long" });
    } else {

        let newUser = new User({
            email : req.body.email,
            password : bcrypt.hashSync(req.body.password, 10)
        });

        return newUser.save()
        .then((result) => res.status(201).send({ message: "Registered successfully" }))
        .catch(error => {
            if(error.code === 11000){
                res.status(409).send({ message: 'Duplicate Email Exist' });
            } else {
                res.status(500).send({ error: error.message });
            }
        });
    }
};

// User Login
module.exports.loginUser = (req, res) => {

    if(!req.body.email){
        return res.status(404).send({ message: "No email found" });
    }
    const email = req.body.email.trim();
    if(req.body.email.includes("@")) {

        return User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
        .then(result => {

            if(result == null) {
                return res.status(404).send({ message: 'No email found' });
            } else {

                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

                if(isPasswordCorrect) {
                    return res.status(200).send({
                        access: createAccessToken(result)
                    });
                } else {
                    return res.status(401).send({ message: "Incorrect email or password" });
                }
            }
        })
        .catch(error => res.status(500).send({ error: error.message }));

    } else {
        return res.status(400).send({ message: "Invalid email format" });
    }
};

// Get Profile
module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id).select('-password -created_at -updated_at')
    .then(user => {
        if(user){
            res.status(200).send({user : user})
        } else{
            res.status(404).send({error : "User not found"})
        }
    })
    .catch(error => res.status(500).send({ error: error.message }));
};