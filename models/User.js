const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name']
  },

  email:{
    type:String,
    required: [true, 'Please provide a email'],
     unique: true,
    
  },
  password:{
   type:String,
   required: [true, 'Please provide a password'],
    select:false, 
    maxlength:12
  },

role:{
    type:String,
    enum:['student', 'admin'],
    default:'student'
},

//  examPermission: {
//     type: Boolean, // true or false
//     default: false,   
//   },

examPermission: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Exam'
}],

  profile:{
   address: {
      type: String,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'], 
    },
    studentDetails: {  //update students id
    type: Object,
    default: {} 
  }
  }, // Nesting the profile schema
  
});
 
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); //automatic hashing the password  before save tha database this async function will run .not require to manually use in controller 
});

module.exports = mongoose.model('User', userSchema, 'users');