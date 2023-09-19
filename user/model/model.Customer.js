const mongoose = require("mongoose")

const customerSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  streetnumber:{
    type: String,
    required: true
  },
  zipcode:{
    type: String,
    required: true
  },
  owner:{
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  quotations:[{
    type: String,
  }],
  date:{
    type: Number,
    default: Date.now()
  },
  country: {
    type:String,
    required: true
  },
  modifiedBy:{
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  active: {
    type: Boolean,
    default: false,
  }
}) 
const Customer = mongoose.model("Customer", customerSchema) 
module.exports = Customer