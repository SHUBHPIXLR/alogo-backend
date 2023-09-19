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
    required: false
  },
  language:{
    type: String,
    required: false
  },
  modules:[{
    type: String,
  }],
  quotations:[{
    type: String,
  }],
  phone: {
    type: String,
    required: false
  },
  company:{
    type: mongoose.Types.ObjectId,
    ref: "Companies"
  },
  date:{
    type: Number,
    default: Date.now()
  },
  modifiedBy:{  
    type: String,
  },
  newUser: {
    type:Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: false,
  },
  verified:{
    type: Boolean,
    default: false
  }
}) 
const User = mongoose.model("User", userSchema) 
module.exports = User  