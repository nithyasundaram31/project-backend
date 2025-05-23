const jwt = require('jsonwebtoken');
require('dotenv').config();

const createToken = (user) => {
  try {
    const token = jwt.sign(
      { userId: user._id, role: user.role },  // Payload: userId and role
      process.env.JWT_SECRET,                 // Secret from the environment variable
      { expiresIn: process.env.JWT_EXPIRE }   // Token expiration time
    );
     
    console.log("Generated token:", token);
   
    return token;
    
  } catch (error) {
    console.error("Error creating token:", error);
    throw new Error("Token creation failed");
  }
};

module.exports = createToken;