const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile, getAllStudents,  updateStudentById } = require('../controllers/userController');
const   authenticate  = require('../middlewares/auth');


const userRoute = express.Router();

// Common routes
userRoute.post('/register',registerUser);
userRoute.post('/login',  loginUser);

//profile
userRoute.get('/Profile', authenticate(), getProfile);
userRoute.put('/Profile/:id',authenticate(), updateProfile );

//admin routes
userRoute.get('/admin/students',authenticate('admin'), getAllStudents );
userRoute.put('/admin/students/:id',authenticate('admin'), updateStudentById );







module.exports=userRoute;