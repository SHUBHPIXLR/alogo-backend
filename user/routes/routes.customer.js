const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const Customer = require("../model/model.Customer")
const auth = require("../../middleware/auth")
const nodemailer = require("nodemailer");
const clientURL = process.env.CLIENTURL
const serverURL = process.env.SERVERURL


// --------------------login----------------------------
router.post("/login", async (req, res) => {
  try {

    const Customer = await Customer.findOne(req.body)

    if (!Customer) {
      return res.json({
        status: false,
        message: "Wrong Email or Password!",
        data: null
      })
    }

    if(Customer.verified !== true){
      return res.json({
        status: false,
        message: "Please verify your email!",
        data: null
      })
    }


    if (Customer) {
      const token = jwt.sign({ id: Customer._id.toString() }, process.env.JWT_SECRET)
      const newCustomer = {
        email: Customer.email,
        firstname: Customer.firstname,
        lastname: Customer.lastname,
        _id: Customer._id,
        password: Customer.password,
        token: token
      }
      
      return res.json({
        status: true,
        message: "Login successfull!",
        data: newCustomer
      })
    }


  } catch (err) {

    return res.json({
      status: false,
      message: err.message,
      data: null
    })

  }

})

//---------------------create a Customer----------------------
router.post("/create", auth, async (req, res) => { 
  try {

    const alreadyExist = await Customer.find({ name: req.body.customer.name.toLowerCase()})

    if (alreadyExist.length > 0) {
      return res.json({
        status: false,
        message: "Customer already exist with this name!",
        data: null
      })
    }

    req.body.customer.name = req.body.customer.name.toLowerCase()
    req.body.customer.owner = req.user._id

    
    const customer = new Customer(req.body.customer)

    await customer.save()

      return res.json({
        status: true,
        message: "Customer created successfully !",
        data: customer
      })   

  } catch (err) {
    console.log(err)
    return res.json({
      status: false,
      message: err.message,
      data: null
    })

  }

})

// --------------------fetch Customers-----------------------------
router.post("/fetchAll", auth, async(req, res) => {
  try{
    const customers = await Customer.find().populate("owner").populate("modifiedBy")
    if(customers.length < 1){
      return res.json({
        status: false,
        message: "No Customers found!",
        data: null
      })
    }
    return res.json({
      status: true,
      message: "customers fetched successfully!",
      data: customers
    })
  }catch(err){
    return res.json({
      status: false,
      message: err.message,
      data: null
    })
  }
})

// --------------------fetch Customers-----------------------------
router.post("/fetch/:id", auth, async(req, res) => {
  try{
    const customer = await Customer.findById(req.params.id).populate("owner").populate("modifiedBy")
    if(customer.length < 1){
      return res.json({
        status: false,
        message: "No Customer found!",
        data: null
      })
    }
    return res.json({
      status: true,
      message: "Customer fetched successfully!",
      data: customer
    })
  }catch(err){
    return res.json({
      status: false,
      message: err.message,
      data: null
    })
  }
})

// ---------------------edit Customer profile data-------------------------
router.put("/update/:id", auth, async(req, res) => {
  try{

    const customer = await Customer.findById(req.params.id)    

    if(!customer){
      return res.json({
        status: false,
        message: "Invalid Customer!",
        data: null
      })      
    }

    const checkName = await Customer.findOne({name: req.body.customer.name.toLowerCase()})

    if(checkName && (checkName['_id'] != req.params.id) && (checkName['name'] == req.body.customer.name.toLowerCase())){
      return res.json({
        status: false,
        message: "This name is already taken!",
        data: null
      }) 
    }

    const updateCustomer = {
      name: req.body.customer.name.toLowerCase(),
      country: req.body.customer.country,
      zipcode: req.body.customer.zipcode,
      streetnumber: req.body.customer.streetnumber,
      country: req.body.customer.country,
      modifiedBy: req.user._id,
      date: Date.now()
    }
  
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, updateCustomer)
      return res.json({
        status: true,
        data: updatedCustomer,
        message: "Customer Profile data updated successfully!"
      })

  }catch(err){
    console.log(err)
    return res.json({
      status: false,
      message: err.message,
      data: null
    })  
  }
})

// ---------------------delte Customer-----------------------------------

router.post("/delete/:id", auth, async(req, res) => {
  try{
    const customer  = await Customer.findById(req.params.id)
    
    if(!customer){
      return res.json({
        status: false,
        message: "Invalid Customer!",
        data: null
      })      
    }

    if(customer.quotations.length > 0){
      return res.json({
        status: false,
        message: "Cannot delete Customer with quotations!",
        data: null
      })
    }

    const deletedCustomer  = await Customer.findByIdAndDelete(req.params.id)

    return res.json({
      status: true,
      message: "Customer deleted successfully!",
      data: null
    })

  }catch(err){
    return res.json({
      status: false,
      message: "Cannot delete Customer with quotations!",
      data: null
    })
  }
})

// ----------------------forget password email verification---------------------
router.post("/forgetPasswordEmailVerify", async(req, res) => {
  try{

    const Customer = await Customer.findOne({email: req.body.email})

    console.log(req.body.email)

    if (!Customer) {
      return res.json({
        status: false,
        message: "Not a valid Email!",
        data: null
      })
    }

    if(Customer.verified !== true){
      return res.json({
        status: false,
        message: "Please verify your email!",
        data: null
      })
    }


    if (Customer) {
      const token = jwt.sign({ id: Customer._id.toString() }, process.env.JWT_SECRET)
      const response = await handleVerification(Customer.email, token)

      return res.json({
        data: null,
        message: response.mesage,
        status: response.status
      })
    }

  }catch(err){
    return res.json({
      status: false,
      message: err.message,
      data: null
    })
  }
})

// ----------------------change password------------------------
router.post("/changePassword", async(req, res) => {
  try{

    const decode =jwt.verify(req.body.token, process.env.JWT_SECRET)

    const Customer = await Customer.findOne({_id: decode.id})
    if(!Customer){
        return res.json({
            status: false,
            message: "Authentication Failure!",
            data: null
        })
    }else{
      const passwordObject = {
        password: req.body.password
      }
        const updatedCustomer = await Customer.findByIdAndUpdate(Customer._id, passwordObject)
        return res.json({
          status: true,
            message: "Password changed successfully!",
            data: updatedCustomer
        })
    }
  }catch(err){
    return res.json({
      status: false,
      message: err.message,
      data: null
    })
  }
})

// -------------------verify email after register---------------------------------
router.get("/verifyEmailForRegister/:token", async(req, res) => {
  try{
    const decode =jwt.verify(req.params.token, process.env.JWT_SECRET)

    const Customer = await Customer.findOne({email: decode.id})

    if(!Customer){
        return res.json({
            status: false,
            message: "Authentication Failure!",
            data: null
        })
    }else{
      const updatedCustomer = await Customer.findByIdAndUpdate(Customer._id, {verified: true, active: true})
      const url = clientURL + "emailVerify"
      res.redirect(url)
    }
  }catch(err){
    return res.json({
      status: false,
      message: err.message,
      data: null
  })
  }
})




const handleVerification = async (email, token) => {
  try{
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
          Customer: 'abbas.pixlrit@gmail.com',
          pass: 'xbhaknhuxcntgkij'
      }
  });
  let htmldfs = '<div>'+
  '<div style="background-color: #FFED00;width: 100%; text-align: center; padding:15px 0px; font-weight: 600;">Click Here to '+
  // '<img style="background-color: #26377C;" src="http://t1.gstatic.com/licensed-image?q=tbn:ANd9GcRPMKnq00NF_T7RusUNeLrSazRZM0S5O8_AOcw2iBTmYTxd3Q7uXf0sW41odpAKqSblKDMUMHGb8nZRo9g" alt="">'+
    '<a href = "' + clientURL +'changePassword/' + token + '" style="color: #b8b8b8; font-weight: 600;">Change Password</a>'+  
  '</div>'+
  '<div style="width: 300px; flex-wrap: wrap; margin: 0 -15px;">'+
    
'</div>';
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '<abbas.pixlrit@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Forget Password", // Subject line
    text: "ALOGO", // plain text body
    html: htmldfs // html body
  });
    return {mesage: "A link has been sent to your registered email!", status: true};
  }catch(err){
    return {mesage: err.message, status: false};
  }
  
}

const handleEmailVerification = async(email, token) => {
  try{
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
          Customer: 'abbas.pixlrit@gmail.com',
          pass: 'xbhaknhuxcntgkij'
      }
  });
  let htmldfs = 
  
  '<div>'+
  '<div style="background-color: #FFED00;width: 100%; text-align: center; padding:15px 0px; font-weight: 600;">Click Here to '+
  // '<img style="background-color: #26377C;" src="http://t1.gstatic.com/licensed-image?q=tbn:ANd9GcRPMKnq00NF_T7RusUNeLrSazRZM0S5O8_AOcw2iBTmYTxd3Q7uXf0sW41odpAKqSblKDMUMHGb8nZRo9g" alt="">'+
    '<a href = "' + serverURL +'auth/verifyEmailForRegister/' + token + '" style="color: #b8b8b8; font-weight: 600;">Verify</a>'+  
  '</div>'+
  '<div style="width: 300px; flex-wrap: wrap; margin: 0 -15px;">'+
    
'</div>';
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '<abbas.pixlrit@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Verify Email", // Subject line
    text: "ALOGO", // plain text body
    html: htmldfs // html body
  });
  return {mesage: "A link has been sent to your registered email!", status: true};
}catch(err){
  return {mesage: err.message, status: false};
}
}




module.exports = router