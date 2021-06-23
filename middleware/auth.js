const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/userModel");


exports.protect = async (req, res, next ) =>{
    try{
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token){
            return res
            .status(401)
            .json({msg: "You are not logged in!"});
        }

        const decoded = await jwt.verify(token, config.get("jwtSecret"));
     
        const currentUser = await User.findById(decoded.user.id);
        if(!currentUser){
            return res
            .status(401)
            .json({msg: "The user no longer exists"});
        }

        req.user = currentUser;
        next();
    }catch(err){
        return res
        .status(400)
        .json({msg: "Invalid Token!"});
    }
}

exports.restrictTo = (...role) => {
    
    return async (req, res, next) => {
        
        const user_role = await User.findById({_id: req.user.id});
       
        if(!role.includes(user_role.role)){
            return res
            .status(403)
            .json({msg: 'You don\'t have permission to access this action'})
        }
        next();
    }
}