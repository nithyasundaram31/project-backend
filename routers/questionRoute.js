const express = require('express');
const authenticate = require('../middlewares/auth');
const { addQuestion, getAllQuestions, getQuestionById, updateQuestion, deleteQuestion } = require('../controllers/questionController');

const router=express.Router();

// Route to add a new question
router.post('/add', authenticate(), addQuestion);
// Route to get all questions
router.get('/', authenticate(), getAllQuestions);

// Route to get a specific question by ID
router.get('/:id', authenticate(), getQuestionById);

// Route to update a question
router.put('/:id', authenticate(), updateQuestion);

// Route to delete  a question
router.delete('/:id', authenticate(), deleteQuestion);



module.exports=router;