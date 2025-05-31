const User = require('../models/User'); // Adjust the path as necessary
const Submission = require('../models/Submission'); // Adjust the path as necessary
const Exam = require('../models/Exam'); // Adjust the path as necessary

const resultController={
getResultById : async (req, res) => {
    const { id } = req.params; // Extract userId from request parameters

    try {
        // Find user by ID
        const user = await User.findById({_id: id});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find submissions for the specific user
        const results = await Submission.find({ userId: id }); // Fetch submissions for the user {userId} key name we give anyname 

        // Check if there are any results for the specified user
        if (results.length === 0) {
            return res.status(404).json({ error: 'No results found for this user.' });
        }

        // Process results to include exam details
        const resultsWithExamDetails = await Promise.all(results.map(async (result) => {
            // Get the exam details based on the examId from the result
            const exam = await Exam.findById(result.examId);
            // If the exam exists, include it in the result
            if (exam) {
                return {
                    ...result.toObject(), // Convert result to plain object
                    exam: {
                        _id: exam._id,
                        name: exam.name,
                        subject: exam.subject,
                        date: exam.date,
                        // Include other exam details as needed
                    }
                };
            } else {
                // If no exam is found, you might want to handle this case as well
                return {
                    ...result.toObject(),
                    exam: null, // You can also omit this if you don't want to include it at all
                };
            }
        }));

        // Prepare the final response object
        const response = {
            user,
            results: resultsWithExamDetails,
        };

        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}};
module.exports=resultController;