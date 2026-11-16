
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorisation && req.headers.authorisation.startsWith('Bearer')) {
        try {
            token = req.headers.authorisation.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorised, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorised, no token' });
    }
};
const authorise = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'You do not have access to this action' });
    }
    next();
};

module.exports = { protect, authorise };
