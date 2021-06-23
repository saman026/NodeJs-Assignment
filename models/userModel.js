const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const Userschema = new mongoose.Schema ({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email:{
        type: String,
        required: [true, "Please enter email!"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    role:{
        type: String,
        enum: ['user', 'manager'],
        default: 'user'
    },
    password:{
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
    },
    date :{
        type: Date,
        default: Date.now,
    }
});

module.exports = User = mongoose.model("user", Userschema);