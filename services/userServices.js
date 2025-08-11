const comment = require("../model/comment");
const User=require("../model/user");

exports.createUser=(data)=>User.create(data);
exports.getUser=(name)=>User.findOne({username:name}).select("+password");
exports.getUserById=(id)=>User.findById(id).select("-password");
exports.updateProfileImage=(id,filename)=>
    User.findByIdAndUpdate(
        id,
        {
            profile_image:filename,
            is_profile_pic: true
        },
        {
            new:true
        }
    );
exports.deleteProfileImage = (id) =>
  User.findByIdAndUpdate(
    id,
    {
      $unset: { profile_image: "" },
      is_profile_pic: false
    },
    { new: true }
  );

exports.getTopContributors=({limit=10,page=1})=>{
    const limitNum = parseInt(limit);
    const skip = (parseInt(page) - 1) * limitNum;
    const pipeline=[
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"userId",
                pipeline:[
                  {
                    $lookup:{
                      from:"movies",
                      localField:"movieId",
                      foreignField:"_id",
                      as:"movie",
                    }
                  },
                  {
                    $unwind:"$movie",
                  },
                  {
                    $project:{
                      _id:0,
                      movieName:"$movie.film",
                      poster:"$movie.poster",
                    }
                  },
                ],
                as:"userLikes",
            },
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"userId",
                pipeline:[
                  {
                    $lookup:{
                      from:"movies",
                      localField:"movieId",
                      foreignField:"_id",
                      as:"movie",
                    }
                  },
                  {
                    $unwind:"$movie",
                  },
                  {
                    $project:{
                      _id:0,
                      movieName:"$movie.film",
                      poster:"$movie.poster",
                      comment:1,
                    }
                  },
                ],
                as:"userComments",
            },
        },
        {
          $addFields:{
            commentsCount:{
              $size:"$userComments",
            },
            likesCount:{
              $size:"$userComments",
            },
          }
        },
        {
          $sort:{
            commentsCount:-1,
            likesCount:-1
          }
        },
        {
          $project:{
            _id:0,
            userId:"$_id",
            username:1,
            userLikes:"$userLikes",
            userComments:"$userComments",
            commentsCount:1,
            likesCount:1
          }
        }
    ];

    return User.aggregate(pipeline);
}
