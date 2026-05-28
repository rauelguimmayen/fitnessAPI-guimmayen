const Workout = require('../models/Workout');
const { errorHandler } = require("../auth");

// POST /workouts/addWorkout
module.exports.addWorkout = (req, res) => {
    const { name, duration, status } = req.body;

    if (!name || !duration) {
        return res.status(400).send({ error: "All fields are required" });
    }

    const newEntry = {
        userId: req.user.id,
        name: name,
        duration: duration,
        status: status || 'pending'
    };

    // Find the single global workout document or create one
    Workout.findOne()
        .then(existingWorkout => {
            if (existingWorkout) {
                existingWorkout.workout.push(newEntry);
                return existingWorkout.save();
            } else {
                const newWorkout = new Workout({
                    workout: [newEntry]
                });
                return newWorkout.save();
            }
        })
        .then(result => {
            const addedWorkout = result.workout[result.workout.length - 1].toObject();
            res.status(201).send(addedWorkout);
        })
        .catch(error => errorHandler(error, req, res));
};

// GET /workouts/getMyWorkouts
module.exports.getMyWorkouts = (req, res) => {
    Workout.findOne()
        .then(result => {
            if (!result) {
                return res.status(404).send({ error: "No workouts found" });
            }

            // Filter only workouts belonging to the logged in user
            const workouts = result.workout.filter(entry => 
                entry.userId.toString() === req.user.id
            );

            if (workouts.length === 0) {
                return res.status(404).send({ error: "No workouts found" });
            }

            res.status(200).send({ workouts });
        })
        .catch(error => errorHandler(error, req, res));
};

// PATCH /workouts/updateWorkout/:workoutId
module.exports.updateWorkout = (req, res) => {
    const { name, duration, status } = req.body;
    const { workoutId } = req.params;

    if (!name && !duration && !status) {
        return res.status(400).send({ error: "At least one field (name, duration, status) is required" });
    }

    Workout.findOne()
        .then(result => {
            if (!result) {
                return res.status(404).send({ error: "No workouts found" });
            }

            const workout = result.workout.id(workoutId);
            if (!workout) {
                return res.status(404).send({ error: "Workout not found" });
            }

            // Ensure user can only update their own workout
            if (workout.userId.toString() !== req.user.id) {
                return res.status(403).send({ error: "Forbidden: You can only update your own workouts" });
            }

            if (name) workout.name = name;
            if (duration) workout.duration = duration;
            if (status) workout.status = status;

            return result.save();
        })
        .then(result => {
            const updatedWorkout = result.workout.id(req.params.workoutId).toObject();
            res.status(200).send({
                message: "Workout updated successfully",
                updatedWorkout
            });
        })
        .catch(error => errorHandler(error, req, res));
};

// DELETE /workouts/deleteWorkout/:workoutId
module.exports.deleteWorkout = (req, res) => {
    const { workoutId } = req.params;

    Workout.findOne()
        .then(result => {
            if (!result) {
                return res.status(404).send({ error: "No workouts found" });
            }

            const workout = result.workout.id(workoutId);
            if (!workout) {
                return res.status(404).send({ error: "Workout not found" });
            }

            // Ensure user can only delete their own workout
            if (workout.userId.toString() !== req.user.id) {
                return res.status(403).send({ error: "Forbidden: You can only delete your own workouts" });
            }

            workout.deleteOne();
            return result.save();
        })
        .then(() => {
            res.status(200).send({ message: "Workout deleted successfully" });
        })
        .catch(error => errorHandler(error, req, res));
};