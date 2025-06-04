// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },

    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',   // Assuming you have a User model
        required: true 
    }, 

    answers: {
        type: Map,     //all the values must be strings when we use map.incase  object we can use number,boolean anything 
        of: String,     // Stores the user's answers
        required: true
    },

    correctAnswers: {
        type: Number,    // Number of correct answers
        required: true, 
        default: 0
    }, 
    totalMarks: {
        type: Number,
        required: true,
        default: 0
    }, 
    totalQuestions: {
        type: Number,
        required: true,
        default: 0
    },
    grade: {
        type: String   // Grade based on marks
    }, 
    warningCount: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);