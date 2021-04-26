require('dotenv').config({path: './.env'});

const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const sharp = require('sharp');
const User = require('../models/Users');

const app = express();

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ID,
	secretAccessKey: process.env.AWS_SECRET,
});

const storage = multer.memoryStorage({
	destination: function (req, file, callback) {
		callback(null, '');
	},
});

const upload = multer({storage}).single('image');

// @route    POST api/image/profile
// @desc     Uploads an image
// @access   Private
// USES AUTH METHOD


// CURRENTLY AN UNTESTED ROUTE!!!
app.post('/profile', upload, async (req, res, next) => {
		
		const userAuth = await auth(req, res);
		
		const user = await User.findById(userAuth.id);
		
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
		
		for (let i = 0; i < params.length; i++) {
			s3.upload(params[i], (error, data) => {
				if (error) {
					//   res.status(500).send(error);
					console.error(error);
				}
				// res.status(200).json({ data });
				console.log(data);
			});
		}
		
		user.findByIdAndUpdate(user.id, {profilePic: `${random}.${fileType}`}, {
			new: true,
		})
		
		res.json({profile: `${random}.${fileType}`});
	}
);

// @route    POST api/image/front
// @desc     Uploads an image for front update pic
// @access   Private
// USES AUTH METHOD


// CURRENTLY AN UNTESTED ROUTE!!!

app.post('/front', upload, async (req, res) => {

})

// @route    POST api/image/back
// @desc     Uploads an image for front update pic
// @access   Private
// USES AUTH METHOD


// CURRENTLY AN UNTESTED ROUTE!!!

app.post('/back', upload, async (req, res) => {

})

// @route    POST api/image/left
// @desc     Uploads an image for front update pic
// @access   Private
// USES AUTH METHOD


// CURRENTLY AN UNTESTED ROUTE!!!

app.post('/left', upload, async (req, res) => {

})

// @route    POST api/image/right
// @desc     Uploads an image for front update pic
// @access   Private
// USES AUTH METHOD


// CURRENTLY AN UNTESTED ROUTE!!!

app.post('/right', upload, async (req, res) => {

})

module.exports = router;
