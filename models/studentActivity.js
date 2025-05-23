const mongoose = require('mongoose');

// Define Student Activity Schema
const studentActivitySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    examId: {
        type: String,
        required: true
    },
    exam: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    activityType: {     //type:exam_started,exam_submitted like this
        type: String, 
        required: true
    },
    examPermission: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create Student Activity Model
module.exports = mongoose.model('StudentActivity', studentActivitySchema, );

