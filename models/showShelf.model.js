const mongoose = require("mongoose");

const showShelf = mongoose.model(
  "showShelf",
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
    show_shelf: String,
    birthday: Date,

  })
);

module.exports = showShelf;