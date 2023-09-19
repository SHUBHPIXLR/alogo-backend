const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const Pricing = require("./../models/model.pricing")
const auth = require("../../middleware/auth")
const nodemailer = require("nodemailer");
const clientURL = process.env.CLIENTURL
const serverURL = process.env.SERVERURL




//---------------------create a Customer----------------------
router.post("/create", auth, async (req, res) => { 
  try {
console.log(req.body.pricing)
    const alreadyExist = await Pricing.find({ material: req.body.pricing.material, priceVersion:  req.body.pricing.priceVersion})

    if (alreadyExist.length > 0) {
      return res.json({
        status: false,
        message: "Pricing already exist with this material!",
        data: null
      })
    }


    
    const pricing = new Pricing(req.body.pricing)

    await pricing.save()

      return res.json({
        status: true,
        message: "pricing created successfully !",
        data: pricing
      })   

  } catch (err) {
    return res.json({
      status: false,
      message: err.message,
      data: null
    })

  }

})

// // --------------------fetch Customers-----------------------------
router.post("/fetchAll", auth, async(req, res) => {
  try{
    const pricings = await Pricing.find()
    if(pricings.length < 1){
      return res.json({
        status: false,
        message: "No Pricinga found!",
        data: null
      })
    }
    return res.json({
      status: true,
      message: "pricings fetched successfully!",
      data: pricings
    })
  }catch(err){
    return res.json({
      status: false,
      message: err.message,
      data: null
    })
  }
})

// // --------------------fetch Customers-----------------------------
// router.post("/fetch/:id", auth, async(req, res) => {
//   try{
//     const customer = await Customer.findById(req.params.id).populate("owner").populate("modifiedBy")
//     if(customer.length < 1){
//       return res.json({
//         status: false,
//         message: "No Customer found!",
//         data: null
//       })
//     }
//     return res.json({
//       status: true,
//       message: "Customer fetched successfully!",
//       data: customer
//     })
//   }catch(err){
//     return res.json({
//       status: false,
//       message: err.message,
//       data: null
//     })
//   }
// })

// // ---------------------edit Customer profile data-------------------------
// router.put("/update/:id", auth, async(req, res) => {
//   try{

//     const customer = await Customer.findById(req.params.id)    

//     if(!customer){
//       return res.json({
//         status: false,
//         message: "Invalid Customer!",
//         data: null
//       })      
//     }

//     const checkName = await Customer.findOne({name: req.body.customer.name.toLowerCase()})

//     if(checkName && (checkName['_id'] != req.params.id) && (checkName['name'] == req.body.customer.name.toLowerCase())){
//       return res.json({
//         status: false,
//         message: "This name is already taken!",
//         data: null
//       }) 
//     }

//     const updateCustomer = {
//       name: req.body.customer.name.toLowerCase(),
//       country: req.body.customer.country,
//       zipcode: req.body.customer.zipcode,
//       streetnumber: req.body.customer.streetnumber,
//       country: req.body.customer.country,
//       modifiedBy: req.user._id,
//       date: Date.now()
//     }
  
//     const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, updateCustomer)
//       return res.json({
//         status: true,
//         data: updatedCustomer,
//         message: "Customer Profile data updated successfully!"
//       })

//   }catch(err){
//     console.log(err)
//     return res.json({
//       status: false,
//       message: err.message,
//       data: null
//     })  
//   }
// })

// // ---------------------delte Customer-----------------------------------

// router.post("/delete/:id", auth, async(req, res) => {
//   try{
//     const customer  = await Customer.findById(req.params.id)
    
//     if(!customer){
//       return res.json({
//         status: false,
//         message: "Invalid Customer!",
//         data: null
//       })      
//     }

//     if(customer.quotations.length > 0){
//       return res.json({
//         status: false,
//         message: "Cannot delete Customer with quotations!",
//         data: null
//       })
//     }

//     const deletedCustomer  = await Customer.findByIdAndDelete(req.params.id)

//     return res.json({
//       status: true,
//       message: "Customer deleted successfully!",
//       data: null
//     })

//   }catch(err){
//     return res.json({
//       status: false,
//       message: "Cannot delete Customer with quotations!",
//       data: null
//     })
//   }
// })







module.exports = router