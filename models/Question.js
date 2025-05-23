
const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    questionType: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'], // Define allowed types
        required: true,
    },
    options: {
        type: [String], // Only required for multiple-choice
        validate: {
            validator: function (options) {
                // Options are only required for multiple-choice questions
                return this.questionType !== 'multiple-choice' || (options && options.length >= 2);
            },
            message: 'Multiple-choice questions must have at least two options.',
        },
    },
    correctAnswer: {
        type: String,
        required: true, // Consider making this required to ensure there is always a correct answer
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
    },
    exam: {
        type: String,
        required: true,
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam', // Reference to the Exam model
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);