
const mongoose= require("mongoose");
const movieServices=require("../services/movieServices");
const commentServices=require("../services/commentServices");
const likeServices=require("../services/likeServices");

exports.addMovie=async(req,res,next)=>{
    try{
        const movie=await movieServices.createMovie(req.body);
        res.status(201).json({message:"Movie Create Successfully",movie});
    }catch(err){
        next(err);
    }
}

exports.getAllMovies=async(req,res,next)=>{
    try{
        const movies=await movieServices.getAllMovies();
        res.json({movies});
    }catch(err){
        next(err);
    }
};

exports.getTopMovies=async(req,res,next)=>{
    try{
        const movies=await movieServices.getTopMovies(req.query);
        res.json({movies});
    }catch(err){
        next(err);
    }
}


exports.getYourContributions=async(req,res,next)=>{
    try{
        const userId=req.user._id;
        const movies=await movieServices.getYourContributions(userId,req.query);
        res.json({movies});
    }catch(err){
        next(err);
    }
}

exports.getMovieDetails=async(req,res,next)=>{
    try{
        const userId=new mongoose.Types.ObjectId(req.user._id);
        const movieId=req.params.id;
        if(!movieId){
            return res.status(404).json({message:"Movie Id required"})
        }
        const movie=await movieServices.getMovieById(movieId,userId);
        res.json({movie});
    }catch(err){
        next(err);
    }
}

exports.addLike=async(req,res,next)=>{
    try{
        const userId=req.user._id;
        const movieId=req.params.id;
        if(!movieId){
            return res.status(404).json({message:"Movie Id required"})
        }
        const like=await likeServices.addLike({movieId,userId,like:true});
        res.json({message:"You Liked the movie"});
    }catch(err){
        next(err);
    }
};

exports.deleteLike=async(req,res,next)=>{
    try{
        const userId=req.user._id;
        const movieId=req.params.id;
        if(!movieId){
            return res.status(404).json({message:"Movie Id required"})
        }
        const like=await likeServices.dislike({userId,movieId});
        res.json({message:"You disliked the movie"});
    }catch(err){
        next(err);
    }
};

exports.addComment=async(req,res,next)=>{
    try{
        const userId=req.user._id;
        const movieId=req.params.id;
        if(!movieId){
            return res.status(404).json({message:"Movie Id required"})
        }
        const comment=await commentServices.addComment({
            userId,
            movieId,
            comment:req.body.comment
        });
        res.json({message:"Comment Added Successfully",comment});
    }catch(err){
        next(err);
    }
};


exports.editComment=async(req,res,next)=>{
    try{
        const commentId=req.params.id;
        if(!commentId){
            return res.status(404).json({message:"Comment Id required"})
        }
        const comment=await commentServices.editComment(commentId,req.body.comment);
        res.json({message:"Comment Edited Successfully",comment});
    }catch(err){
        next(err);
    }
};

exports.deleteComment=async(req,res,next)=>{
    try{
        const commentId=req.params.id;
        if(!commentId){
            return res.status(404).json({message:"Comment Id required"})
        }
        await commentServices.deleteComment(commentId);
        res.json({message:"Comment Deleted Successfully"});
    }catch(err){

    }
};

