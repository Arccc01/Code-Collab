const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


async  function userRegister (req,res){
    const {email,fullname:{firstname,lastname},username,password} = req.body;
    const existingUser = userModel.findOne({username})
    if(!existingUser){
        return res.status(400).send({
            message:"user already exists"
        })
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = new userModel({
            email,
            fullname:{
                firstname,
                lastname
            },
            username,
            password:hashedPassword
        });

    await newUser.save();
    const token = jwt.sign({id: newUser._id},process.env.JWT_SECRET);
    res.cookie("token",token)
    res.status(201).json({ message: 'User registered successfully',newUser})
}

async function userlogin(req,res){
    const {username,password} = req.body;
    const user = await userModel.findOne({username});
    if(!user){
        return res.status(400).json({message:"Invalid username or password"})
    }
    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(!isPasswordValid){
        return res.status(400).json({message:"Invalid username or password"})
    }
    const token = jwt.sign({id: user._id},process.env.JWT_SECRET);
    res.cookie("token",token)
    res.status(200).json({message:"Login successful",
        username:user.username,
        fullname:user.fullname
    })
}

async function userlogout(req,res){
    res.clearCookie("token");

    res.status(200).json({
        message:"Logout successful"
    });
}

module.exports = {userRegister,userlogin,userlogout}