const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  firstname:{
    type: String,
    required: true
  },
  lastname:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: false
  },
  password:{
    type: String,
    required: true
  },
  newUser: {
    type:Boolean,
    default: true
  },
  verified:{
    type: Boolean,
    default: true
  }
}) 
const User = mongoose.model("User", userSchema)
module.exports = User