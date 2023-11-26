const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Rating = require('./rating.model').schema

const ShowShelf = mongoose.model(
  "ShowShelf",
  new mongoose.Schema({
    user: {
      type: String,
      unique: true,
    },
    favorites: {
      type: [String],
    },
    ratings: [Rating],
    watchlist: {
      type: [String],
    },
  })
);

module.exports = ShowShelf;