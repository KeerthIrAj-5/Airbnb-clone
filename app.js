const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride = require('method-override')
 
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));

app.listen(3000,()=>{
    console.log("Server is litening to port 3000");
});

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

app.get(("/listings"),async (req,res)=>{
    let result=await Listing.find({});
    // .then((res)=>{
    //     console.log(res);
    // })
    res.render("listings/index.ejs",{result});
});
app.get(("/listings/new"),(req,res)=>{
    res.render("listings/new.ejs");
});

app.post(("/listings"),async (req,res)=>{
    //let {title,description,image,price,loaction,country}=req.body;
    //let listing=req.body;
    const nl=new Listing(req.body.listings);
    await nl.save();
    res.redirect("/listings");

});

app.get(("/listings/:id/edit"),async (req,res)=>{
    let {id}=req.params;
    const list=await Listing.findById(id);
    res.render("listings/edit.ejs",{list});
});

app.put(("/listings/:id"),async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,req.body.listings);
    res.redirect(`/listings/${id}`);
});

app.delete(("/listings/:id"),async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`); 
});
app.get(("/listings/:id"),async (req,res)=>{
    let {id}=req.params;
    console.log(id);
    const list=await Listing.findById(id);
    console.log(list);
    res.render("listings/show.ejs",{list});
});

