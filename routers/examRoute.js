// const express = require('express');
// const authenticate = require('../middlewares/auth');
// const {createExam , getExams , getExamById , updateExam, deleteExam, submitExam, getUserSubmissions}= require('../controllers/examController');

// const examRouter = express.Router();
// examRouter.post('/exams', authenticate(), createExam);
// examRouter.get('/', authenticate(), getExams);
// examRouter.get('/exams/:id', authenticate(), getExamById);
// examRouter.put('/exams/:id', authenticate(), updateExam);
// examRouter.delete('/exams/:id', authenticate(), deleteExam);

// //exam submit
// examRouter.post('/submit', authenticate(), submitExam);
// examRouter.post('/submit1', authenticate(), submitExam);  // Add this line for frontend compatibility
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

// Debug middleware
examRouter.use((req, res, next) => {
    console.log(`Exam Route: ${req.method} ${req.path}`);
    next();
});

// Exam CRUD operations
examRouter.post('/exams', authenticate(), createExam);
examRouter.get('/', authenticate(), getExams);
examRouter.get('/exams/:id', authenticate(), getExamById);
examRouter.put('/exams/:id', authenticate(), updateExam);
examRouter.delete('/exams/:id', authenticate(), deleteExam);

// Exam submit routes
examRouter.post('/submit', authenticate(), submitExam);


// Get user submissions
examRouter.get('/submissions', authenticate(), getUserSubmissions);

// Test route - authentication இல்லாமல்
examRouter.get('/test', (req, res) => {
    res.json({ message: 'Exam route working!' });
});

module.exports = examRouter;
