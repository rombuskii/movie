const mongoose = require("mongoose");

const Review = mongoose.model(
  "review",
  new mongoose.Schema({
    show: String,
    reviews: [{
        user: String,
        body: String,
    }],
  })
);

module.exports = Review;