const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../models/userModel");
const { protect, restrictTo } = require("../middleware/auth");
const APIFeatures = require("../utils/apifeature");

router.post(
    "/register",
    [
        check("name", "Name is required").not().isEmpty(),
        check("email", "Enter a valid email address").isEmail(),
        check(
            "password", 
            "Please enter a password with 8 or more characters"
        ).isLength({ min: 8}),
    ], async(req, res) => {
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

            const payload = {
                user :{
                    id: user._id,
                },
            };
            jwt.sign(
                payload,
                config.get("jwtSecret"),
                { expiresIn: 360000},
                (err, token)=>{
                    if(err) throw err;
                    res.status(200).json({token})
                }
            );

        }catch(err){
            res.status(500).send("Server error");
        }
    }
);


router.put(
    "/updateMe",
      protect, 
        [
            check("name", "Name is required").not().isEmpty(),
        ],
        async(req, res) => {
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

    });


router.delete("/deleteMe", protect, async(req, res)=>{

    try{
        const user = User.findOne({_id: req.user.id});

        if(!user)
            return res.status(404).json({msg: "No user found!"});

        await User.findOneAndDelete({_id: req.user.id});
        return res.status(200).json({msg:"User deleted!"});
    }catch(err){
        res.status(500).send("Server Error");
    }

});

router.get("/getMe", protect, async(req, res, next)=>{

    try{
        const user = await User.findOne({_id: req.user.id});

        if(!user)
        return res.status(404).json({msg: "No User found!"});

        return res.status(200).json({user: {data: user}});
    }catch(err){
        res.status(500).json({msg:"Something went wrong!"})
    }
    
});

router.get("/getAll", protect, restrictTo('manager'), async(req, res, next)=>{
    const features = new APIFeatures(User.find(),req.query).filter().sort().limitFields().paginate();
    const users = await features.query;
    res.status(200).json({
        status: "success",
        result: users.length,
        data:{
            users
        }
    })
})

router.put("/updateUser/:id", protect, restrictTo('manager'), 
    [
        check("name", "Name is requied").not().isEmpty(),
        check("role", "Role cannot be empty").not().isEmpty(),
    ],
    async(req, res, next) =>{
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
})

router.delete("/deleteUser/:id", protect, restrictTo('manager'), async(req, res, next)=>{
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
})


module.exports = router;
