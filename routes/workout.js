const express = require('express');
const router = express.Router();
const workoutController = require("../controllers/workout");
const { verify } = require("../auth");


// POST /workouts/addWorkout
router.post("/addWorkout", verify, workoutController.addWorkout);

// GET /workouts/getMyWorkouts

router.get('/getMyWorkouts', verify, workoutController.getMyWorkouts);

// PUT /workouts/updateWorkout/:workoutId
router.patch("/updateWorkout/:workoutId", verify, workoutController.updateWorkout);

// DELETE /workouts/deleteWorkout/:workoutId
router.delete("/deleteWorkout/:workoutId", verify, workoutController.deleteWorkout);

module.exports = router;