
const jwt = require('jsonwebtoken');
const authenticate = (role) => {
  return (req, res, next) => {
    const strToken = req.headers.authorization?.split(' ')[1];
    const token = strToken?.replace(/"/g, '');

    if (!token) return res.status(401).json({ message: 'Unauthorized access' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Invalid token' }); 

      req.user = decoded;  
      // Role check
      if (role && req.user.role !== role) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      next();
    });
  };
};

module.exports = authenticate;




// const jwt = require('jsonwebtoken');

// const authenticate = () => {
//   return (req, res, next) => {
//     const strToken = req.headers.authorization?.split(' ')[1];
//     const token = strToken?.replace(/"/g, '');

//     if (!token) return res.status(401).json({ message: 'Unauthorized access' });

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) return res.status(401).json({ message: 'Invalid token' }); 

//       //attach user info in req object 
//       req.user = decoded;  
//       next();
//     });
//   };
// };

// module.exports = authenticate;
