const express=require("express");
const router=express.Router();
const User=require("../models/user"); 
const wrapAsync=require("../utils/wrapAsync");
const passport= require("passport");

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup",wrapAsync(async (req,res)=>{
    try{
        let{username,email,password}=req.body;
    const newuser=new User({email,username});
     const u=await User.register(newuser,password);
    console.log(u);
    req.flash("success","User Registered");
    res.redirect("/listings");
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }

}));

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login",passport.authenticate("local",{failureRedirect:"/login",failureFlash:true,}),async(req,res)=>{
    req.flash("Welcome to airbnb");
    res.redirect("/listings");
})

module.exports=router;