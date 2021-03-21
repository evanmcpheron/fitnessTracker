const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fName: {
    type: String,
    required: true,
  },
  lName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  personalSpecs: {
    height: {
      feet: { type: Number, default: 0 },
      inches: { type: Number, default: 0 },
    },
    weight: { type: Number, default: 0.0 },
    gender: { type: String, default: '' },
    age: { type: Number, default: 0 },
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: 'default.png',
  },
  weeklyQuestion: {
    type: Array,
    default: [],
  },
  updatePics: {
    front: {
      type: Array,
      default: [],
    },
    back: {
      type: Array,
      default: [],
    },
    left: {
      type: Array,
      default: [],
    },
    right: {
      type: Array,
      default: [],
    },
  },
  stripeId: {
    type: String,
    default: '',
  },
  meals: {
    type: Array,
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = User = mongoose.model('user', UserSchema);
