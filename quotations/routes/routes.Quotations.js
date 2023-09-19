const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const Quotations = require("../models/model.Quotations")
const auth = require("../../middleware/auth")


router.post("/create", auth, async(req, res) => {
  try{
    const quotation = new Quotations(req.body.quotation)
    await quotation.save()

    return res.json({
      message: "Quotation Create Successfully!",
      data: quotation,
      status: true
    })
  }catch(err) {
    return res.json({
      message: err.message,
      data: null,
      status: false
    })
  }
})

router.post("/fetchAll", auth, async(req, res) => {
  try{
    const quotations = await Quotations.find()

    if(quotations.length > 0){
      return res.json({
        message: "Quotations Fetched Successfully!",
        data: quotations,
        status: true
      })
    }else{
      return res.json({
        message: "No Quotations Found!",
        data: null,
        status: false
      })
    }
  }catch(err){
    return res.json({
      message: err.message,
      data: null,
      status: false
    })
  }
})


router.put("/update/:id", auth, async(req, res) => {
  try{
    const quote = await Quotations.find({_id: req.params.id})
    if(!quote.length > 0){
      return res.json({
        message: "No Quotation Found!",
        data: null,
        status: false
      })
    }
    const quotations = await Quotations.findOneAndUpdate({_id: req.params.id},  req.body.quotation)

      return res.json({
        message: "Quotation Updated Successfully!",
        data: quotations,
        status: true
      })
   
  }catch(err){
    return res.json({
      message: err.message,
      data: null,
      status: false
    })
  }
})


module.exports = router