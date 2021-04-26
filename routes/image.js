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

const upload = multer({storage}).single('image');


// @route    POST api/image/profile
// @desc     Uploads an image
// @access   Private
// USES AUTH METHOD


// CURRENTLY AN UNTESTED ROUTE!!!
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
			if(i === 0) {
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


// CURRENTLY AN UNTESTED ROUTE!!!

router.post('/front', upload, async (req, res) => {
	const userAuth = await auth(req, res);
	
	let currentFrontArray = userAuth.updatePics.front;
	currentFrontArray.push();
	console.log(currentFrontArray)
	
	const user = await User.findByIdAndUpdate(userAuth.id,
		{updatePics: {front: currentFrontArray}}, {new: true})
	res.json(user);
})

// @route    POST api/image/back
// @desc     Uploads an image for front update pic
// @access   Private
// USES AUTH METHOD


// CURRENTLY AN UNTESTED ROUTE!!!

router.post('/back', upload, async (req, res) => {

})

// @route    POST api/image/left
// @desc     Uploads an image for front update pic
// @access   Private
// USES AUTH METHOD


// CURRENTLY AN UNTESTED ROUTE!!!

router.post('/left', upload, async (req, res) => {

})

// @route    POST api/image/right
// @desc     Uploads an image for front update pic
// @access   Private
// USES AUTH METHOD


// CURRENTLY AN UNTESTED ROUTE!!!

router.post('/right', upload, async (req, res) => {

})

module.exports = router;
