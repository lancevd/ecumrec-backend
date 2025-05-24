import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info to request
        req.user = decoded;
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
}; 