const mongoose = require('mongoose');

const GrocerySchema = new mongoose.Schema({
  protien: {
    p1: {
      type: Array,
      default: [],
    },
    p2: {
      type: Array,
      default: [],
    },
    p3: {
      type: Array,
      default: [],
    },
    p4: {
      type: Array,
      default: [],
    },
    vegan: {
      type: Array,
      defaul: [],
    },
  },
  fat: {
    f1: {
      type: Array,
      default: [],
    },
    f2: {
      type: Array,
      default: [],
    },
    f3: {
      type: Array,
      default: [],
    },
    f4: {
      type: Array,
      default: [],
    },
  },
  carb: {
    c1: {
      type: Array,
      default: [],
    },
    c2: {
      type: Array,
      default: [],
    },
    c3: {
      type: Array,
      default: [],
    },
    c4: {
      type: Array,
      default: [],
    },
    c5: {
      type: Array,
      default: [],
    },
  },
  additional: {
    ap: {
      type: Array,
      default: [],
    },
    flourMeal: {
      type: Array,
      default: [],
    },
    sugarSubstitute: {
      type: Array,
      default: [],
    },
    seasoningCondomentSpice: {
      type: Array,
      default: [],
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = GroceryList = mongoose.model('groceryList', GrocerySchema);
