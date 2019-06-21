const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const resultSchema = new Schema({
  language: {
    type: String,
    required: true
  },
  votes: {
    type: String,
    required: true
  }
});

module.exports = result = mongoose.model("result", resultSchema);
