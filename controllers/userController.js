const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const generateToken = require("../utils/generateToken");
const User = require('../models/userModel');
const APIFeatures = require('../utils/apifeature');

exports.register = async(req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password, role} = req.body;
    try{
        let user = await User.findOne({ email});

        if(user){
            return res
            .status(400)
            .json({ errors: [{msg: "User already exists"}]});
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
        res.status(500).send("Server error");
    }
}

exports.login = async (req, res) => {
    console.log("testing");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {    
        return res.status(400).json({ erros: errors.array() }); 
    }
    
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if(!user) {
            return res  
                .status(400)
                .json({ msg: "Email does not exist!" }); 
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {     
            return res
                .status(400)
                .json({ msg: "Inavlid credentials!" });   
        }
        const payload = {      
                id: user._id,
        }

        const token = generateToken(payload.id, 200, res);
        if (!token)
            return res.status(400).json({ msg: "Error in token generation" });
        else
            return res.status(200).json({ token })        
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Somthing went wrong! Please try again!" });
    }
}

exports.update = async(req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({erros: errors.array()});
    }

    try{
        const user = await User.findOne({_id: req.user.id});
        if(!user){
        return res.status(404).json({msg: "No User found!"});
        };
        await User.findOneAndUpdate({_id: user._id},
            {
                name: req.body.name,
            });
        return res.status(200).json({msg:"User updated!"});
    }catch(err){
        res.status(500).send("Server Error");
    }

}

exports.delete = async(req, res)=>{

    try{
        const user = User.findOne({_id: req.user.id});

        if(!user)
            return res.status(404).json({msg: "No user found!"});

        await User.findOneAndDelete({_id: req.user.id});
        return res.status(200).json({msg:"User deleted!"});
    }catch(err){
        res.status(500).send("Server Error");
    }

}

exports.getID = async(req, res)=>{
    try {
        console.log(req.params.id, "idddd");
        const user = await User.findOne({ _id: req.params.id });
        if(!user)
            return res.status(404).json({ msg: "No User found!" });

        return res.status(200).json({ user: { data: user } }); 
    } catch (err) {
        res.status(500).json({ msg: "Something went wrong!" })
        
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
        return res.status(400).json({errors: errors.array()});
    try{
        const user = await User.findOne({_id: req.params.id});
        
        if(!user){
            return res.status(404).json({msg: "No User found with that ID!"});
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
            return res
            .status(400)
            .json({msg: "Cannot Update!"});
        }

    }catch(err){
        res.status(500).json({msg: 'Server Error'});
    }
}


exports.deleteUser = async(req, res, next)=>{
    try{
        const user = await User.findOne({_id: req.params.id});
        
        if(!user){
            return res.status(404).json({msg: "No User found with that ID!"});
        }
        if(user.role !=='manager' && user._id != req.user.id){
            await User.findOneAndDelete({_id: user._id});
                return res
                .status(200)
                .json({msg:"User deleted successfully!"});
            
        }else{
            return res.status(400).json({msg: "Cannot be deleted!"})
        }
    }catch(err){
        res.status(500).send("Server Error");
    }
}