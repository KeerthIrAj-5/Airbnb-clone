const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride = require('method-override');
const ejsmate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");
const Review=require("./models/review.js");
const {reviewSchema}=require("./schema.js");
const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js"); 
const session=require("express-session"); 
const flash=require("connect-flash"); 


const sessionoption={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true ,
    cookie:{
            expires:Date.now()+7*24*60*60*1000 ,
            maxAge:7*24*60*60*1000 ,
            httpOnly:true 


    },
};



app.use(session(sessionoption)); 
app.use(flash());


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


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.failure=req.flash("failure");
    next();
});

app.use("/listings",listings);

app.use("/listings/:id/reviews",reviews);


app.get(("/"),(req,res)=>{
    res.send("Hi i am root")
});

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
