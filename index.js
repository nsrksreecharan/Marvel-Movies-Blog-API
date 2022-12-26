const express=require("express");
const bcrypt=require("bcrypt");
const dotenv=require("dotenv");
dotenv.config();
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
const multer=require("multer");
const mongoose=require("mongoose");
const MongoClient=require("mongodb").MongoClient;
const Grid=require("gridfs-stream");
const {GridFsStorage}=require("multer-gridfs-storage");
const path=require("path");
const { ObjectId } = require("mongodb");
const app=express();

app.use(express.json());

const PORT=process.env.PORT || 5003;

let db=null;
let Username;
var mongoURL=process.env.MONGOURI
console.log(mongoURL);


// GridFs And GridFsBucket Variable which can be used while Storing and Displaying Image

let gfs,gridfsBucket;

const conn=mongoose.createConnection(mongoURL)

// Connecting Mongodb  Open Once for Upload Images

conn.once("open",()=>{
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    gfs=Grid(conn.db,mongoose.mongo);
    gfs.collection("uploads");
})

// Connecting Mongodb for

const connectMongodbDatabase=async(request,response)=>{
    try{
       var client=await MongoClient.connect(mongoURL,{useNewUrlParser:true})
    db=client.db("marvelMovies");
    console.log("Connected to mongodb");
    app.listen(process.env.PORT || 4001,()=>console.log(`Server is running at ${PORT}`))
    }catch(error){
        console.log(`DB Error:${error.message}`);
        process.exit(1)
    }
}

connectMongodbDatabase()

app.get("/",(req,res)=>{
    res.send("Connected");
});
/*
//  Creating Storage

var storage = new GridFsStorage({
    url: mongoURL,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
});
const upload = multer({ storage });


//  Uploading image and Registring User

app.post("/register",upload.single("profile_image"),async(request,response)=>{
    const collection=db.collection("Registrants");
    const {username,password}=request.body;
    const user=await collection.findOne({username})
    if(user!==null){
        response.status(400);
        response.send("User Alreay exists!");
    }
    else{
        if(password.length<6){
            response.status(400);
            response.send("Password is too Short!")
        }
        else{
            const hashedPassword=await bcrypt.hash(password,10);
            if(request.file)
            {
                if(request.file.contentType==="image/png"||request.file.contentType==="image/jpg"||request.file.contentType==="image/jpeg"){
                    collection.insertOne({
                                username:username,
                                password:hashedPassword,
                                profile_image:request.file.filename,
                                is_profile_pic:true,
                    });
                    response.send("User Created Successfully");
                }
                else{
                    response.status(400);
                    response.send("Invalid Image Format Request,It must be JPG,JPEG,PNG");
                }
            }
            else
            {
                collection.insertOne({
                                username:username,
                                password:hashedPassword,
                                is_profile_pic:false,
                });
                response.send("User Created Successfully");
            }
            
        }
    }
});


//  Log in User

app.post("/login",async(request,response)=>{
    const {username,password}=request.body;
    const collection=db.collection("Registrants");
    const user=await collection.findOne({username:username})
    if(user===null){
        response.status(400);
        response.send(`Invalid User!`)
    }
    else{
        const checkPassword=await bcrypt.compare(
            password,
            user.password
        );
        if(checkPassword){
            const payload={
                username:username,
            }
            const jwtToken=jwt.sign(payload,"MY_SECRET_KEY");
            response.send({jwtToken})
        }
        else{
            response.status(400);
            response.send("Invalid Password!")
        }
    }
})

//  Authenitacte JWT Token Middleware Created by N S R K Sree Charan

const authenticateToken=(request,response,next)=>{
    let jwtToken;
    const authHeader=request.headers["authorization"];
    if(authHeader!==undefined){
        jwtToken=authHeader.split(" ")[1];
    }
    if(jwtToken===undefined){
        response.status(400);
        response.send("Invalid JWT Token");
    }
    else{
        jwt.verify(jwtToken,"MY_SECRET_KEY",async(error,payload)=>{
            if(error){
                response.status(400);
                response.send("Invalid JWT Token");
            }
            else{
                Username=payload.username;
                next();
            }
        });
    }
};

// Getting  Profile Picture of User

app.get("/profile_image",authenticateToken,async(request,response)=>{
    let collection=db.collection("Registrants");
    const userDetails=await collection.findOne({username:Username});
    if(userDetails.is_profile_pic){
        collection=db.collection("uploads");
        const file=await gfs.files.findOne({filename:userDetails.profile_image});
        if(file!==null){
            if(file.contentType==="image/png"||file.contentType==="image/jpg"||file.contentType==="image/jpeg"){
                const readStream = gridfsBucket.openDownloadStream(file._id);
                readStream.pipe(response);
            }
            else{
                response.status(400);
                response.send("Invalid Image Format Request must be JPG,JPEG,PNG");
            }
        }
        else{
            response.status(400);
            response.send("File Doesn't Exists")
        }
    }
    else{
        response.status(400);
        response.send("Please Upload Your Profile Picture!");
    }
})

// Delete  Profile Picture of User

app.delete("/profile_image",authenticateToken,async(request,response)=>{
    try
    {
        let collection=db.collection("Registrants");
    const userDetails=await collection.findOne({username:Username});
    if(userDetails.is_profile_pic){
        let collection=db.collection("Registrants");
        const userDetails=await collection.findOne({username:Username});
        collection.findOneAndUpdate({_id:ObjectId(userDetails._id)},{$set:{is_profile_pic:false}})
        collection=db.collection("uploads");
        const file=await gfs.files.findOne({filename:userDetails.profile_image});
        if(file!==null){
            if(file.contentType==="image/png"||file.contentType==="image/jpg"||file.contentType==="image/jpeg"){
                gridfsBucket.delete(file._id,(err,gridStore)=>{
                    if(err){
                        response.status("400");
                        response.send(`Error: ${err}`)
                    }
                    response.send("Deleted Successfully");
                });
                
            }
            else{
                response.status(400);
                response.send("File Doesn't Exists")
            }
        }
        else{
            response.status(400);
            response.send("File Doesn't Exists")
        }
    }
    }catch(e){
        console.log(e)
    }
})

// Upadating or Uploading Profile Picture of User

app.put("/profile_image",authenticateToken,upload.single("profile_image"),async(request,response)=>{
    let collection=db.collection("Registrants");
    const userDetails=await collection.findOne({username:Username});
    if(userDetails.is_profile_pic){
        collection=db.collection("uploads");
        const file=await gfs.files.findOne({filename:request.file.filename});
        if(file!==null){
            collection=db.collection("Registrants");
            if(file.contentType==="image/png"||file.contentType==="image/jpg"||file.contentType==="image/jpeg"){
                collection.findOneAndUpdate({_id:ObjectId(userDetails._id)},{$set:{profile_image:file.filename}},(err,res)=>{
                    response.send("Profile Picture Updated Successfully");
                });
                
            }
            else{
                response.status(400);
                response.send("Invalid Image Format Request must be JPG,JPEG,PNG");
            }
        }
        else{
            response.status(400);
            response.send("Your Upload File Doesn't Exists")
        }
    }
    else{
        collection=db.collection("uploads");
        const file=await gfs.files.findOne({filename:request.file.filename});
        if(file!==null){
            collection=db.collection("Registrants");
            if(file.contentType==="image/png"||file.contentType==="image/jpg"||file.contentType==="image/jpeg"){
                await collection.findOneAndUpdate({_id:ObjectId(userDetails._id)},{$set:{profile_image:file.filename,is_profile_pic:true}});
                response.send("Profile Picture Uploaded Successfully");
            }
            else{
                response.status(400);
                response.send("Invalid Image Format Request must be JPG,JPEG,PNG");
            }
        }
        else{
            response.status(400);
            response.send("Your Upload File Doesn't Exists")
        }
    }
})

// Getting All Marvel Movies
app.get("/movies",authenticateToken,async(request,response)=>{
    const connection =db.collection("movies");
    let movies;
    await connection.find().toArray((err,res)=>{
        if(err){
            response.status(400);
            response.send(`Movies Data Not Found! ${err}`);
        }
        movies=res;
        response.send(movies);
    });
})

// Getting Movie Detail By Name

app.get("/movies/:film",authenticateToken,async(request,response)=>{
    const collection =db.collection("detailMovies");
    const {film}=request.params;
    const movie=await collection.findOne({film});
    if(movie!==null){
        response.send(movie);
    }
    else{
        response.status(400);
        response.send("Movie Not Found With this Name");
    }
})

// Like the Movie

app.put("/movies/:film",authenticateToken,async(request,response)=>{
    let collection=db.collection("detailMovies");
    const {film}=request.params;
    const movie=await collection.findOne({film});
    if(movie!==null){
        const is_user_liked=movie.liked_users.some(i=>i.username===Username)
        if(is_user_liked===false){
            collection=db.collection("movies");
            await collection.findOneAndUpdate({film},{$set:{likes:movie.liked_users.length+1}})
            collection=db.collection("detailMovies"); 
            collection.findOneAndUpdate({film},{$set:{liked_users:[{username:Username}],likes:movie.liked_users.length+1}},(err,res)=>{
                if(err){
                    response.status(400);
                    response.send("Invalid Request!")
                }
                response.send("User Liked this Movie");
            })
            
        }
        else if(is_user_liked===true){
            const remainingUsers=movie.liked_users.filter(i=>(i.username!==Username));
            collection=db.collection("movies");
            await collection.findOneAndUpdate({film},{$set:{likes:remainingUsers.length}})
            collection=db.collection("detailMovies"); 
            collection.findOneAndUpdate({film},{$set:{liked_users:[...remainingUsers],likes:remainingUsers.length}},(err,res)=>{
                if(err){
                    response.status(400);
                    response.send("Invalid Request!")
                }
                response.send("User Disliked this Movie");
        })
       }
    }
    else{
        response.status(400);
        response.send("Movie Not Found With this Name");
    }
})

// Comment On a Movie

app.put("/movies/comment/:film",authenticateToken,async(request,response)=>{
    const {film}=request.params;
    const {comment}=request.body;
    const collection =db.collection("detailMovies");
    const movie=await collection.findOne({film});
    if(movie!==null && comment!==undefined){
        const commentStructure={
            id:crypto.randomUUID(),
            username:Username,
            comment,
            time: new Date(),
        }
        await collection.findOneAndUpdate({film},{$set:{comments:[...movie.comments,commentStructure]}})
        response.send("User Commented Successfully");
    }
    else{
        response.status(400);
        response.send("Can't Post Empty Comment :!");
    }
})

// Delete Comment 

app.delete("/movies/comment/:film/:id",authenticateToken,async(request,response)=>{
    const {id,film}=request.params;
    const collection=db.collection("detailMovies");
    const movie=await collection.findOne({film});
    if(movie!==null){
        const remainingComment=movie.comments.filter(i=>(i!==id));
        await collection.findOneAndUpdate({film},{$set:{comments:[...remainingComment]}});
        response.send("Comment Deleted Successfully");
    }
    else{
        response.status(400);
        response.send("Invalid Request!");
    }
})
*/