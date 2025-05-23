const express=require('express');
const authenticate = require('../middlewares/auth');
const  {createExam , getExams , getExamById , updateExam, deleteExam, submitExam, getUserSubmissions}= require('../controllers/examController');

const examRouter= express.Router();
examRouter.post('/exams', authenticate(), createExam);
examRouter.get('/', authenticate(), getExams);
examRouter.get('/exams/:id', authenticate(), getExamById);
examRouter.put('/exams/:id', authenticate(), updateExam);
examRouter.delete('/exams/:id', authenticate(), deleteExam);

//exam submit
examRouter.post('/submit', authenticate(), submitExam);
examRouter.get('/submit', authenticate(), getUserSubmissions);

module.exports=examRouter;

