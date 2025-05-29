// const express=require('express');
// const authenticate = require('../middlewares/auth');
// const  {createExam , getExams , getExamById , updateExam, deleteExam, submitExam, getUserSubmissions}= require('../controllers/examController');

// const examRouter= express.Router();
// examRouter.post('/exams', authenticate(), createExam);
// examRouter.get('/', authenticate(), getExams);
// examRouter.get('/exams/:id', authenticate(), getExamById);
// examRouter.put('/exams/:id', authenticate(), updateExam);
// examRouter.delete('/exams/:id', authenticate(), deleteExam);

// //exam submit
// examRouter.post('/submit', authenticate(), submitExam);
// examRouter.get('/submit', authenticate(), getUserSubmissions);

// module.exports=examRouter;


const express = require('express');
const authenticate = require('../middlewares/auth');
const authorizeRole = require('../middlewares/authorizeRole'); // ✅ role middleware add பண்ணுறது முக்கியம்

const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  submitExam,
  getUserSubmissions
} = require('../controllers/examController');

const examRouter = express.Router();

// Admin or Teacher actions
examRouter.post('/exams', authenticate(), createExam);
examRouter.get('/', authenticate(), getExams);
examRouter.get('/exams/:id', authenticate(), getExamById);
examRouter.put('/exams/:id', authenticate(), updateExam);
examRouter.delete('/exams/:id', authenticate(), deleteExam);

// Exam submission — Only student allowed
examRouter.post('/submit', authenticate(), authorizeRole('student'), submitExam);
examRouter.get('/submit', authenticate(), authorizeRole('student'), getUserSubmissions);

module.exports = examRouter;
