const userServices=require("../services/userServices");
const tokenServices=require("../services/tokenServices");
const { getGridFS } = require("../config/db");

exports.registerUser=async(req,res,next)=>{
    try{
        const {username}=req.body;
        debugger
        const is_profile_pic=!!req.file;
        const existingUser=await userServices.getUser(username);
        if(existingUser){
            return res.status(401).json({message:"User Already exists with this user name"});
        }

        const user=await userServices.createUser({
            ...req.body,
            is_profile_pic,
            profile_image:req?.file?.filename
        });
        const accessToken= tokenServices.createAccessToken(user.id);
        const refreshToken=tokenServices.createRefreshToken(user.id);

        res
            .cookie("refreshToken",refreshToken,{
                httpOnly:true,
                secure:true,
                sameSite:"strict",
                maxAge:7*24*60*60*1000,
            }) 
            .status(201)
            .json({
                message:"User Created Successfully",
                accessToken,
                user:{
                    id:user._id,
                    name:user.username,
                    email:user.email,
                    is_profile_pic,
                    profile_image:req?.file?.filename
                }
            });
    }catch(err){
        next(err);
    }
};


exports.loginUser = async(req,res,next)=>{
    try{
        const {username,password}=req.body;
        const user=await userServices.getUser(username);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const isMatch=await user.checkPassword(password);
        if(!isMatch){
            return res.status(401).json({message:"Invalid Password"});
        }

        const accessToken=tokenServices.createAccessToken(user.id);
        const refreshToken=tokenServices.createRefreshToken(user.id);

        res
            .cookie("refreshToken",refreshToken,{
                httpOnly:true,
                secure:true,
                sameSite:"strict",
                maxAge:7*24*60*60*1000,
            })
            .json({
                message:"Login Successful",
                accessToken,
                user:{
                    id:user._id,
                    name:user.username,
                    email:user.email,
                    profile_image:user.name,
                }
            });
    }catch(e){
        next(err);
    }
};

exports.refreshToken=async(req,res,next)=>{
    try{
        const token=req.cookies.refreshToken;
        if(!token) return res.status(401).json({message:"No refresh token"});

        const decoded=tokenServices.verifyRefreshToken(token);
        const user=await userServices.getUserById(decoded.id);
        if(!user) return res.status(404).json({messsage:"User not found"});

        const newAccessToken=tokenServices.createAccessToken(user.id);
        res.json({accessToken:newAccessToken});
    } catch(err){
        return res.status(403).json({message:"Invalid refresh token"});
    }
};


exports.getTopContributors=async(req,res,next)=>{
    try{
        const movies=await userServices.getTopContributors(req.params);
        res.json({movies});
    }catch(err){
        next(err);
    }
}

exports.getProfileImage=async(req,res,next)=>{
    try{
        const userId=req.params.userId;
        const user=await userServices.getUserById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        if(!user.is_profile_pic || !user.profile_image){
            return res.status(404).json({message:"No Profile Picture"});
        }
        const gfs=getGridFS();
        const files = await gfs.find({ filename: user.profile_image }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "File Not Found" });
        }
        const file = files[0];
        res.setHeader("Content-Type", file.contentType);
        res.setHeader("Content-Disposition", `inline; filename=${file.filename}`);

        const readStream = gfs.openDownloadStreamByName(file.filename);
        readStream.pipe(res);
    }catch(err){
        next(err);
    }
}

exports.updateProfileImage=async(req,res,next)=>{
    try{
        const userId=req.params.userId;
        const user=await userServices.getUserById(userId);

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        if(!req.file){
            return res.status(404).json({message:"Image not uploaded"});
        }

        await userServices.updateProfileImage(userId,req.file.filename);
        res.json({message:"Image Updated successfully",file:req.file});
    }catch(err){
        next(err);
    }
};
exports.deleteProfileImage=async(req,res,next)=>{
    try{
        
        const userId=req.params.userId;
        const user=await userServices.getUserById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

         if(!user.is_profile_pic || !user.profile_image){
            return res.status(404).json({message:"No Profile Picture"});
        }


        const filename=user.profile_image;
        
        const gfs=getGridFS();
        const files=await gfs.find({filename:filename}).toArray();
        if(!files || !files?.length){
            return res.status(404)?.json({message:"File Not Found"});
        }

        const ObjectId=files[0]?._id;

        gfs.delete(ObjectId,async(err)=>{
            if(err){
                return res.status(500).json({message:"Error while deleting the profile pic",error:err});
            }

            try {
                await userServices.deleteProfileImage(userId);
                return res.status(200).json({ message: "Profile Pic Deleted Successfully" });
            } catch (dbErr) {
                return res.status(500).json({ message: "File deleted from storage, but failed to update user", error: dbErr });
            }
        })
    }catch(err){
        next(err);
    }
};