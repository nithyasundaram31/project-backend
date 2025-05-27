const express=require('express');
const { getAllStudents, deleteStudent, updateExamPermission, updateRole, createActivity, getAllStudentActivities, createProctor, getProctorByUserId } = require('../controllers/studentController');
const authenticate = require('../middlewares/auth');



const studentRouter = express.Router();

studentRouter.get('/', authenticate(), getAllStudents );
studentRouter.delete('/:id', authenticate(), deleteStudent );
studentRouter.put('/permission/:id', authenticate(), updateExamPermission);

//role update
studentRouter.put('/role/:id', authenticate(), updateRole);

//activity
studentRouter.post('/activity', authenticate(), createActivity);
studentRouter.get('/activity', authenticate(), getAllStudentActivities);

// proctor
studentRouter.post('/proctor', authenticate(), createProctor);
studentRouter.get('/proctor/:id', authenticate(), getProctorByUserId);







module.exports=studentRouter