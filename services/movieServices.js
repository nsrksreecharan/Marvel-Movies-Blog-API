const mongoose=require("mongoose");
const Movie=require("../model/movie");

exports.createMovie=(movie)=>Movie.create(movie);

exports.getAllMovies=()=>{
    return Movie.aggregate([
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"movieId",
                as:"movieLikes",
            },
        },
        {
            $addFields:{
                likes:{
                    $size:{
                        $filter:{
                            input:"$movieLikes",
                            as:"like",
                            cond:{$eq:["$$like.like",true]}
                        }
                    }
                }
            }
        },
        {
            $project:{
                _id:0,
                movieId:"$_id",
                likes:1,
                film:1,
                poster:1,
                rating:1,
                movie_collection:1,
                budget:1,
                phase:1,
                date:1,
            }
        }
    ]);
};


exports.getMovieById=(id)=>{
    return Movie.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"movieId",
                as:"movieLikes",
            },
        },
        {
            $lookup:{
                from:"comments",
                let: { movieId: "$_id" }, 
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$movieId", "$$movieId"] }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    {
                        $unwind: {
                            path: "$user",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            comment: 1,
                            createdAt: 1,
                            userId: 1,
                            username: "$user.username"
                        }
                    }
                ],
                as:"movieComments",
            },
        },
        {
            $addFields:{
                likes:{
                    $size:{
                        $filter:{
                            input:"$movieLikes",
                            as:"like",
                            cond:{$eq:["$$like.like",true]}
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                movieId: "$_id",
                film: 1,
                about:1,
                cast:1,
                plot:1,
                producers:1,
                poster: 1,
                screenwriters:1,
                directors:1,
                rating: 1,
                movie_collection: 1,
                trailer_url:1,
                budget: 1,
                phase: 1,
                date: 1,
                likes: 1,
                movieComments: 1
            }
        }
    ]);
};