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
