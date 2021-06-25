const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const generateToken = require("../utils/generateToken");
const User = require('../models/userModel');
const APIFeatures = require('../utils/apifeature');
const AppError = require('../utils/appError');

exports.register = async(req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return next(new AppError(errors.array(), 400));
    }

    const {name, email, password, role} = req.body;
    try{
        let user = await User.findOne({ email});

        if(user){
            return next(new AppError("User already exists!", 400));
        }

        user = new User({
            name,
            email,
            password, 
            role
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        return res.status(201).json({ msg: "User registered successfully!" });

    }catch(err){
        return next(new AppError("Something went wrong. Please try again!", 400));
    }
}

exports.login = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {    
        return next(new AppError(errors.array(), 400));
    }
    
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if(!user) {
            return next(new AppError("Email does not exist!", 400));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {     
            return next(new AppError("Invalid credentials", 400));
        }
        const payload = {      
                id: user._id,
        }

        const token = generateToken(payload.id, 200, res);
        if (!token)
            return next(new AppError("Error in token generation", 400));
        else
            return res
                .status(200)
                .json({ token });
        
    } catch (err) {
        return next(new AppError("Somthing went wrong! Please try again!", 500)) 
    }
}

exports.update = async(req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return next(new AppError(errors.array(), 400));
    }

    try{
        const user = await User.findOne({_id: req.user.id});
        if(!user){
        return next(new AppError("No user found", 404));
        };
        await User.findOneAndUpdate({ _id: user._id }, { name: req.body.name, });
        return res.status(200).json({ msg: "User updated!" });
        
    } catch (err) {
        return next(new AppError("Something went wrong. Please try again!", 500));
    }

}

exports.delete = async(req, res, next)=>{

    try{
        const user = User.findOne({_id: req.user.id});

        if(!user)
            return next(new AppError("No User found!", 404));

        await User.findOneAndDelete({_id: req.user.id});
        return res.status(200).json({ msg: "User deleted!" });
        
    }catch(err){
        return next(new AppError("Something went wrong. Please try again!", 500));
    }

}

exports.getID = async(req, res)=>{
    try {
        const user = await User.findOne({ _id: req.user._id });
        if(!user)
            return next(new AppError("No User Found!", 404));

        return res.status(200).json({ user }); 
    } catch (err) {
        return next(new AppError("Something went wrong. Please try again!", 500));
        
    }
}

exports.get = async(req, res, next)=>{
    const features = new APIFeatures(User.find(),req.query).filter().sort().limitFields().paginate();
    const users = await features.query;
    res.status(200).json({
        status: "success",
        result: users.length,
        data:{
            users
        }
    })
}

exports.updateUser = async(req, res, next) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return next(new AppError(errors.array(), 400));
    try{
        const user = await User.findOne({_id: req.params.id});
        
        if(!user){
            return next(new AppError("No User found with that ID", 404));
        }

        if(user.role !=='manager' && user._id != req.user.id){
            await User.findOneAndUpdate({_id: user._id}, {
                name: req.body.name,
                role: req.body.role,
            }
                );
                return res
                .status(200)
                .json({msg:"User updated successfully!"});
            
        }else{
            return next(new AppError("Cannot update!", 400));
        }

    }catch(err){
        return next(new AppError("Something went wrong. Please try again!", 500));
    }
}


exports.deleteUser = async(req, res, next)=>{
    try{
        const user = await User.findOne({_id: req.params.id});
        
        if(!user){
            return next(new AppError("No User found with that ID!", 404));
        }
        if(user.role !=='manager' && user._id != req.user.id){
            await User.findOneAndDelete({_id: user._id});
                return res
                .status(200)
                .json({msg:"User deleted successfully!"});
            
        }else{
            return next(new AppError("Cannot delete!", 400));
        }
    }catch(err){
        return next(new AppError("Something went wrong. Please try again!", 500));
    }
}