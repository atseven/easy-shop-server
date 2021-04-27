const {User} = require('../models/user')

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// get method
router.get(`/`,async (req, res) => {

    // fetching all records in the database without the password
    const userList = await User.find().select("-passwordHash");

    //if productList is empty
    if(!userList){
        res.status(500).json({success: true})
    }

    res.send(userList);
})

// get method (fetching particular row/record/user from the database)
router.get(`/:id`,async (req, res) => {

    // fetching a particular user from database without the password
    const user = await User.findById(req.params.id).select("-passwordHash");

    //if user is empty
    if(!user){
        res.status(500).json({success: false, message: 'The user with the given ID is not found'})
    }

    res.status(200).send(user);
})

//post method/ Registering a new user/ Signing up a new user. This is for admin. We wil see later
router.post(`/`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });
    user = await user.save();

    if(!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
})

// Login a user / Sign in a user
router.post('/login', async (req, res) => {
    // First check whether the user exist in the database or not
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.secret;
    if(!user)
        return res.status(400).send("The user not found");
    
    // Match the user email & passowrd so that it can be logged in
    if(user.email && bcrypt.compareSync(req.body.password, user.passwordHash))
    {
        // Now once the user is authenticated, then the server send back a token. Now, the user will use that token in order to access all the APIs
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin // we are passing the secret information within the token. So later on, we can validate the token and check wether the person who is logging in is an admin or a user. If he is a admin then he will redirected to the admin panel and if he is a use he will redirected to shop home page.
            },
            secret, // This can be any text. This is to uniquely identify. You can see the .env file
            {expiresIn: '1d'} // if you see in some wesbites that if you login in it then on the next day you will be logged out. It is because the token is expired. So, the server does not allow you to login with that token.
        )
        res.status(200).send({user: user.email, token: token});
    }else{
        res.status(400).send("The password is wrong!");
    }
})

// Register. This is for user end
router.post(`/register`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });
    user = await user.save();

    if(!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
})

// Fetching the total users in the database
router.get(`/get/count`, async (req, res) => {

    // fetching the length of users in the users table in database
     const userCount = await User.countDocuments((count) => count);

    //if userCount is empty
    if(!userCount){
        res.status(500).json({success: false});
    }
    res.send({
        userCount: userCount
    });
})

// Delete User
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
    .then((user) => {
        // if the ID found in the database
        if(user){
            return res.status(200).json({success: true, message: 'user is deleted'});
        }
        else{
            return res.status(404).json({success: false, message: 'user is not found'})
        }
    }).catch((err) => {
        return res.status(400).json({success: false, error: err});
    })
})

module.exports = router;