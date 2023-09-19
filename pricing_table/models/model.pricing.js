const mongoose = require("mongoose")

const pricingSchema = new mongoose.Schema({
  material:{
    type: String,
    required: true
  },
  serviceGroup:{
    type: String,
    required: true
  },
  service:{
    type: String,
    required: true
  },
  priceVersion:{
    type: String,
    required: true
  },
  price:{
    type: String,
    required: true
  },
  workingTime:{
    type: Number,
    requied: true
  },
  lastModifiedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  lastModifiedDate:{
    type: Number,
    default: Date.now()
  }
}) 
const Pricing = mongoose.model("Pricing", pricingSchema) 
module.exports = Pricing