const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../model/model.User")
const auth = require("../../middleware/auth")
const nodemailer = require("nodemailer");
const clientURL = process.env.CLIENTURL
const serverURL = process.env.SERVERURL


// --------------------login----------------------------
router.post("/login", async (req, res) => {
  try {

    const user = await User.findOne(req.body)

    if (!user) {
      return res.json({
        status: false,
        message: "Wrong Email or Password!",
        data: null
      })
    }

    if(user.verified !== true){
      return res.json({
        status: false,
        message: "Please verify your email!",
        data: null
      })
    }
    if(user.verified && user.active == false){
      return res.json({
        status: false,
        message: "The account needs to approve!",
        data: null
      })
    }


    if (user) {
      const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET)
      const newUser = {
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        _id: user._id,
        password: user.password,
        modules: user.modules,
        token: token
      }
      
      return res.json({
        status: true,
        message: "Login successfull!",
        data: newUser
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

//---------------------create a user----------------------
router.post("/create", async (req, res) => {

  try {
    const alreadyExist = await User.find({ email: req.body.user.email})

    if (alreadyExist.length > 0) {
      return res.json({
        status: false,
        message: "User already exist with this email!",
        data: null
      })
    }

    req.body.user.firstname = req.body.user.firstname.toLowerCase()
    req.body.user.lastname = req.body.user.lastname.toLowerCase()

    
    const user = new User(req.body.user)

    await user.save()
    const token = jwt.sign({ id: req.body.user.email}, process.env.JWT_SECRET)
    const response = await handleEmailVerification(req.body.user.email, token)

    if(response.status == true){
      return res.json({
        status: true,
        message: "user created successfully and an email has been sent to your registered mail ID !",
        data: user
      })
    }else{
      return res.json({
        status: false,
        message: response.message,
        data: null
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

//---------------------create a user from user administration----------------------
router.post("/createUserFromUserAdministration", async (req, res) => {

  try {
    const alreadyExist = await User.find({ email: req.body.user.email})

    if (alreadyExist.length > 0) {
      return res.json({
        status: false,
        message: "User already exist with this email!",
        data: null
      })
    }

    req.body.user.firstname = req.body.user.firstname.toLowerCase()
    req.body.user.lastname = req.body.user.lastname.toLowerCase()

    
    const user = new User(req.body.user)

    await user.save()
    const token = jwt.sign({ id: req.body.user.email}, process.env.JWT_SECRET)
    const response = await handleEmailVerification(req.body.user.email, token)

    if(response.status == true){
      return res.json({
        status: true,
        message: "user created successfully and an email has been sent to your registered mail ID !",
        data: user
      })
    }else{
      return res.json({
        status: false,
        message: response.message,
        data: null
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

// --------------------fetch users-----------------------------
router.post("/fetchAll", auth, async(req, res) => {
  try{
    const users = await User.find()
    if(users.length < 1){
      return res.json({
        status: false,
        message: "No Users found!",
        data: null
      })
    }
    return res.json({
      status: true,
      message: "Users fetched successfully!",
      data: users
    })
  }catch(err){
    return res.json({
      status: false,
      message: err.message,
      data: null
    })
  }
})

// --------------------fetch users-----------------------------
router.post("/fetch/:id", auth, async(req, res) => {
  try{
    const user = await User.findById(req.params.id)
    if(user.length < 1){
      return res.json({
        status: false,
        message: "No User found!",
        data: null
      })
    }
    return res.json({
      status: true,
      message: "User fetched successfully!",
      data: user
    })
  }catch(err){
    return res.json({
      status: false,
      message: err.message,
      data: null
    })
  }
})

// ---------------------edit user profile data-------------------------
router.put("/update/:id", auth, async(req, res) => {
  try{

    const user = await User.findById(req.params.id)

    if(!user){
      return res.json({
        status: false,
        message: "Invalid User!",
        data: null
      })      
    }

    const updateUser = {
      firstname: req.body.user.firstname,
      lastname: req.body.user.lastname,
      password: req.body.user.password,
      modules: req.body.user.modules,
      active: req.body.user.active,
      verified: req.body.user.verified,
      language: req.body.user.language,
      company: req.body.user.company,
      phone: req.body.user.phone,
      modifiedBy: req.user.firstname + " " +  req.user.lastname,
      date: Date.now()
    }
  
    const newUser = await User.findByIdAndUpdate(req.params.id, updateUser)

    const update = await User.findOne({_id: req.params.id})
    const userObject = {
      email: update.email,
      firstname: update.firstname,
      lastname: update.lastname,
      _id: update._id,
      password: update.password,
      modules: update.modules,
      token: req.token
    }
      return res.json({
        status: true,
        data: userObject,
        message: "User Profile data updated successfully!"
      })

  }catch(err){
    return res.json({
      status: false,
      message: err.message,
      data: null
    })  
  }
})

// ---------------------delte user-----------------------------------
router.post("/delete/:id", auth, async(req, res) => {
  try{
    const user  = await User.findById(req.params.id)
    
    if(!user){
      return res.json({
        status: false,
        message: "Invalid User!",
        data: null
      })      
    }

    if(user.quotations.length > 0){
      return res.json({
        status: false,
        message: "Cannot delete user with quotations!",
        data: null
      })
    }

    const deletedUser  = await User.findByIdAndDelete(req.params.id)

    return res.json({
      status: true,
      message: "User deleted successfully!",
      data: null
    })

  }catch(err){
    return res.json({
      status: false,
      message: "Cannot delete user with quotations!",
      data: null
    })
  }
})

// ----------------------forget password email verification---------------------
router.post("/forgetPasswordEmailVerify", async(req, res) => {
  try{

    const user = await User.findOne({email: req.body.email})

    console.log(req.body.email)

    if (!user) {
      return res.json({
        status: false,
        message: "Not a valid Email!",
        data: null
      })
    }

    if(user.verified !== true){
      return res.json({
        status: false,
        message: "Please verify your email!",
        data: null
      })
    }


    if (user) {
      const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET)
      const response = await handleVerification(user.email, token)

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

    const user = await User.findOne({_id: decode.id})
    if(!user){
        return res.json({
            status: false,
            message: "Authentication Failure!",
            data: null
        })
    }else{
      const passwordObject = {
        password: req.body.password
      }
        const updatedUser = await User.findByIdAndUpdate(user._id, passwordObject)
        return res.json({
          status: true,
            message: "Password changed successfully!",
            data: updatedUser
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

    const user = await User.findOne({email: decode.id}) 

    if(!user){
        return res.json({
            status: false,
            message: "Authentication Failure!",
            data: null
        })
    }else{

      console.log(user)
      const updatedUser = await User.findByIdAndUpdate(user._id, {verified: true})
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
          user: 'abbas.pixlrit@gmail.com',
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
          user: 'abbas.pixlrit@gmail.com',
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