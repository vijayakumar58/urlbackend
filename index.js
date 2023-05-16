const express = require("express")
const app = express();
const bodyparser = require("body-parser")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv").config();

mongoose.connect(process.env.DB, { useNewUrlParser: true,useUnifiedTopology: true}  )
.then(
  (res) =>  {
    console.log(`Database is Connected`)
  },
  err => { console.log(`Not Connected`) }
);

const {UrlModel} = require("./models/urlshort")

app.use(express.static("public"))
app.use(express.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(cors({
    // origin:"http://localhost:3001",
    origin:"*",
    credentials:true,
    optionSuccessStatus:200
}))

app.listen(process.env.PORT || 3000,()=>{
    console.log(`${process.env.PORT}`)
})

app.get('/', function(req,res){
    res.json({message:"Welcome To URL Shortner"})
})


app.get('/allurl', async function(req,res){
    try {
           let v = await UrlModel.find();
           const data = v.filter((item)=> item.userId == req.params.id)
           res.json({message:"url send successful",statusCode:200,datas:data.reverse()})
    } catch (error) {
        res.json({
            error,
            message:"Something Went Wrong",
            statusCode:500
        })
    }
})

app.post('/create', async function(req,res){
    try {
        const { longUrl ,id} = req.body;
        let data = await UrlModel.findOne({longUrl:longUrl})
        if(!data) {
           await UrlModel.create({
            longUrl,
            shortUrl: generateUrl()
           })
           res.json({
            message:"url Create successfull",
            statusCode: 201
           });
        } else {
            res.json({
                message: "Already this url found",
                statusCode : 400
            })
        }
    } catch (error) {
        console.log(error)
        res.json({
            error,
            message:"Something Went Wrong",
            statusCode:500
        });
    }
});

app.get('/shortUrl/:id',async function(req,res){
    try {
         let data = await UrlModel.findOne({shortUrl : req.params.id})
            if(data) {
             await UrlModel.findOneAndUpdate({shortUrl : req.params.id},{$inc:{clickCount : 1}})
                res.redirect(data.longUrl)
            } else {
                console.log(res)
                res.json({
                    message:"Url redirect failed",
                    statusCode:200
                });
           }
    } catch (error) {
        console.log(error)
        res.json({
            error,
            message:"Url created failed",
            statuscode:500
        });
    }
})

app.delete('/delete/:id', async function(req,res){
    try {
       await  UrlModel.findByIdAndDelete(req.params.id)
            res.json({
                statusCode:200,
                message:"Short url delete successfully"
            });
        }
    catch (error) {
        console.log(error)
        res.json({
            error,
            message:"Something Went Wrong",
            statusCode:500
        })
    }
})

function generateUrl(){
    var rndResult = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;

    for(i=0; i<5; i++) {
        rndResult += characters.charAt(
            Math.floor(Math.random()* charactersLength)
        );
    }
    return rndResult;
}
