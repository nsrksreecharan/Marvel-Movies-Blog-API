require("dotenv").config();
const multer=require("multer");
const {GridFsStorage}=require("multer-gridfs-storage");

const storage=new GridFsStorage({
    url:process.env.MONGODB_URI,
    file:(req,file)=>{
        if(!file.originalname) throw new Error("Filename missing");
        return {
            filename: `${Date.now()}-${file.originalname}`,
            bucketName:"uploads",
            metadata:{
                uploaded_by:"Admin",
            }
        }
    }
});

const fileFilter=(req,file,cb)=>{
    const contentType=["image/png","image/jpg","image/jpeg"];
    if(contentType?.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(new Error("File type not allowed"));
    }
};

const upload=multer({storage,fileFilter});

module.exports=upload;

