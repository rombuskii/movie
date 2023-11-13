const mongoose = require("mongoose");

const ShowShelf = mongoose.model(
  "ShowShelf",
  new mongoose.Schema({
    user: String,
    favorites: {
      type: [String],
    },
    ratings: [{
      rating: Number,
      id: String,
      title: String,
  }],
    watchlist: {
      type: [String],
    },
  })
);

module.exports = ShowShelf;