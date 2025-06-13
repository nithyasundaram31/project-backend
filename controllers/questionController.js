const Question = require('../models/Question');

// Add a new question
const addQuestion = async (req, res) => {
    const { question, questionType, options, correctAnswer, difficulty, exam, examId } = req.body;
    const { userId } = req.user;
    try {
        const newQuestion = new Question({
            question: question,
            questionType: questionType,
            options: options,
            correctAnswer: correctAnswer || null, // can be empty if not provided
            difficulty: difficulty,
            exam: exam,
            examId: examId,
            userId: userId
        });

        const savedQuestion = await newQuestion.save();
        res.status(201).json({ savedQuestion, message: "Question created successfully!" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all questions
const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find().populate('exam');
        res.status(200).json(questions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a question by ID
const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(question);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a question
const updateQuestion = async (req, res) => {
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ updatedQuestion, message: 'Question updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a question
const deleteQuestion = async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
        if (!deletedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    addQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
};
