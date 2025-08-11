const mongoose=require("mongoose");
const {GridFSBucket}=require("mongodb");


let gfs,gridfsBucket;

const connectDB=async()=>{
    try{
        const connection=await mongoose.connect(process.env.MONGODB_URI,{dbName:"test"});
        const db=mongoose.connection.db;

        gridfsBucket=new GridFSBucket(db,{bucketName:"uploads"});
        gfs=gridfsBucket;
        
        console.log("DB conncted successfully  & GridFSBucket Connected Successfully");
    }catch(err){
        console.log("Error while connecting to DB",err);
        process.exit(1);
    }
};

module.exports={connectDB,getGridFS:()=> gfs};