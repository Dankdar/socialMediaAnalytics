const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        req.user = jwt.verify(token, process.env.JWT_KEY);
        next();
    }
    catch{
        return res.status(401).json({
            message: "Authorization Failed."
        })
    }
};