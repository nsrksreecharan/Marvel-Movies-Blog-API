const express=require("express");
const router=express.Router();

const moviesController=require("../controller/movieController");

router.route("/")
    .get(moviesController.getAllMovies);

router.route("/:id")
    .get(moviesController.getMovieDetails)

router.route("/comment/:id")
    .post(moviesController.addComment)
    .put(moviesController.editComment)
router.route("/like/:id")
    .delete(moviesController.deleteLike)
    .post(moviesController.addLike)

module.exports=router;