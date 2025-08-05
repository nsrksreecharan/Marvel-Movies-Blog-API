const mongoose=require("mongoose");
const Like=require("../model/like");

exports.addLike=(data)=>Like.create(data);
exports.dislike = (data) => {
    return Like.findOneAndDelete({
        movieId: new mongoose.Types.ObjectId(data.movieId),
        userId: new mongoose.Types.ObjectId(data.userId),
    });
};