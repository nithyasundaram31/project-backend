## Backend Setup

This document outlines the steps to set up the backend for the Online Assessment Platform, a Node.js application that provides a RESTful API to manage online exams, question banks, students, results, and more. The backend uses Node.js, Express.js, MongoDB, and JWT for user authentication.

## Prerequisites

Node.js 
MongoDB (locally or use MongoDB Atlas for cloud hosting)

## Clone the Repository

1. Clone the repository to your local machine:

```bash
git clone https://github.com/nithyasundaram31/project-backend
cd backend
```

**Install Dependencies:**

```bash
npm install
```

**Environment Variables**

To configure the application, you need to set up environment variables. Create a .env file in the root of your backend directory with the following:


```bash
MONGO_URI=mongodb://localhost:5173/online-assessmet-platform
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRE=1h
```

**MONGO_URI:** 
Your MongoDB connection string.

**JWT_SECRET:** 
A secret key for JWT token generation.

**JWT_EXPIRE:** 
The duration for which the JWT is valid (e.g., 1 hour, 7d).

**Start the Backend Server**
To start the development server, run the following command:

```bash
npm run dev
```

## Backend Tech Overview

**Node.js & Express.js:**
Handles API routes and business logic.

**MongoDB:**
Stores user data, exam questions, and results.

**Mongoose:**
Provides an ORM for MongoDB.

**JWT (JSON Web Tokens):** 
Used for authenticating and authorizing users.

**Role-based Access Control (RBAC):**
 Differentiates between admin and student routes.
 
## API Endpoints

## User Authentication

### POST /api/auth/register:
Register a new user (Admin & Student).

### POST /api/auth/login: 
Login for both Admin and Student.

## Question Bank Management (Admin Only)

### GET /api/questions:
Fetch all questions.

### POST /api/questions/add: 
Create a new question.

### PUT /api/questions/:id:
Update a specific question.

### DELETE /api/questions/:id: 
Delete a specific question.

## Exam Management (Admin Only)

### GET /api/exam: 
Get all exams.

### POST /api/exam/exmas:
Create a new exam.

### PUT /api/exam/exams/:id:
Update a specific exam.

## Students (Admin Only)

### GET /api/students:
Fetch all students.

### DELETE /api/students/:id: 
Delete a specific student.

## Results and Analytics 

### GET /api/result:
Get results for both admin (for all students) and individual students (based on role).