require('dotenv').config({path: './.env'});

const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const sharp = require('sharp');
const User = require('../models/Users');
const auth = require('../middleware/auth')

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
});

const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    },
});

// returns a string `Month Day, Year`
const getDateString = () => {
    const month = new Date().getMonth();

    switch (month) {
        case 1:
            return `January ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
        case 2:
            return `February ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
        case 3:
            return `March ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
        case 4:
            return `April ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
        case 5:
            return `May ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
        case 6:
            return `June ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
        case 7:
            return `July ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
        case 8:
            return `August ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
        case 9:
            return `September ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
        case 10:
            return `October ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
        case 11:
            return `November ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
        case 12:
            return `December ${new Date().getDate()}, ${new Date().getFullYear()}`
            break;
    }
}

const upload = multer({storage}).single('image');

// @route    POST api/image/profile
// @desc     Uploads an image
// @access   Private
// USES AUTH METHOD
router.post('/profile', upload, async (req, res, next) => {

        const userAuth = await auth(req, res);

        let myFile = req.file.originalname.split('.');
        const fileType = myFile[myFile.length - 1];
        const random = uuid.v4();

        const params = [
            {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `med-${random}.${fileType}`,
                Body: sharp(req.file.buffer).resize(600),
            },
            {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `original-${random}.${fileType}`,
                Body: sharp(req.file.buffer),
            },
        ];

        let profileImageString;

        for (let i = 0; i < params.length; i++) {
            s3.upload(params[i], (error, data) => {
                if (error) {
                    //   res.status(500).send(error);
                    console.error(error);
                }
                // res.status(200).json({ data });
                console.log(data);
                profileImageString = `${random}.${fileType}`;

            });

            // Keeps the S3 bucket from getting too bloated. Deletes current profile once new uploads
            let keyParam;
            if (i === 0) {
                keyParam = `original-${userAuth.profilePic}`
            } else {
                keyParam = `med-${userAuth.profilePic}`
            }

            let deleteParam = {Bucket: process.env.AWS_BUCKET_NAME, Key: keyParam};
            if (userAuth.profilePic != 'default.jpg') {
                s3.deleteObject(deleteParam, (err, data) => {
                    if (err) {
                        console.log(err, err.stack)
                    } else {
                        console.log("Deleted", data);
                    }
                    ;
                });
            }
        }

        const user = await User.findByIdAndUpdate(userAuth.id,
            {profilePic: `${random}.${fileType}`}, {
                new: true
            })
        res.json(user);

    }
);

// @route    POST api/image/front
// @desc     Uploads an image for front update pic
// @access   Private
// USES AUTH METHOD
router.post('/front', upload, async (req, res) => {
    const userAuth = await auth(req, res);

    let myFile = req.file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const random = uuid.v4();

    let profileImageString;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `original-${random}.${fileType}`,
        Body: sharp(req.file.buffer),
    };

    s3.upload(params, (error, data) => {
        if (error) {
            console.error(error);
        }
        profileImageString = `${random}.${fileType}`;
    });

    const dateString = getDateString();

    const updatePicObj = userAuth.updatePics;

    let currentFrontArray = userAuth.updatePics.front;
    currentFrontArray.push({
        photo: `${random}.${fileType}`, time: dateString
    });

    const user = await User.findByIdAndUpdate(userAuth.id,
        {
            updatePics: {
                front: currentFrontArray,
                back: updatePicObj.back,
                left: updatePicObj.left,
                right: updatePicObj.right
            }
        }, {new: true})
    res.json(user);
})

// @route    POST api/image/back
// @desc     Uploads an image for front update pic
// @access   Private
// USES AUTH METHOD
router.post('/back', upload, async (req, res) => {
    const userAuth = await auth(req, res);

    let myFile = req.file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const random = uuid.v4();

    let profileImageString;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `original-${random}.${fileType}`,
        Body: sharp(req.file.buffer),
    };

    s3.upload(params, (error, data) => {
        if (error) {
            console.error(error);
        }
        profileImageString = `${random}.${fileType}`;
    });

    const dateString = getDateString();

    let currentBackArray = userAuth.updatePics.back;
    currentBackArray.push({
        photo: `${random}.${fileType}`, time: dateString
    });

    const updatePicObj = userAuth.updatePics;

    const user = await User.findByIdAndUpdate(userAuth.id,
        {
            updatePics: {
                front: updatePicObj.front,
                back: currentBackArray,
                left: updatePicObj.left,
                right: updatePicObj.right
            }
        }, {new: true})
    res.json(user);
})

// @route    POST api/image/left
// @desc     Uploads an image for front update pic
// @access   Private
// USES AUTH METHOD
router.post('/left', upload, async (req, res) => {
    const userAuth = await auth(req, res);

    let myFile = req.file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const random = uuid.v4();

    let profileImageString;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `original-${random}.${fileType}`,
        Body: sharp(req.file.buffer),
    };

    s3.upload(params, (error, data) => {
        if (error) {
            console.error(error);
        }
        profileImageString = `${random}.${fileType}`;
    });

    const dateString = getDateString();

    let currentLeftArray = userAuth.updatePics.left;
    currentLeftArray.push({
        photo: `${random}.${fileType}`, time: dateString
    });

    const updatePicObj = userAuth.updatePics;

    const user = await User.findByIdAndUpdate(userAuth.id,
        {
            updatePics: {
                front: updatePicObj.front,
                back: updatePicObj.back,
                left: currentLeftArray,
                right: updatePicObj.right
            }
        }, {new: true})
    res.json(user);
})

// @route    POST api/image/right
// @desc     Uploads an image for front update pic
// @access   Private
// USES AUTH METHOD
router.post('/right', upload, async (req, res) => {
    const userAuth = await auth(req, res);

    let myFile = req.file.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
    const random = uuid.v4();

    let profileImageString;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `original-${random}.${fileType}`,
        Body: sharp(req.file.buffer),
    };

    s3.upload(params, (error, data) => {
        if (error) {
            console.error(error);
        }
        profileImageString = `${random}.${fileType}`;
    });

    const dateString = getDateString();

    let currentRightArray = userAuth.updatePics.right;
    currentRightArray.push({
        photo: `${random}.${fileType}`, time: dateString
    });

    const updatePicObj = userAuth.updatePics;

    const user = await User.findByIdAndUpdate(userAuth.id,
        {
            updatePics: {
                front: updatePicObj.front,
                back: updatePicObj.back,
                left: updatePicObj.left,
                right: currentRightArray
            }
        }, {new: true})
    res.json(user);
})

module.exports = router;
