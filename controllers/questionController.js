const Question = require('../models/Question');

const questionController = {
    // Add a new question
    addQuestion: async (req, res) => {
        try {
            const { question, questionType, options, correctAnswer, difficulty, exam, examId } = req.body;
            const { userId } = req.user; // from JWT decoded token

            const newQuestion = new Question({
                question,
                questionType,
                options,
                correctAnswer: correctAnswer || null,
                difficulty,
                exam,
                examId,
                userId
            });

            const savedQuestion = await newQuestion.save();

            // Populate userId to get full user details
            const populatedQuestion = (await savedQuestion.populate('userId'));

            return res.status(201).json({ message: "Question created successfully!", savedQuestion: populatedQuestion });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    // Get all questions
    getAllQuestions: async (req, res) => {
        try {
            const questions = await Question.find();
            return res.status(200).json(questions);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    // Get a question by ID
    getQuestionById: async (req, res) => {
        try {
            const { id } = req.params;
            const question = await Question.findById(id).populate('userId', 'name email'); //for better understanding  
            if (!question) {
                return res.stats(404).json({ message: 'question not fund' });

            }
            return res.status(200).json(question);
        } catch (error) {
            return res.stats(400).json({ error: error.message });
        }
    },
    // Update a question
    updateQuestion: async(req,res)=>{
        try{
            const { id }=req.params;
   const updatedQuestion=await Question.findByIdAndUpdate(id, { $set:req.body}, {new:true}); //if we want to populte the userId we can 

   if(!updatedQuestion){
    return res.stats(404).json({message:'Question not found'})
   }
    return  res.status(200).json({ message: 'Question updated successfully' ,updatedQuestion });
        }catch(error){
      return res.status(400).json({ error: error.message });
        }
    },

    //delete a question
    deleteQuestion: async(req,res)=>{
        try{ 
             const { id }= req.params;
             const deletedQuestion=await Question.findByIdAndDelete(id);
        if(!deletedQuestion){
            return res.status(404).json({message:'Question not found'})
        }
return res.status(200).json({message:'Question deleted successfully'})

        }catch(error){
    return res.status(400).json({error:error.message})
        }
    }

};

module.exports = questionController;
