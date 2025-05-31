// const User = require('../models/User');
// const bcrypt = require('bcrypt');
// const createToken = require('../utils/tokenUtils');


// const userController = {
//   // Register a new user (Student or Admin)
//   registerUser: async (req, res) => {
//     try {
//       // get the userId from the request object
//       const { name, email, password, role } = req.body
//       //check if the user already exists
//       const existingUser = await User.findOne({ email })

//       if (existingUser) {
//         return res.status(400).json({ message: 'user already exists' })
//       }
//       //Hashing the password 
//       //create a new user
//       const user = new User({
//         name,
//         email,
//         password,
//         role
//       })

//       //save user to database
//       await user.save()

//       // send response
//       return res.status(200).json({ user: { name, email, password, role }, message: "user registed successfully" })
//     } catch (err) {

//       return res.status(500).json({ message: 'registeration failer', error: err.message })
//     }
//   },

//   // Login user (Student or Admin)
//   loginUser: async (req, res) => {
//     try {

//       // get the details from the request body
//       const { email, password } = req.body;

//       // validate input
//       if (!email || !password) {
//         return res.status(400).json({ message: 'All fields are required' })
//       }

//       // check if user exists
//       const user = await User.findOne({ email }).select(' +password ');

//       if (!user) {
//         return res.status(400).json({ message: 'Invalid credentials' });
//       }

//       // check if password is correct
//       const isPasswordValid = await bcrypt.compare(password, user.password);

//       if (!isPasswordValid) {
//         return res.status(400).json({ message: 'Invalid credentials' });
//       }

//       const token = await createToken(user);

//       // send response
//       res.status(200).json({ token, user: { name: user.name, email: user.email, role: user.role, id: user._id, examPermission: user.examPermission }, message: "user successfully login" });

//     } catch (error) {
//       return res.status(500).json({ message: 'Login failed', error: error.message });
//     }
//   },


//   // Get user profile (Student or Admin)
//   getProfile: async (req, res) => {
//     try {
//       // const userId = req.userId;

//       // find the user by ID
//       const user = await User.findById(req.user.userId).select('-password -__v');

//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }

//       // send response
//       return res.status(200).json(user);
//     } catch (error) {
//       return res.status(500).json({ message: 'Failed to retrieve user' });
//     }
//   },


//   updateProfile: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { dob, address, gender } = req.body;

//       const user = await User.findById(id);
//       if (!user) {
//         return res.status(404).json({ message: "user not found" });
//       }

//       const updateUser = await User.findByIdAndUpdate(
//         id,
//         {
//           "profile.dob": dob, //we mentioned the profile in schema 
//           "profile.address": address,
//           "profile.gender": gender
//         },
//         { new: true }
//       );

//       res.status(200).json({ message: "user updated successfully", updateUser });
//     } catch (err) {
//       res.status(500).json({ message: "update user failed", error: err.message });
//     }
//   },

//   getAllStudents : async (req, res) => {
//     try {
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ error: 'Only admins can view all students' });
//         }
//         const students = await User.find({ role: 'student' }).select('-password');
//         return res.status(200).json(students);
//     } catch (err) {
//         return res.status(500).json({ message: 'Internal server error',error:error.message });
//     }
// },

// // Admin: Update student details
// updateStudentById: async (req, res) => {
//     try {
//       const {id} = req.params
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ error: 'Only admins can update student details' });
//         }

//         const student = await User.findById(id);
//         if (!student || student.role !== 'student') {
//             return res.status(404).json({ error: 'Student not found' });
//         }

//         Object.assign(student.profile.studentDetails, req.body); //merge  all those values
//         await student.save();
//         return res.status(200).json(student);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }

//   }

// };
// module.exports = userController;

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const createToken = require('../utils/tokenUtils')

// Register a new user (Student or Admin)

const userController={
registerUser : async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        //Hashing the Password
        const user = new User({ name, email, password, role });
        await user.save();
        res.status(201).json({ user: { name, email, role }, message: "user successfully registed" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
},

// Login user (Student or Admin)
loginUser : async (req, res) => {

    try {
        const { email, password } = req.body;
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Check if the user exists with the provided email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare the provided password with the stored password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = await createToken(user);
        res.status(200).json({ token, user: { name: user.name, email: user.email, role: user.role, id: user._id, examPermission: user.examPermission }, message: "user successfully login" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
},

// Get user profile (Student or Admin)
getProfile : async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
},

// Update student profile
updateProfile : async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(403).json({ error: 'User not found' });
        }

        const { dob, address, gender } = req.body;
        user.profile.address = address;
        user.profile.dob = dob;
        user.profile.gender = gender;

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
},

// Admin: Get all students
getAllStudents : async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can view all students' });
        }
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
},

// Admin: Update student details
updateStudent :async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can update student details' });
        }

        const student = await User.findById(req.params.id);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ error: 'Student not found' });
        }

        Object.assign(student.profile.studentDetails, req.body);
        await student.save();
        res.json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
  }
};

module.exports = userController;