const StudentActivity = require('../models/studentActivity');
const Student = require('../models/User');  // take the user info from the user model in the name of Student. we can get the all std dtails who role is student.
const Proctor = require('../models/Proctor');
const studentController = {
  //Get all students
  getAllStudents: async (req, res) => {
    try {
      const studentList = await Student.find({ role: 'student' });

      return res.status(200).json(studentList)
    }

    catch (err) {
      return res.status(500).json({ message: 'Internal server error', error: err.message })
    }
  },

  // Delete student
  deleteStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const student = await Student.findByIdAndDelete(id)
      if (!student) {
        return res.status(404).json({ message: " student not  found" });
      }
      return res.status(200).json({ message: ' student deleted succssfully' })

    } catch (error) {
      return res.status(500).json({ message: ' Error deleting student', error: error.message })
    }
  },

  // Update exam permission

  updateExamPermission: async (req, res) => {
  try {
    const { id } = req.params;
    const { examPermission } = req.body;
    const student = await Student.findByIdAndUpdate(
      id,
      { examPermission: examPermission },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ message: "Only students can have exam permissions updated" });
    }
    res.status(200).json({ message: 'Permission updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating permission', error: error.message });
  }
},

  //handle role change
  updateRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body; //To allow an admin to change the role of a user (after they register), like from 'student'

      const updatedUser = await Student.findByIdAndUpdate(id, { role }, { new: true });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ message: 'Role updated successfully', updatedUser });

    } catch (error) {
      return res.status(200).json({ message: 'Internal Server error', error: error.message });
    }
  },

  createActivity: async (req, res) => {
    try {
      const { activityType, examId, exam, userId } = req.body;

      // Find the student by ID from request parameters
      const student = await Student.findById(userId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      // Create a new student activity or update an existing one
      const activityData = {
        studentId: student._id,
        examId: examId,
        exam: exam,
        name: student.name,
        email: student.email,
        activityType: activityType,
        examPermission: req.body.examPermission || true
      };


      // Save activity to the database
      const activity = new StudentActivity(activityData);
      await activity.save();

      return res.status(201).json({ message: 'Student activity created successfully', activity });

    } catch (error) {
      res.status(500).json({ message: error.message });

    }
  },
  // Get all student activities (Admin)
  getAllStudentActivities: async (req, res) => {
    try {

      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can view all students activities ' });
      }

      const activities = await StudentActivity.find() //get all created activity like how many student do activity as exam_start,like this

        .populate('studentId', 'name email').exec(); // Populating only relevant fields from Student

      if (!activities || activities.length === 0) {
        return res.status(404).json({ message: 'No student activities found' });
      }
      return res.status(200).json(activities);

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  createProctor: async (req, res) => {
    try {
      const { examId, screenshot, userId, ...proctorData } = req.body; // Destructure examId, screenshot, and rest of the data from the request body depends proctor schema
      // Find the existing proctor record by examId
      const existingProctor = await Proctor.findOne({ examId: examId, userId: userId });

      if (existingProctor) {
        // Compare the existing screenshot with the new screenshot
        if (screenshot && existingProctor.screenshot !== screenshot) {
          // If the screenshots are different, push the old screenshot to an array and update
          if (!existingProctor.screenshots) {
            existingProctor.screenshots = []; // Initialize if not present
          }
          existingProctor.screenshots.push(existingProctor.screenshot); // Save the old screenshot

          // Update the existing proctor with new data and screenshot
          existingProctor.screenshot = screenshot;
        }

        // Update other fields
        Object.assign(existingProctor, proctorData, { timestamp: new Date() });

        // Save the updated proctor
        const updatedProctor = await existingProctor.save();

        res.status(200).json({ message: 'Proctor data updated successfully', proctor: updatedProctor });
      } else {
        // If no existing proctor, create a new one
        const newProctor = new Proctor({
          examId,
          userId,
          screenshot,
          screenshots: [],
          ...proctorData,
          timestamp: new Date()
        });

        const savedProctor = await newProctor.save();
        res.status(201).json({ message: 'Proctor data created successfully', proctor: savedProctor });
      }
    } catch (error) {
      console.error('Error creating/updating proctor data:', error);
      res.status(500).json({ message: 'Error creating/updating proctor data', error: error.message });
    }
  },

 getProctorByUserId  :async (req, res) => {
    try {
        const { id } = req.params; // Extract userId from the request parameters

        // Find proctor data by userId
        const proctorData = await Proctor.findOne({ userId: id }); // Assuming 'userId' is a field in the Proctor model

        if (!proctorData) {
            return res.status(404).json({ message: 'No proctor data found for this user.' });
        }

        // Return the found proctor data
        res.status(200).json({ message: 'Proctor data retrieved successfully', proctor: proctorData });
    } catch (error) {
        console.error('Error fetching proctor data:', error);
        res.status(500).json({ message: 'Error fetching proctor data', error: error.message });
    }
}
}


module.exports = studentController;