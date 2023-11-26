const mongoose = require("mongoose");
const Comment = require('./comment.model').schema
const Review = mongoose.model(
  "review",
  new mongoose.Schema({
    show: String,
    reviews: [Comment],
  })
);

module.exports = Review;