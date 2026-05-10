const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log("🔑 Auth Header:", authHeader); // Log the auth header for debugging
  // console.log("JWT_SECRET used for verification:", process.env.JWT_SECRET);


  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decodeing??",decoded);
    req.user = decoded; // ✅ Attach decoded user to req
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
