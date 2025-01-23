const jwt = require('jsonwebtoken');

const validateToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Authorization token missing');

    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = validateToken;
