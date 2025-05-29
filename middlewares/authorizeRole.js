const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied for this role' });
    }
    next();
  };
};

module.exports = authorizeRole;
