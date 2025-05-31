const Proctor = require('../models/Proctor');
const Student = require('../models/User');
const StudentActivity = require('../models/studentActivity');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        let studentList = [];
        if (students) {
            studentList = students.filter(student => student?.role === "student");
        }
        res.status(200).json(studentList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update exam permission
exports.updateExamPermission = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if the role is 'student'
        if (student.role !== 'student') {
            return res.status(403).json({ message: 'Only students can have exam permissions updated' });
        }

        // Update examPermission
        student.examPermission = req.body.examPermission;
        await student.save();

        res.status(200).json({ message: 'Permission updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//handle role change
exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        const updatedUser = await Student.findByIdAndUpdate(id, { role }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Role updated successfully', updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}


// Create or Update Student Activity
exports.createActivity = async (req, res) => {
    const { acivityType, examId, exam, userId } = req.body;

    try {
        // Find the student by ID from request parameters
        const student = await Student.findById(userId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Create a new student activity or update an existing one
        const activityData = {
            studentId: student._id,
            examId: examId,
            exam: exam,
            name: student.name,
            email: student.email,
            acivityType: acivityType,
            examPermission: req.body.examPermission || true
        };

        // Save activity to the database
        const activity = new StudentActivity(activityData);
        await activity.save();

        res.status(201).json({ message: 'Student activity created successfully', activity });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get all student activities (Admin)
exports.getAllStudentActivities = async (req, res) => {
    try {
        // Find all student activities in the database
        const activities = await StudentActivity.find()
            .populate('studentId', 'name email') // Populating only relevant fields from Student
            .exec();

        if (!activities || activities.length === 0) {
            return res.status(404).json({ message: 'No student activities found' });
        }

        res.status(200).json({ activities });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new proctor record
exports.createProctor = async (req, res) => {
    try {
        const { examId, screenshot, userId, ...proctorData } = req.body; // Destructure examId, screenshot, and rest of the data from the request body
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
};

//get proctor by user id
exports.getProctorByUserId = async (req, res) => {
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
};
