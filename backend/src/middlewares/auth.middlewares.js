import jwt from 'jsonwebtoken'

const AuthMiddlewares = {}

// Compartido por verifyToken y verifyTokenFromQuery: decodifica un JWT y lo
// setea en req.user, o responde 401. Extraído a helper porque
// verifyTokenFromQuery necesita el mismo try/catch pero leyendo el token de
// otro lado (query string en vez de header).
const applyToken = (req, res, token) => {
    if (!token) {
        return res.status(401).json({ error: 'No llego ninguna token' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return true;
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Unauthorized' });
        return false;
    }
}

AuthMiddlewares.verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'No llego ninguna token en los headers' });
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Formato de token inválido' });
    }

    if (applyToken(req, res, token)) next();
}

// Variante de verifyToken que también acepta el JWT por query (?token=...),
// para requests que un <Image> dispara y que no pueden mandar el header
// Authorization de forma confiable (React Native Web lo ignora). Si no hay
// query param, cae al header Authorization como verifyToken.
AuthMiddlewares.verifyTokenFromQuery = async (req, res, next) => {
    const queryToken = req.query?.token;

    if (queryToken) {
        if (applyToken(req, res, queryToken)) next();
        return;
    }

    const authHeader = req.headers['authorization'];
    const [scheme, headerToken] = (authHeader || '').split(' ');

    if (scheme !== 'Bearer' || !headerToken) {
        return res.status(401).json({ error: 'No llego ninguna token' });
    }

    if (applyToken(req, res, headerToken)) next();
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
