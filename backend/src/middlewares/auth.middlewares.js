import jwt from 'jsonwebtoken'

const AuthMiddlewares = {}

AuthMiddlewares.verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'No llego ninguna token en los headers' });
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Formato de token inválido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Unauthorized' })
    }
}

AuthMiddlewares.verifyAdmin = async (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ error: 'No se encontró usuario en la request' });
    }

    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Not admin' });
    }

    next();
}


AuthMiddlewares.verifyUser = async (req, res, next) => {
    const user = req.user;

    if (!user || user.type !== 'user') {
        return res.status(403).json({ error: 'Se requiere una cuenta de usuario' });
    }

    next();
}

AuthMiddlewares.verifyWalker = async (req, res, next) => {
    const user = req.user;

    if (!user || user.type !== 'walker') {
        return res.status(403).json({ error: 'Se requiere una cuenta de paseador' });
    }

    next();
}

export default AuthMiddlewares
