const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './.env' });

module.exports = async (req, res) => {
	const token = req.header('x-auth-token');
	
	// Check if not token
	if (!token) {
		return res.status(401).json({message: 'No token, authorization denied'});
	}
	
	// Verify token
	try {
		const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN);
		
		req.user = decoded.user;
		
		let user = await User.findById(req.user.id);
		
		return user;
		
	} catch (err) {
		res.status(401).json({message: 'Token is not valid'});
	}
};