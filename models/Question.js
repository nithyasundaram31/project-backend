// 

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    questionType: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'],
        required: true,
    },
    options: {
        type: [String],
        validate: {
            validator: function (options) {
                if (this.questionType === 'multiple-choice') {
                    return Array.isArray(options) && options.length >= 2;
                }
                return !options || options.length === 0;
            },
            message: 'Options are only allowed for multiple-choice questions with at least two choices.',
        },
    },
    correctAnswer: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
