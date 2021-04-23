const express = require('express');
const path = require('path');
const app = express();
const connectDB = require('./config/db');
const cors = require('cors');

connectDB();

const port = process.env.PORT || 5000;

app.use(express.json({ extended: false }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('HELLO! Welcome to the Fierro Fitness API');
});

// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// This is the route used for all image routes.
// Add, delete, and update images
app.use('/api/image', require('./routes/image'));

// All routes around basic user authentication
app.use('/api/user', require('./routes/user'));

// This route is used to send emails.
app.use('/api/email', require('./routes/email'));

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
