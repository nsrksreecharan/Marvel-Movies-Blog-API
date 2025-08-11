const express=require("express");
const router=express.Router();

const moviesController=require("../controller/movieController");

router.route("/")
    .get(moviesController.getAllMovies);

router.get("/top-movies",moviesController.getTopMovies)
router.get("/your-contribution",moviesController.getYourContributions)

router.route("/:id")
    .get(moviesController.getMovieDetails)

router.route("/comment/:id")
    .post(moviesController.addComment)
    .put(moviesController.editComment)
    .delete(moviesController.deleteComment)
router.route("/like/:id")
    .delete(moviesController.deleteLike)
    .post(moviesController.addLike)

module.exports=router;