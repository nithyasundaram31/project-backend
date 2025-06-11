const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const User = require('../models/User');
const mongoose = require('mongoose'); 

exports.createExam = async (req, res) => {
    try {
        const exam = new Exam({ ...req.body, createdBy: req.user?.userId });
        await exam.save();
        res.status(201).json({ exam, message: 'Exam Created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating exam', error });
    }
};


exports.getExams = async (req, res) => {
    const { userId, role } = req.user;

    try {
        let exams = await Exam.find();
        let submittedData = [];
        let user = null;

        if (role === "student") {
            submittedData = await Submission.find({ userId });

            const submittedExamIds = submittedData.map((sub) =>
                sub.examId.toString()
            );

            const enrichedExams = exams.map((exam) => {
                return {
                    ...exam.toObject(),
                    isSubmitted: submittedExamIds.includes(exam._id.toString())
                };
            });
console.log("submittedData sample:", submittedData[0]);
            user = await User.findById(userId).select('_id examPermission role');

            return res.status(200).json({
                success: true,
                exams: enrichedExams,
                submittedData,
                user
            });

        } else if (role === "admin") {
            submittedData = await Submission.find().populate('examId userId');

            //  Admin-க்கும் submission status
           
const enrichedExamsForAdmin = exams.map((exam) => {
    const examSubmissions = submittedData.filter(
        sub => sub.examId && sub.examId._id.toString() === exam._id.toString()
    );
   
   const uniqueSubmissions = examSubmissions.filter((sub, index, arr) => 
    sub?.userId &&
    arr.findIndex(s => s?.userId && s.userId.toString() === sub.userId.toString()) === index
);

    return {
        ...exam.toObject(),
        submissionCount: examSubmissions.length,
        isSubmitted: examSubmissions.length > 0
    };
});
            return res.status(200).json({
                success: true,
                exams: enrichedExamsForAdmin, // Enhanced exams with submission info
                submittedData,
                user: null
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
    } catch (error) {
        console.error("getExams error:", error);
        res.status(500).json({ message: 'Error fetching exams', error });
    }
};


          

exports.getExamById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid exam ID' });
        }

        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Now fetch questions using the correct field `exam`
        const questions = await Question.find({ exam: id });

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
                correctAnswer: question.correctAnswer
            })),
            metadata: {
                createdAt: exam.createdAt,
                updatedAt: exam.updatedAt
            }
        };

        res.status(200).json(formattedExam);
    } catch (error) {
        console.error("getExamById Error: ", error);
        res.status(500).json({ message: 'Error fetching exam', error: error.message });
    }
};


// Update exam
exports.updateExam = async (req, res) => {
    try {
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
};

// Delete exam
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findOne({ _id: req.params.id });
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        await exam.deleteOne();
        res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting exam', error });
    }
};


// Submit exam method
exports.submitExam = async (req, res) => {
    try {
        const { examId, answers, warningCount,userId: bodyUserId } = req.body;
        // const { userId } = req.user;
        console.log("🟡 Raw req.body: ", req.body);

        const userId = req.user?.userId || bodyUserId;
        console.log("📥 Submission Saved for User ID:", userId);

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Prevent re-submission
        const existingSubmission = await Submission.findOne({ examId, userId });
        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted this exam.' });
        }

        let correctAnswers = 0;
        let totalMarks = 0;

        // in  Question model field name  has 'exam' 
        const questions = await Question.find({ exam: examId }); // we have to give like this

        questions.forEach((question) => {
            // const userAnswer = answers[question._id];
          const userAnswer = answers[question._id.toString()]


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
         console.error("❌ Submit Exam Server Error:", error);
        return res.status(500).json({ message: 'Failed to submit exam' });
    }
};
// Controller function to get all submissions by a user

exports.getUserSubmissions = async (req, res) => {
    try {
        const userId = req.user.userId;

        const submissions = await Submission.find({ userId })
            .populate({
                path: 'examId',
                select: 'name totalMarks totalQuestions'
            })
            .exec();

        // if (!submissions || submissions.length === 0) {
        //     return res.status(404).json({ 
        //         message: 'No submissions found for this user.' 
        //     });
        // }

        const determineIfCorrect = (question, userAnswer) => {
            if (!userAnswer) return false;
            
            const correctAnswerNormalized = question.correctAnswer?.toString().trim().toLowerCase();
            const userAnswerNormalized = userAnswer?.toString().trim().toLowerCase();

            return correctAnswerNormalized === userAnswerNormalized;
        };

        const validSubmissions = submissions.filter(sub => sub && sub.examId);

        const submissionsWithQuestions = await Promise.all(
            validSubmissions.map(async (submission) => {
                if (!submission || !submission.examId) return null;

                // in Question model field  name  has'exam' 
                const questions = await Question.find({ 
                    exam: submission.examId._id  // here (examId instead of exam)
                }).exec();
                console.log("Fetched Questions:", questions);
                
                const userAnswers = submission.answers;
               
                
                console.log('User Answers Type:', typeof userAnswers);
                console.log('User Answers:', userAnswers);

                const questionsWithUserAnswers = questions.map(question => {
                    let userAnswer = null;
                    
                    // we should  chaeck answer it multiple ways
                    if (userAnswers instanceof Map) {
                        userAnswer = userAnswers.get(question._id.toString());
                    } 
                    else if (userAnswers && typeof userAnswers === 'object') {
                        userAnswer = userAnswers[question._id.toString()] || 
                                   userAnswers[question._id] ||
                                   null;
                    }

                    console.log(`Question ${question._id}: User Answer = ${userAnswer}`);

                    return {
                        ...question.toObject(),
                        userAnswer: userAnswer || null,
                        isCorrect: determineIfCorrect(question, userAnswer)
                    };
                });

                const submissionData = {
                    ...submission.toObject(),
                    questions: questionsWithUserAnswers,
                    totalQuestions: questions.length,
                    examName: submission.examId.name,
                    totalMarks: submission.examId.totalMarks
                };

                console.log('Final Submission Data:', submissionData);
                return submissionData;
            })
        );

        const filteredSubmissions = submissionsWithQuestions.filter(Boolean);
        
        console.log('Final Response:', filteredSubmissions);
        return res.status(200).json(filteredSubmissions);

    } catch (error) {
        console.error('Error fetching user submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve submissions.',
            error: error.message
        });
    }
};

