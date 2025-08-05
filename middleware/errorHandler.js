module.exports=(err,req,res,next)=>{
    console.log(err.stack,"error stack");
    res.status(500).json({message:"Internal server error",err});
};