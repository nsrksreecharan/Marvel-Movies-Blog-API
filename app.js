const express=require("express");
const morgan=require("morgan");
const cors=require("cors");
const cookieParser = require("cookie-parser");
const errorHandler=require("./middleware/errorHandler");
const moviesRoute=require("./routes/moviesRoute");
const userRoute=require("./routes/userRoute");
const {protect}=require("./middleware/authentication");

const app=express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://nsrksreecharan.github.io'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies/credentials
  })
);
app.use(morgan('dev'));
app.use((req, res, next) => {
  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    return next();
  }
  express.json()(req, res, next);
});
// app.use(express.json());
app.use(cookieParser());


app.use("/movies",protect,moviesRoute);
app.use("/user",userRoute);

app.use(errorHandler);


module.exports=app;
