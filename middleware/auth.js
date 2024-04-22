const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        console.log(token)
        req.userData = jwt.verify(token, process.env.JWT_KEY);
        next();
    }
    catch{
        return res.status(401).json({
            message: "Authorization Failed."
        })
    }
};