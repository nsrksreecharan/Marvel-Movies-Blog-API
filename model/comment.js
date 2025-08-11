const mongoose=require("mongoose");

const Comment=mongoose.Schema({
    "comment":{type:String, required:true},
    "movieId":{
        type:mongoose.Schema.Types.ObjectId,
        ref:"movies",
        required: true,
    },
    "userId":{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: true,
    },
},{timestamps:true});

module.exports=mongoose.model("comments",Comment);