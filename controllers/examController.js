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

// Get all exams
exports.getExams = async (req, res) => {
    const { userId, role } = req.user;
    let exams;
    let submittedData;
    let user;
    try {
        if (role === "student") {
            exams = await Exam.find();
            user = await User.find({ _id: userId })
                .select('_id examPermission role')
                .exec();
            submittedData = await Submission.find({ userId })
                .populate({
                    path: 'examId',
                    select: 'name'
                })
                .populate({
                    path: 'userId',
                    select: 'examPermission'
                })
                .exec();
        } else if (role === "admin") {
            exams = await Exam.find();
        } else {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        res.status(200).json({ success: true, exams, submittedData, user });
    } catch (error) {
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

// Exam submit
exports.submitExam = async (req, res) => {
    try {
        const { examId, answers, warningCount } = req.body;
        const { userId } = req.user;

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

        if(!submissions || submissions.length === 0) {
            return res.status(404).json({ message: 'No submissions found for this user.' });
        }
                    
        const determineIfCorrect = (question, userAnswer) => {
            if (!userAnswer) return false;
            const correctAnswerNormalized = question.correctAnswer?.toString().trim().toLowerCase();
            const userAnswerNormalized = userAnswer?.toString().trim().toLowerCase();

            const booleanMap = { "true": true, "false": false };
            const correctAnswerBoolean = booleanMap[correctAnswerNormalized] !== undefined
                ? booleanMap[correctAnswerNormalized]
                : correctAnswerNormalized;
            const userAnswerBoolean = booleanMap[userAnswerNormalized] !== undefined
                ? booleanMap[userAnswerNormalized]
                : userAnswerNormalized;
            return correctAnswerBoolean === userAnswerBoolean;
        };

        // Defensive: filter out null/invalid submissions
        const validSubmissions = submissions.filter(sub => sub && sub.examId);

        const submissionsWithQuestions = await Promise.all(validSubmissions.map(async (submission) => {
            if (!submission || !submission.examId) return null;

            const questions = await Question.find({ examId: submission.examId._id }).exec();
            const userAnswers = submission.answers || {};

            const questionsWithUserAnswers = questions.map(question => {
                let userAnswer = null;
                if (typeof userAnswers.get === "function") {
                    userAnswer = userAnswers.get(question._id.toString());
                } else {
                    userAnswer = userAnswers[question._id.toString()] || userAnswers[question._id] || null;
                }
                return {
                    ...question.toObject(),
                    userAnswer: userAnswer || null,
                    isCorrect: determineIfCorrect(question, userAnswer)
                };
            });

            return {
                ...submission.toObject(),
                questions: questionsWithUserAnswers,
                totalQuestions: submission.examId.totalQuestions || questions.length,
    examName: submission.examId.name,
            };
        }));

        const filteredSubmissionsWithQuestions = submissionsWithQuestions.filter(Boolean);

        return res.status(200).json(filteredSubmissionsWithQuestions);
    } catch (error) {
        console.error('Error fetching user submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve submissions.',
        });
    }
};