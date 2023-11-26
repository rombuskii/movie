const mongoose = require("mongoose");

const Comment = mongoose.model(
  "comment",
  new mongoose.Schema({
    user: String,
    body: String,
    title: String,
  })
);

module.exports = Comment;