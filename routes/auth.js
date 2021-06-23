const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../models/userModel");

router.post(
    "/login", 
    [
        check("email", "Enter a valid email!").isEmail(),
        check("password", "Password is required!").exists(),
    ],
    async(req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({erros: errors.array()});
        }
        try{
            const {email, password} = req.body;

                let user = await User.findOne({email});

                if(!user) {
                    return res
                    .status(400)
                    .json({msg: "Email does not exist!"});
                }

                const isMatch = await bcrypt.compare(password, user.password);

                if(!isMatch){
                    return res
                    .status(400)
                    .json({msg: "Inavlid credentials!"});
                }

                const payload = {
                    user:{
                        id: user._id,
                    }
                }
                jwt.sign(
                    payload,
                    config.get("jwtSecret"),
                    {expiresIn: 360000},
                    (err, token) =>{
                        if(err) throw err;
                        res.json({token})
                    }
                )
        }catch(err){
            res.status(500).json({msg: "Somthing went wrong! Please try again!"})
        }
    })


module.exports = router;