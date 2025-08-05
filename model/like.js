const mongoose=require("mongoose");

const LikeSchema=mongoose.Schema({
    like:{
        type:Boolean,
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    movieId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"movies",
    },

},{
    timestamps:true,
});

module.exports=mongoose.model("likes",LikeSchema)