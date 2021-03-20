const express = require('express');
const app = express();
const connectDB = require('./config/db');
const cors = require('cors');

connectDB();

app.use(express.json({ extended: false }));
app.use(cors());

app.get('/', (req, res) => res.send('API Running'));

app.use('/api/imageUpload', require('./routes/imageUpload'));
app.use('/api/user', require('./routes/user'));
app.use('/api/email', require('./routes/email'));

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(process.env.PORT || 3000, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
