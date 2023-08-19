const jwt = require("jsonwebtoken");
const User = require("../user/model/model.User")
const logger = require("./error.log")

const auth = async(req, res, next) => {
    
  try{
    const token = req.body.token
    const decode =jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({_id: decode.id})
    if(!user){
        logger("Authentication Failure!")
        return res.json({
            status: false,
            message: "Authentication Failure!",
            data: null
        })
    }else{
        req.user = user
    }
    req.token = token 
    next()

}catch(e){
    const E = Object.getOwnPropertyNames(e).reduce((acc, curr) => {
        acc[curr] = e[curr];
        return acc;
      }, {});
    logger(e)
    return res.json({
        status: false,
        m: E,
        data: null
    })
}
}

module.exports = auth