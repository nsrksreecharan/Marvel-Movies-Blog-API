const express=require("express");
const product=require("./api/products")
const app=express();

const PORT=process.env.PORT || 5003;

app.use("/api/products",product);

app.listen(PORT,()=>console.log(`Server is running at ${PORT}`));