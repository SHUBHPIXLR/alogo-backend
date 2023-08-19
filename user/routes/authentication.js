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


    if (user) {
      const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET)

      var newUser = {
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        token: token
      }

    }

    return res.json({
      status: true,
      message: "Login successfull!",
      data: newUser
    })

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



    return res.json({
      status: true,
      message: "user created successfully!",
      data: user
    })

  } catch (err) {
    return res.json({
      status: false,
      message: err.message,
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
        logger("Authentication Failure!")
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
    '<a href = "' + clientURL +'/' + token + '" style="color: #b8b8b8; font-weight: 600;">Change Password</a>'+  
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
  let htmldfs = '<div>'+
  '<div style="background-color: #26377C;width: 100%; text-align: center;">Click Here to'+
  // '<img style="background-color: #26377C;" src="http://t1.gstatic.com/licensed-image?q=tbn:ANd9GcRPMKnq00NF_T7RusUNeLrSazRZM0S5O8_AOcw2iBTmYTxd3Q7uXf0sW41odpAKqSblKDMUMHGb8nZRo9g" alt="">'+
    '<a href = "' + serverURL +'/' + token + '" style="color: #fffff; font-weight: 600; font-size: 25px;>Change Password</a>'+  
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
    return "A link has been sent to your registered email!";
  }catch(err){
    return err.message;
  }
}




module.exports = router