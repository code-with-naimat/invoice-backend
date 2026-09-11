const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect (req, res, next) {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({message: 'not authorized, no token'});
    }  
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({message: 'user no longer exist'});
        }
        next();
    }catch (err) {return res.status(401).json({message: 'not authorized, invalid token'});
}
    }

 module.exports = protect;
    
