const mongoose=require("mongoose");
const Movie=require("../model/movie");
const { move } = require("../routes/moviesRoute");
const comment = require("../model/comment");

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

exports.getTopMovies=(params)=>{
    const { sortBy="likes",limit=10,page=1}=params;
    const limitNum=parseInt(limit);
    const skip=(parseInt(page)-1) * limitNum;
    const likesPipeline=[
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
        }
    ];
    const pipeline=[
        ...(sortBy==="likes" ? likesPipeline : []),
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
        },
        {
            $sort: {
                [sortBy]: -1,
            },
        },
        {
            $skip:skip,
        },
        {
            $limit:limitNum
        }
    ]
    return Movie.aggregate(pipeline);
}

exports.getYourContributions=(userId,{limit=10,page=1})=>{
    const limitNum = parseInt(limit);
    const skip = (parseInt(page) - 1) * limitNum;
    const pipeline=[
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
                let:{movieId:"$_id"},
                pipeline:[
                    {
                        $match:{
                            $expr:{
                                $and:[
                                    {$eq:["$movieId","$$movieId"]},
                                    {$eq:["$userId",userId]},
                                ]
                            }
                        }
                    },
                    {
                        $project:{
                            _id:0,
                            movieId:1,
                            comment:1,
                            commentId:"$_id",
                            userId:1,
                        }
                    }
                ],
                as:"userComments"
            }
        },
        {
            $addFields:{
                liked:{
                    $gt: [
                        {
                            $size:{
                                $filter:{
                                    input:"$movieLikes",
                                    as:"like",
                                    cond:{
                                        $eq:["$$like.userId",userId]
                                    }
                                }
                            },
                        },
                        0
                    ],
                },
                commentsCount:{$size:"$userComments"},
                userComments:"$userComments",
            }
        },
        {
            $match:{
                $or:[
                    {liked:true},
                    {commentsCount:{$gte:1}}
                ]
            }
        },
        {
            $project:{
                _id:0,
                movieId:"$_id",
                film:1,
                poster:1,
                rating:1,
                movie_collection:1,
                liked:1,
                commentsCount:1,
                userComments:1,
            }
        },
        {
            $sort:{ commentsCount:-1},
        },
        {$skip:skip},
        {$limit:limitNum},
    ];
    return Movie.aggregate(pipeline);

}

exports.getMovieById=(id,userId)=>{
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
                            commentId:"$_id",
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
                },
                liked:{
                    
                    $gt: [
                        {
                            $size:{
                                $filter:{
                                    input:"$movieLikes",
                                    as:"like",
                                    cond:{$eq:["$$like.userId",userId]}
                                }
                            },
                        },
                        0
                    ],
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
                movieComments: 1,
                liked: 1
            }
        }
    ]);
};