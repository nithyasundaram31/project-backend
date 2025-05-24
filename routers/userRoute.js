const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile, getAllStudents,  updateStudentById } = require('../controllers/userController');
const   authenticate  = require('../middlewares/auth');


const userRoute = express.Router();

// Common routes
userRoute.post('/register',registerUser);
userRoute.post('/login',  loginUser);

//profile
userRoute.get('/profile', authenticate(), getProfile);
userRoute.put('/profile/:id',authenticate(), updateProfile );

//admin routes
userRoute.get('/admin/students',authenticate('admin'), getAllStudents );
userRoute.put('/admin/student/:id',authenticate('admin'), updateStudentById );







module.exports=userRoute;