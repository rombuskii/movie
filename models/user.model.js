const mongoose = require("mongoose");
const showShelf = require('./showShelf.model').schema
const User = mongoose.model(
  "user",
  new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    admin: Boolean,
    email: String,
    friends: [String],
    // show_shelf: showShelf,
    birthday: Date,

  })
);

module.exports = User;