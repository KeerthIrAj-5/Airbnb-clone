const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema}=require("../schema.js");
const Listing=require("../models/listing.js");


const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    
    if(error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }
    else{
        next();
    }
}




router.get(("/"),wrapAsync(async (req,res)=>{
    let result=await Listing.find({});
    // .then((res)=>{
    //     console.log(res);
    // })
    res.render("listings/index.ejs",{result});
}));
router.get(("/new"),(req,res)=>{
    res.render("listings/new.ejs");
});

router.post(("/"),validateListing,wrapAsync(async (req,res,next)=>{
    //let {title,description,image,price,loaction,country}=req.body;
    //let listing=req.body)
    // if(!req.body.listings){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    //console.log(req.body);
    
    const nl=new Listing(req.body.listings);
    // if(!n1.title){
    //     throw new ExpressError(400,"Title is missing");
    // }
    // if(!n1.description){
    //     throw new ExpressError(400,"Description is missing");
    // }
    // if(!n1.price){
    //     throw new ExpressError(400,"Price is missing");
    // }
    // if(!n1.loaction){
    //     throw new ExpressError(400,"Location is missing");
    // }
    // if(!n1.country){
    //     throw new ExpressError(400,"Country is missing");
    // }
    await nl.save();
    res.redirect("/listings");
}));


router.get(("/:id/edit"),wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const list=await Listing.findById(id);
    res.render("listings/edit.ejs",{list});
}));

router.put(("/:id"),validateListing,wrapAsync(async (req,res)=>{
    // if(!req.body.listings){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,req.body.listings);
    res.redirect(`/listings/${id}`);
}));

router.delete(("/:id"),wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`); 
}));



router.get(("/:id"),wrapAsync(async (req,res)=>{
    let {id}=req.params;
    console.log(id);
    const list=await Listing.findById(id).populate("reviews");
    console.log(list);
    res.render("listings/show.ejs",{list});
}));

module.exports=router;