import { jwtVerify } from 'jose';

const AuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'AUTH_HEADER_MISSING', message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'AUTH_TOKEN_MISSING', message: 'Token missing' });
    }

    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
        req.userId = payload.userId;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'AUTH_TOKEN_INVALID', message: 'Invalid token' });
    }
};

export default AuthMiddleware;