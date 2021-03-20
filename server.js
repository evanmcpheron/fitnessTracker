const express = require('express');
const app = express();
const connectDB = require('./config/db');
const cors = require('cors');

connectDB();

app.use(express.json({ extended: false }));
app.use(cors());

app.use('/api/imageUpload', require('./routes/imageUpload'));
app.use('/api/user', require('./routes/user'));
app.use('/api/email', require('./routes/email'));

app.listen(process.env.PORT || 3000, () => {
  console.log('App listening on port 3000!');
});
