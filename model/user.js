const mongoose=require("mongoose");
const bcrypt=require("bcrypt");

const userSchema=mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String},
    profile_image:{type:String},
    is_profile_pic:{type:Boolean},
    password:{
        type:String,
        required:true,
        minlength:6,
        select:false,
    }

},{timestamps:true});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,12);
    next();
});


userSchema.methods.checkPassword=function(password){
    return bcrypt.compare(password,this.password);
}


module.exports=mongoose.model("users",userSchema);