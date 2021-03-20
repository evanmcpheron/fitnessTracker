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

// SERVE static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
