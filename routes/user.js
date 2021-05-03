const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken');
require('dotenv').config({path: './.env'});

const User = require('../models/Users');

// @route    GET api/auth
// @desc     Test route - will be used for advanced filtering and sorting to admin user search
// @access   Private
// USES AUTH METHOD
router.get('/', async (req, res) => {
    try {
        const queryObj = {...req.query};
        const excludedField = ['page', 'sort', 'limit', 'fields'];
        excludedField.forEach((el) => delete queryObj[el]);

        // ADVANCED FILTERING
        // for a nesting link like this "localhost:5000/api/user?personalSpecs.age[gte]=10"
        let queryStr = JSON.stringify(queryObj);

        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        const query = User.find(JSON.parse(queryStr)).select('-password');

        const user = await query;

        res.send({results: user.length, user});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/user
// @desc     Get my profile
// @access   Private
// USES AUTH METHOD
router.get('/me',  async (req, res) => {
    const user = await auth(req, res);
    console.log(user)
    res.send(user);
});

// @route    POST api/auth/profile
// @desc     update personalSpecs for user
// @access   Private
// USES AUTH METHOD
router.post('/profile', async (req, res) => {

    try {
        const userObj = await auth(req, res);
        if(userObj.message == "No token, authorization denied") {
            res.status(401).send(userObj.message)
        }
        const userId = userObj.id;
        const {
            height: {feet, inches},
            weight,
            waist,
            gender,
            age,
        } = req.body;

        // Build profile object
        const profileFields = {weight:[],waist:[]};
        profileFields.user = req.user.id;
        if(feet) profileFields.feet = feet;
        if(inches) profileFields.inches = inches;
        if (gender) profileFields.gender = gender;
        if (age) profileFields.age = age;

        if(userObj.personalSpecs.weight.length !== 0) {
            profileFields.weight[0] = userObj.personalSpecs.weight[0];
            profileFields.weight[1] = weight;
        } else if(weight) {
            profileFields.weight[0] = weight;
        }
        if(userObj.personalSpecs.waist.length !== 0) {
            profileFields.waist[0] = userObj.personalSpecs.waist[0];
            profileFields.waist[1] = waist;
        } else if(waist) {
            profileFields.waist[0] = waist;
        }

        let user = await User.findById(userId);

        // UPDATE OBJECT TO MATCH THE MODEL TO PASS INTO UPDATE QUERY
        const updatedField = {personalSpecs: {...profileFields, height: {feet, inches}}};

        if (user) {
            // Update
            user = await User.findByIdAndUpdate(userId, updatedField, {
                new: true,
            });

            return res.status(200).send(user);
        }

    } catch (err) {
        console.log(err);
        res.status(400).send({message: 'err'});
    }
});

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post('/register', async (req, res) => {
    const {fName, lName, email, password} = req.body;
    try {
        let user = await User.findOne({email});

        if (user) {
            return res.status(400).json({errors: [{msg: 'User already exists'}]});
        }

        user = new User({
            fName,
            lName,
            email,
            password,
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(payload, process.env.JSON_WEB_TOKEN, {expiresIn: 360000}, (err, token) => {
            if (err) throw err;
            res.json({user, token});
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});

        if (!user) {
            return res
                .status(400)
                .json({errors: [{message: 'Your email or password is incorrect.'}]});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
                .status(400)
                .json({errors: [{message: 'Your email or password is incorrect.'}]});
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(payload, process.env.JSON_WEB_TOKEN, {expiresIn: 360000}, (err, token) => {
            if (err) throw err;
            res.json({user, token});
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route    DELETE api/users
// @desc     Delete user
// @access   Private
// USES AUTH METHOD
router.delete('/', async (req, res) => {
    await auth(req, res);

    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({errors: [{message: 'Your password is incorrect.'}]});
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        if (isMatch) {
            User.findOneAndDelete(email, (err, docs) => {
                if (err) {
                    console.log(err);
                } else {
                    res.status(200).json({message: 'Your account was successfully deleted.'});
                }
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
