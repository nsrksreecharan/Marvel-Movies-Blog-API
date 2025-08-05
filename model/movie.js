const mongoose=require("mongoose");

const MovieSchema=mongoose.Schema({
    film: { type: String, required: true },
    date: { type: Date },
    phase: { type: String },
    poster: { type: String },
    rating: { type: String },
    movie_collection: { type: Number }, 
    budget: { type: Number },
    about: { type: String },
    plot: { type: String },
    cast: [{ type: String }],
    trailer_url: { type: String },
    directors: [{ type: String }],
    screenwriters: [{ type: String }],
    producers: [{ type: String }],
},{timestamps:true});

module.exports=mongoose.model("movies",MovieSchema);


