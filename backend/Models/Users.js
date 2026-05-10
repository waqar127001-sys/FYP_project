const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true,
        unique: true // optional but helpful
    },
    password: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        default: "Student"
  },


});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
