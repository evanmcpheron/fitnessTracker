const express = require('express');
const path = require('path');
const app = express();
const connectDB = require('./config/db');
const cors = require('cors');

connectDB();

const port = process.env.PORT || 5000;

app.use(express.json({ extended: false }));
app.use(cors());

// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

app.use('/api/imageUpload', require('./routes/imageUpload'));
app.use('/api/user', require('./routes/user'));
app.use('/api/email', require('./routes/email'));

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
