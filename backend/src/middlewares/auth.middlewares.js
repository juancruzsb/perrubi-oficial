import jwt from 'jsonwebtoken'
import 'dotenv/config'

const AuthMiddlewares = {}

AuthMiddlewares.verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).send({ error: 'No llego ninguna token en los headers' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).send({ error: 'Unauthorized' })
    }
}

AuthMiddlewares.verifyAdmin = async (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ error: 'No se encontró usuario en la request' });
    }

    if (!user.role || user.role !== 'admin') {
        return res.status(403).send({ error: 'Not admin' });
    } 

    next();
}

export default AuthMiddlewares