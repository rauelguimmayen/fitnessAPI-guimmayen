const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({

    workout: [{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',        
        required: true
    },    
    name: {
        type: String,
        required: [true, 'Workout Name is Required']
    },
    duration: {
        type: String,
        required: [true, 'Workout Duration is Required']
    },
    status: {
        type: String,
        enum: {
        values: ['completed', 'pending', 'in progress'],
        default: 'pending',
        message: 'Value is not supported, select "completed", "pending", or "in progress"'
        }
        },
    dateAdded: {
        type: Date,
        default: Date.now
    }
    }]
});


module.exports = mongoose.model('Workout', workoutSchema);