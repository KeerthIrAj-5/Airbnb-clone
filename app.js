const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride = require('method-override')
const ejsmate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js")
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");
const Review=require("./models/review.js");
const {reviewSchema}=require("./schema.js");

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine("ejs",ejsmate);
app.use(express.static(path.join(__dirname,"/public")));


const MONGO_URL="mongodb://127.0.0.1:27017/airbnb";
main().then(()=>{
    console.log("Connected to db");
})
.catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.get(("/"),(req,res)=>{
    res.send("Hi i am root")
});

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

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    
    if(error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }
    else{
        next();
    }
}

// app.get(("/test"), async (req,res)=>{
//     let sl=new Listing({
//         title:"MyVilla",
//         description:"By the beach",
//         price:1200,
//         location:"Goa",
//         country:"India"
//     });
//     await sl.save();
//     console.log("Sample was saved");
//     res.send("Successful testing");
// });

app.get(("/listings"),wrapAsync(async (req,res)=>{
    let result=await Listing.find({});
    // .then((res)=>{
    //     console.log(res);
    // })
    res.render("listings/index.ejs",{result});
}));
app.get(("/listings/new"),(req,res)=>{
    res.render("listings/new.ejs");
});

app.post(("/listings"),validateListing,wrapAsync(async (req,res,next)=>{
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

app.get(("/listings/:id/edit"),wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const list=await Listing.findById(id);
    res.render("listings/edit.ejs",{list});
}));

app.put(("/listings/:id"),validateListing,wrapAsync(async (req,res)=>{
    // if(!req.body.listings){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,req.body.listings);
    res.redirect(`/listings/${id}`);
}));

app.delete(("/listings/:id"),wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`); 
}));



app.get(("/listings/:id"),wrapAsync(async (req,res)=>{
    let {id}=req.params;
    console.log(id);
    const list=await Listing.findById(id).populate("reviews");
    console.log(list);
    res.render("listings/show.ejs",{list});
}));

app.post(("/listings/:id/reviews"),validateReview,wrapAsync(async (req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("new review saved");
    res.redirect(`/listings/${req.params.id}`);
}));

app.delete(("/listings/:id/reviews/:reviewId"),wrapAsync(async (req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    let {status=500,message="something went wrong"}=err;
    //res.status(status).send(message);
    res.status(status).render("error.ejs",{err});
});

app.listen(3000,()=>{
    console.log("Server is litening to port 3000");
});
