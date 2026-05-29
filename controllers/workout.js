const Workout = require("../models/Workout");
const { errorHandler } = require("../auth");

module.exports.addWorkout = (req, res) => {
  const { name, duration, status } = req.body;

  if (!name || !duration) {
    return res.status(400).send({ error: "All fields are required" });
  }

  Workout.create({
    userId: req.user.id,
    name,
    duration,
    status: status || "Pending",
  })
    .then((newWorkout) => {
      res.status(201).send(newWorkout);
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.getMyWorkouts = (req, res) => {
  Workout.find({ userId: req.user.id })
    .then((workouts) => {
      res.status(200).send({ workouts });
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.updateWorkout = (req, res) => {
  const { name, duration, status } = req.body;
  const { workoutId } = req.params;

  if (!name && !duration && !status) {
    return res.status(400).send({
      error: "At least one field (name, duration, status) is required",
    });
  }

  const updates = {};
  if (name) updates.name = name;
  if (duration) updates.duration = duration;
  if (status) updates.status = status;

  Workout.findOneAndUpdate(
    { _id: workoutId, userId: req.user.id },
    updates,
    { new: true, runValidators: true }
  )
    .then((updatedWorkout) => {
      if (!updatedWorkout) {
        return res.status(404).send({ error: "Workout not found" });
      }

      res.status(200).send({
        message: "Workout updated successfully",
        updatedWorkout,
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.deleteWorkout = (req, res) => {
  const { workoutId } = req.params;

  Workout.findOneAndDelete({
    _id: workoutId,
    userId: req.user.id,
  })
    .then((deletedWorkout) => {
      if (!deletedWorkout) {
        return res.status(404).send({ error: "Workout not found" });
      }

      res.status(200).send({ message: "Workout deleted successfully" });
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.completeWorkoutStatus = (req, res) => {
  const { workoutId } = req.params;

  Workout.findOneAndUpdate(
    { _id: workoutId, userId: req.user.id },
    { status: "Completed" },
    { new: true, runValidators: true }
  )
    .then((updatedWorkout) => {
      if (!updatedWorkout) {
        return res.status(404).send({ error: "Workout not found" });
      }

      res.status(200).send({
        message: "Workout marked as completed",
        updatedWorkout,
      });
    })
    .catch((error) => errorHandler(error, req, res));
};