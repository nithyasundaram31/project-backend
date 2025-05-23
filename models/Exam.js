const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number, // in minutes
        required: true,
    },
    totalMarks: {
        type: Number,
        required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);