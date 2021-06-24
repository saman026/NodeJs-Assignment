const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const User = require("../models/userModel");
const { protect, restrictTo } = require("../middleware/auth");
const userController = require('../controllers/userController');

router.post("/register",
    [
        check("name", "Name is required").not().isEmpty(),
        check("email", "Enter a valid email address").isEmail(),
        check(
            "password",
            "Please enter a password with 8 or more characters"
        ).isLength({ min: 8 }),
    ],
    userController.register
);

router.post("/login",
    [
        check("email", "Enter a valid email!").isEmail(),
        check("password", "Password is required!").exists(),
    ],
    userController.login
);

router.put("/update", protect, 
    [
        check("name", "Name is required").not().isEmpty(),
    ], 
    userController.update
);

router.delete("/delete", protect, userController.delete);
router.get("/get/:id", protect, userController.getID);
router.get("/get", protect, restrictTo('manager'), userController.get);

router.put("/update/:id", protect, restrictTo('manager'), 
    [
        check("name", "Name is requied").not().isEmpty(),
        check("role", "Role cannot be empty").not().isEmpty(),
    ], userController.updateUser
);

router.delete("/delete/:id", protect, restrictTo('manager'), userController.deleteUser);

module.exports = router;
