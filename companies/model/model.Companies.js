const mongoose = require("mongoose")

const companiesSchema = new mongoose.Schema({
  ident:{
    type: String,
    required: true
  },
  name:{
    type: String,
    required: true
  },
  currency:{
    type: String,
    required: false
  }
}) 
const Companies = mongoose.model("Companies", companiesSchema) 
module.exports = Companies  