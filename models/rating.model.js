const mongoose = require("mongoose");

const Rating = mongoose.model(
  "rating",
  new mongoose.Schema({
    rating: Number,
    id: String,
    title: String,
  })
);

module.exports = Rating;