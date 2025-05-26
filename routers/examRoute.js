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

// ============ MAIN EXAM ROUTES ============
// GET /api/exam/ - Get all exams (for students with permissions, all for admin)
examRouter.get('/', authenticate(), getExams);

// POST /api/exam/ - Create new exam (admin only)
examRouter.post('/', authenticate(), createExam);

// ============ SPECIFIC EXAM ROUTES ============  
// GET /api/exam/exams/:id - Get exam by ID
examRouter.get('/exams/:id', authenticate(), getExamById);

// PUT /api/exam/exams/:id - Update exam by ID
examRouter.put('/exams/:id', authenticate(), updateExam);

// DELETE /api/exam/exams/:id - Delete exam by ID
examRouter.delete('/exams/:id', authenticate(), deleteExam);

// ============ SUBMISSION ROUTES ============
// POST /api/exam/submit - Submit exam answers
examRouter.post('/submit', authenticate(), submitExam);

// GET /api/exam/submit - Get user's submissions/results
examRouter.get('/submit', authenticate(), getUserSubmissions);

module.exports = examRouter;

