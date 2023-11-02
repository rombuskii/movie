const mongoose = require("mongoose");

const showShelf = mongoose.model(
  "showShelf",
  new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    watchlist: [String],
    favorites: [String],

  })
);

module.exports = showShelf;