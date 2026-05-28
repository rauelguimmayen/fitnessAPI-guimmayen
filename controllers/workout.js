const Workout = require('../models/Workout');
const User = require('../models/User');
const mongoose = require("mongoose");
const { errorHandler } = require("../auth");


module.exports.addWorkout = (req, res) => {
    const { name, duration, status, userId } = req.body;

    if (!userId || !name || !duration) {
        return res.status(400).send({ error: "All fields are required" });
    }

    if (userId !== req.user.id) {
        return res.status(403).send({ error: "Forbidden: userId does not match token" });
    }

    const newEntry = {
        name: name,
        duration: duration,
        status: status || 'pending'
    };

    Workout.findOne({ userId: req.user.id })
        .then(existingWorkout => {
            if (existingWorkout) {
                existingWorkout.workout.push(newEntry);
                return existingWorkout.save();
            } else {
                const newWorkout = new Workout({
                    userId: req.user.id,
                    workout: [newEntry]
                });
                return newWorkout.save();
            }
        })
        .then(result => {
            const addedWorkout = result.workout[result.workout.length - 1].toObject();
            addedWorkout.userId = result.userId;
            res.status(201).send(addedWorkout); // ← this line was missing
        })
        .catch(error => res.status(500).send({ error: error.message }));
};

// ─── GET /workout/getMyWorkouts ─────────────────────────────────────────────────────────────
module.exports.getMyWorkouts = (req, res) => {
    Workout.findOne({ userId: req.user.id })
        .then(result => {
            if (!result) {
                return res.status(404).send({ error: "No workouts found" });
            }

            // Map each workout entry to include userId from the parent document
            const workouts = result.workout.map(entry => {
                const workout = entry.toObject();
                workout.userId = result.userId;
                return workout;
            });

            res.status(200).send({ workouts });
        })
        .catch(error => res.status(500).send({ error: error.message }));
};

// PUT /workouts/updateWorkout/:workoutId
module.exports.updateWorkout = (req, res) => {
    const { name, duration, status } = req.body;
    const { workoutId } = req.params;

    Workout.findOne({ userId: req.user.id })
        .then(result => {
            if (!result) {
                return res.status(404).send({ error: "No workouts found" });
            }

            // Find the specific workout entry in the array
            const workout = result.workout.id(workoutId);
            if (!workout) {
                return res.status(404).send({ error: "Workout not found" });
            }

            // Update only the fields that are provided
            workout.name = name || workout.name;
            workout.duration = duration || workout.duration;
            workout.status = status || workout.status;

            return result.save();
        })
        .then(result => {
            const updatedWorkout = result.workout.id(req.params.workoutId).toObject();
            updatedWorkout.userId = result.userId;
            res.status(200).send(updatedWorkout);
        })
        .catch(error => res.status(500).send({ error: error.message }));
};

// DELETE /workouts/deleteWorkout/:workoutId
module.exports.deleteWorkout = (req, res) => {
    const { workoutId } = req.params;

    Workout.findOne({ userId: req.user.id })
        .then(result => {
            if (!result) {
                return res.status(404).send({ error: "No workouts found" });
            }

            const workout = result.workout.id(workoutId);
            if (!workout) {
                return res.status(404).send({ error: "Workout not found" });
            }

            workout.deleteOne();
            return result.save();
        })
        .then(() => {
            res.status(200).send({ message: "Workout deleted successfully" });
        })
        .catch(error => res.status(500).send({ error: error.message }));
};