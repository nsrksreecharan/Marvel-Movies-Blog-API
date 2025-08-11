const express=require("express");
const router=express.Router();

const upload=require("../middleware/upload");
const {getGridFS}=require("../config/db");

const userController=require("../controller/userController");

router.route("/register").post(upload.single("profile_image"),userController.registerUser);
router.route("/login").post(userController.loginUser);
router.route("/refresh-token").post(userController.refreshToken);
router.route("/profile-image/:userId")
        .get(userController.getProfileImage)
        .put(upload.single("profile_image"),userController.updateProfileImage)
        .patch(userController.deleteProfileImage)

router.get("/top-contributor",userController.getTopContributors)
module.exports=router;