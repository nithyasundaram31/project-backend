
// const Exam = require('../models/Exam');
// const Question = require('../models/Question');
// const Submission = require('../models/Submission');
// const User = require('../models/User');

//   const  examController={ 
// createExam :async (req, res) => {
//     try {
//         const exam = new Exam({ ...req.body, createdBy: req.user?.userId });
//         await exam.save();
//         res.status(201).json({ exam, message: 'Exam Created successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error creating exam', error });
//     }
// },

// // Get all exams
// getExams : async (req, res) => {
//     const { userId, role } = req.user; // Extract userId and role from req.user
//     let exams;
//     let submittedData;
//     let user;
//     try {
//         if (role === "student") {
//             // Students should get all exams
//             exams = await Exam.find();
//             //get exam permission
//             user = await User.find({ _id: userId })
//                 .select('_id examPermission role')
//                 .exec();
//             //get exam submite
//             submittedData = await Submission.find({ userId })
//                 .populate({
//                     path: 'examId',
//                     select: 'name' // Only select the 'name' field from the 'examId'
//                 })
//                 .populate({
//                     path: 'userId',
//                     select: 'examPermission' // Only select the 'examPermission' field from the 'userId'
//                 })
//                 .exec();
//         } else if (role === "admin") {
//             // Admins should get only the exams they created
//             exams = await Exam.find();
//         } else {
//             return res.status(403).json({ message: 'Unauthorized access' });
//         }

//         res.status(200).json({ success: true, exams, submittedData, user }); // Send the exams data as JSON
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching exams', error }); // Handle server errors
//     }
// },

// // Get exam by ID
// getExamById : async (req, res) => {
//     try {
//         const { id } = req.params; // Get the exam ID from the request parameters
//         // Find the exam by ID and populate the questions
//         const exam = await Exam.findById(id);
//         const questions = await Question.find({ examId: id });

//         if (!exam) {
//             return res.status(404).json({ message: 'Exam not found' });
//         }
//         // Transform the data structure for better organization
//         const formattedExam = {
//             examData: {
//                 id: exam._id,
//                 name: exam.name,
//                 date: exam.date,
//                 duration: exam.duration,
//                 totalMarks: exam.totalMarks,
//                 totalQuestions: exam.totalQuestions,
//                 description: exam.description,
//                 createdBy: exam.createdBy
//             },
//             questions: questions.map((question, index) => ({
//                 questionNumber: index + 1,
//                 id: question._id,
//                 question: question.question,
//                 questionType: question.questionType,
//                 options: question.options,
//                 difficulty: question.difficulty,
//                 // Only include correctAnswer if needed (might want to exclude for student view)
//                 correctAnswer: question.correctAnswer
//             })),
//             metadata: {
//                 createdAt: exam.createdAt,
//                 updatedAt: exam.updatedAt
//             }
//         };

//         res.status(200).json(formattedExam);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error fetching exam', error });
//     }
// },

// //update exam
// updateExam : async (req, res) => {
//     try {
//         const exam = await Exam.findOne({ _id: req.params.id });
//         if (!exam) {
//             return res.status(404).json({ message: 'Exam not found' });
//         }
//         // Update the exam fields with the new data from the request body
//         Object.assign(exam, req.body); // Use Object.assign to update fields
//         await exam.save();
//         res.status(200).json({ message: 'Exam updated successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating exam', error });
//     }
// },

// //delete
// deleteExam : async (req, res) => {
//     try {
//         const exam = await Exam.findOne({ _id: req.params.id });
//         if (!exam) {
//             return res.status(404).json({ message: 'Exam not found' });
//         }
//         await exam.deleteOne();
//         res.status(200).json({ message: 'Exam deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error deleting exam', error });
//     }
// },


// //exam submit
// submitExam : async (req, res) => {
//     try {
//         const { examId, answers, warningCount } = req.body;
//         const { userId } = req.user;

//         // Fetch the exam
//         const exam = await Exam.findById(examId);
//         if (!exam) {
//             return res.status(404).json({ message: 'Exam not found' });
//         }

//         let correctAnswers = 0;
//         let totalMarks = 0;

//         // Find questions by the provided examId
//         const questions = await Question.find({ examId });

//         questions.forEach((question) => {
//             const userAnswer = answers[question._id];

//             // Skip if no answer provided
//             if (!userAnswer) return;

//             switch (question.questionType) {
//                 case 'true-false':
//                     // Convert both answers to lowercase for case-insensitive comparison
//                     if (userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
//                         correctAnswers++;
//                         totalMarks += 1;
//                     }
//                     break;

//                 case 'multiple-choice':
//                     // Convert both answers to the same case and trim whitespace
//                     const normalizedUserAnswer = userAnswer.toLowerCase().trim();
//                     const normalizedCorrectAnswer = question.correctAnswer.toLowerCase().trim();

//                     if (normalizedUserAnswer === normalizedCorrectAnswer) {
//                         correctAnswers++;
//                         totalMarks += 1;
//                     }
//                     break;

//                 // Add more question types here if needed
//                 default:
//                     console.warn(`Unhandled question type: ${question.questionType}`);
//             }
//         })
//         // Assign a grade based on totalMarks (adjust the scale as per your requirements)
//         let grade;
//         const totalQuestions = questions.length;
//         const percentage = (totalMarks / totalQuestions) * 100;

//         if (percentage >= 90) {
//             grade = 'A';
//         } else if (percentage >= 75) {
//             grade = 'B';
//         } else if (percentage >= 50) {
//             grade = 'C';
//         } else if (percentage >= 36) {
//             grade = 'D'; // Pass, but below the standard (not a failing grade)
//         } else {
//             grade = 'F'; // Fail for scores less than 35
//         }

//         // Save the submission
//         const submission = new Submission({
//             examId,
//             userId,
//             answers,
//             correctAnswers,
//             totalMarks,
//             totalQuestions,
//             grade,
//             warningCount,
//         });
//         await submission.save();

//         return res.status(201).json({
//             message: 'Exam submitted successfully',
//             marks: totalMarks,
//             grade,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Failed to submit exam' });
//     }
// },

// // Controller function to get all submissions by a user
// getUserSubmissions : async (req, res) => {
//     try {
//         const userId = req.user.userId; // Assuming user info is available in req.user after authentication

//         // Fetch all submissions made by this user
//         const submissions = await Submission.find({ userId })
//             .populate({
//                 path: 'examId', // The field in your Submission schema that references the Exam model
//                 select: 'name totalMarks totalQuestions' // Fields from the Exam model to include
//             })
//             .exec();

//         // Check if there are submissions
//         if (!submissions || submissions.length === 0) {
//             return res.status(404).json({ message: 'No submissions found for this user.' });
//         }

//         // Helper function to determine if the user's answer is correct
//         const determineIfCorrect = (question, userAnswer) => {
//             if (!userAnswer) return false;

//             // Convert both correctAnswer and userAnswer to lowercase strings for comparison
//             const correctAnswerNormalized = question.correctAnswer.toString().trim().toLowerCase();
//             const userAnswerNormalized = userAnswer.toString().trim().toLowerCase();

//             // If the answer is "true" or "false", convert to boolean for comparison
//             const booleanMap = { "true": true, "false": false };

//             const correctAnswerBoolean = booleanMap[correctAnswerNormalized] !== undefined
//                 ? booleanMap[correctAnswerNormalized]
//                 : correctAnswerNormalized;

//             const userAnswerBoolean = booleanMap[userAnswerNormalized] !== undefined
//                 ? booleanMap[userAnswerNormalized]
//                 : userAnswerNormalized;

//             // Compare the normalized values
//             return correctAnswerBoolean === userAnswerBoolean;
//         };


//         // Fetch questions and user's answers for each submission
//         const submissionsWithQuestions = await Promise.all(submissions.map(async (submission) => {
//             // Fetch the questions for the specific exam
//             const questions = await Question.find({ examId: submission.examId._id }).exec();

//             // Assuming submission.answers is a Map
//             const userAnswers = submission.answers; // If it's a Map, no need to convert to array

//             // Attach the user's answers to each corresponding question
//             const questionsWithUserAnswers = questions.map(question => {
//                 // Get the user's answer for this specific question using Map.get()
//                 const userAnswer = userAnswers.get(question._id.toString());

//                 return {
//                     ...question.toObject(), // Convert the mongoose document to a plain object
//                     userAnswer: userAnswer || null, // Add user's answer to the question object
//                     isCorrect: determineIfCorrect(question, userAnswer) // Call a function to check correctness
//                 };
//             });

//             return {
//                 ...submission.toObject(), // Convert mongoose document to plain object
//                 questions: questionsWithUserAnswers // Include questions along with user's answers
//             };
//         }));

//         // Return the submissions with questions and user's answers
//         return res.status(200).json(submissionsWithQuestions); // Send the combined data back in the response
//     } catch (error) {
//         console.error('Error fetching user submissions:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to retrieve submissions.',
//         });
//  }
// }
// };

// module.exports = examController;


const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const User = require('../models/User');

const examController = { 
  createExam: async (req, res) => {
    try {
      // Only admin can create exams
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can create exams' });
      }
      
      const exam = new Exam({ ...req.body, createdBy: req.user?.userId });
      await exam.save();
      res.status(201).json({ exam, message: 'Exam Created successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error creating exam', error });
    }
  },

  // Get all exams - FIXED VERSION
  getExams: async (req, res) => {
    const { userId, role } = req.user;
    
    try {
      console.log('Getting exams for user:', { userId, role });
      
      if (role === "student") {
        // Check student's exam permission first
        const user = await User.findById(userId).select('examPermission');
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // If examPermission is false, deny access
        if (user.examPermission === false) {
          return res.status(403).json({ 
            message: 'Exam Access Denied',
            details: 'You do not have permission to take exams at this time. Please contact the admin.'
          });
        }
        
        // Get all active exams for students
        const exams = await Exam.find({ isActive: { $ne: false } }); // Only active exams
        
        // Get submitted exams by this student
        const submittedData = await Submission.find({ userId })
          .populate({
            path: 'examId',
            select: 'name'
          })
          .exec();
        
        res.status(200).json({ 
          success: true, 
          exams, 
          submittedData,
          user: { examPermission: user.examPermission }
        });
        
      } else if (role === "admin") {
        // Admins can see all exams
        const exams = await Exam.find();
        res.status(200).json({ success: true, exams });
        
      } else {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
      
    } catch (error) {
      console.error('Error fetching exams:', error);
      res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
  },

  // Get exam by ID - with permission check
  getExamById: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;
      
      // If student, check exam permission
      if (role === 'student') {
        const user = await User.findById(userId).select('examPermission');
        if (!user || user.examPermission === false) {
          return res.status(403).json({ 
            message: 'Exam Access Denied',
            details: 'You do not have permission to access exams.'
          });
        }
      }
      
      const exam = await Exam.findById(id);
      const questions = await Question.find({ examId: id });

      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      const formattedExam = {
        examData: {
          id: exam._id,
          name: exam.name,
          date: exam.date,
          duration: exam.duration,
          totalMarks: exam.totalMarks,
          totalQuestions: exam.totalQuestions,
          description: exam.description,
          createdBy: exam.createdBy
        },
        questions: questions.map((question, index) => ({
          questionNumber: index + 1,
          id: question._id,
          question: question.question,
          questionType: question.questionType,
          options: question.options,
          difficulty: question.difficulty,
          // Only include correctAnswer for admin
          ...(role === 'admin' && { correctAnswer: question.correctAnswer })
        })),
        metadata: {
          createdAt: exam.createdAt,
          updatedAt: exam.updatedAt
        }
      };

      res.status(200).json(formattedExam);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching exam', error });
    }
  },

  updateExam: async (req, res) => {
    try {
      // Only admin can update exams
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can update exams' });
      }
      
      const exam = await Exam.findOne({ _id: req.params.id });
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      Object.assign(exam, req.body);
      await exam.save();
      res.status(200).json({ message: 'Exam updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating exam', error });
    }
  },

  deleteExam: async (req, res) => {
    try {
      // Only admin can delete exams
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can delete exams' });
      }
      
      const exam = await Exam.findOne({ _id: req.params.id });
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      await exam.deleteOne();
      res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting exam', error });
    }
  },

  submitExam: async (req, res) => {
    try {
      const { examId, answers, warningCount } = req.body;
      const { userId, role } = req.user;

      // Only students can submit exams
      if (role !== 'student') {
        return res.status(403).json({ message: 'Only students can submit exams' });
      }
      
      // Check exam permission
      const user = await User.findById(userId).select('examPermission');
      if (!user || user.examPermission === false) {
        return res.status(403).json({ 
          message: 'Exam submission denied. You do not have permission to submit exams.'
        });
      }

      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      let correctAnswers = 0;
      let totalMarks = 0;

      const questions = await Question.find({ examId });

      questions.forEach((question) => {
        const userAnswer = answers[question._id];
        if (!userAnswer) return;

        switch (question.questionType) {
          case 'true-false':
            if (userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
              correctAnswers++;
              totalMarks += 1;
            }
            break;

          case 'multiple-choice':
            const normalizedUserAnswer = userAnswer.toLowerCase().trim();
            const normalizedCorrectAnswer = question.correctAnswer.toLowerCase().trim();
            if (normalizedUserAnswer === normalizedCorrectAnswer) {
              correctAnswers++;
              totalMarks += 1;
            }
            break;

          default:
            console.warn(`Unhandled question type: ${question.questionType}`);
        }
      });
      
      let grade;
      const totalQuestions = questions.length;
      const percentage = (totalMarks / totalQuestions) * 100;

      if (percentage >= 90) {
        grade = 'A';
      } else if (percentage >= 75) {
        grade = 'B';
      } else if (percentage >= 50) {
        grade = 'C';
      } else if (percentage >= 36) {
        grade = 'D';
      } else {
        grade = 'F';
      }

      const submission = new Submission({
        examId,
        userId,
        answers,
        correctAnswers,
        totalMarks,
        totalQuestions,
        grade,
        warningCount,
      });
      
      await submission.save();

      return res.status(201).json({
        message: 'Exam submitted successfully',
        marks: totalMarks,
        grade,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to submit exam' });
    }
  },

  getUserSubmissions: async (req, res) => {
    try {
      const userId = req.user.userId;

      const submissions = await Submission.find({ userId })
        .populate({
          path: 'examId',
          select: 'name totalMarks totalQuestions'
        })
        .exec();

      if (!submissions || submissions.length === 0) {
        return res.status(404).json({ message: 'No submissions found for this user.' });
      }

      const determineIfCorrect = (question, userAnswer) => {
        if (!userAnswer) return false;
        const correctAnswerNormalized = question.correctAnswer.toString().trim().toLowerCase();
        const userAnswerNormalized = userAnswer.toString().trim().toLowerCase();
        const booleanMap = { "true": true, "false": false };
        const correctAnswerBoolean = booleanMap[correctAnswerNormalized] !== undefined
          ? booleanMap[correctAnswerNormalized]
          : correctAnswerNormalized;
        const userAnswerBoolean = booleanMap[userAnswerNormalized] !== undefined
          ? booleanMap[userAnswerNormalized]
          : userAnswerNormalized;
        return correctAnswerBoolean === userAnswerBoolean;
      };

      const submissionsWithQuestions = await Promise.all(submissions.map(async (submission) => {
        const questions = await Question.find({ examId: submission.examId._id }).exec();
        const userAnswers = submission.answers;
        const questionsWithUserAnswers = questions.map(question => {
          const userAnswer = userAnswers.get(question._id.toString());
          return {
            ...question.toObject(),
            userAnswer: userAnswer || null,
            isCorrect: determineIfCorrect(question, userAnswer)
          };
        });

        return {
          ...submission.toObject(),
          questions: questionsWithUserAnswers
        };
      }));

      return res.status(200).json(submissionsWithQuestions);
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve submissions.',
      });
    }
  }
};

module.exports = examController;