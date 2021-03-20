const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './.env' });

const User = require('../models/Users');

// @route    GET api/auth
// @desc     Test route
// @access   Private
router.get('/', async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const query = User.find(JSON.parse(queryStr)).select('-password');

    const user = await query;

    res.send({ results: user.length, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post('/register', async (req, res) => {
  const { fName, lName, email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
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

    jwt.sign(payload, process.env.JSON_WEB_TOKEN, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ user, token });
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
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ message: 'Your email or password is incorrect.' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ errors: [{ message: 'Your email or password is incorrect.' }] });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, process.env.JSON_WEB_TOKEN, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ user, token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE api/users
// @desc     Delete user
// @access   Private

router.delete('/', auth, async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ message: 'Your password is incorrect.' }] });
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
          res.status(200).json({ message: 'Your account was successfully deleted.' });
        }
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
