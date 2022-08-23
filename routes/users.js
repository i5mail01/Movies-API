const auth=require('../middleware/auth');
const jwt=require('jsonwebtoken');
const config=require('config');
const _=require('lodash');
const {User,validate}=require('../models/usermodel');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const express=require('express');
const router=express.Router();


router.get('/me',auth, async(req,res)=>{
    const user=await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.post('/',async(req,res)=>{
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user=await User.findOne({email:req.body.email});
    if(user) return res.status(400).send('User already Registered');

    /*user=new User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
    });*/
    //Another way of copying from request.body using lodash
    user=new User(_.pick(req.body,['name','email','password']));
    
    const salt=await bcrypt.genSalt(10);
    user.password=await bcrypt.hash(user.password,salt);

    await user.save();

    /*_.pick(user,['name','email']) //Used for selecting th properties that are need only */

    const token=user.generateAuthToken();
    res.header('x-auth-token',token).send( _.pick(user,['_id','name','email']));
});

module.exports=router;