const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
}

// POST /API/AUTH/REGISTER
async function register(req, res, next) {
     try {
        const { name, email, password, businessName, businessAddress } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        const existing = await User.findOne({ email });
        if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists'});
    }

    const user = await User.create({ name, email, password, businessName, businessAddress });
    res.status(201).json({
        token: signToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, businessName: user.businessName }
    });
     }  catch (err) {
    next(err);
      }
    }
    //  POST /API/AUTH/LOGIN
    async function login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'email and password are required' });
          }

          const user = await User.findOne({ email });
          if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
          }

          res.json({
            token: signToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, businessName: user.businessName }
     });
    } catch (err) {
        next(err);
    }
          }
//   GET /API/AUTH/ME
async function getMe(req, res) {
    res.json({ user: req.user });
}
 
module.exports = { register, login, getMe };
    



 