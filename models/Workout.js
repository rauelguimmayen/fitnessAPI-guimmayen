const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Workout Name is Required"],
  },
  duration: {
    type: String,
    required: [true, "Workout Duration is Required"],
  },
  status: {
    type: String,
    enum: {
      values: ["Completed", "Pending", "In Progress"],
      message: 'Value is not supported, select "Completed", "Pending", or "In Progress"',
    },
    default: "Pending",
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Workout", workoutSchema);