import AuthService from '../services/auth.service.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const AuthController = {}

AuthController.userRegister = async (req, res) => {
    const user = req.body;

    try {
        if (!user.name || !user.email || !user.password) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const existingUser = await AuthService.userLogin({ email: user.email });

        if (existingUser) {
            return res.status(409).json({ error: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const newUser = await AuthService.userRegister({
            name: user.name,
            email: user.email,
            password: hashedPassword,
        })

        return res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error registering user' });
    }
}

AuthController.userLogin = async (req, res) => {
    const data = req.body;

    if (!data.email || !data.password) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const user = await AuthService.userLogin({ email: data.email });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const passwordMatch = await bcrypt.compare(data.password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
        
        const options = {
            expiresIn: '1h',
            issuer: 'perrubi'
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, options);

        return res.status(200).json({ message: 'Login exitoso', token, user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error logging in' });
    }
}

AuthController.walkerRegister = async (req, res) => {
    const walker = req.body;

    try {
        if (!walker.name || !walker.email || !walker.password) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const existingWalker = await AuthService.walkerLogin({ email: walker.email });

        if (existingWalker) {
            return res.status(409).json({ error: 'El paseador ya existe' });
        }

        const hashedPassword = await bcrypt.hash(walker.password, 10);

        const newWalker = await AuthService.walkerRegister({
            name: walker.name,
            email: walker.email,
            password: hashedPassword,
        })

        return res.status(201).json({ message: 'Paseador registrado exitosamente', walker: newWalker });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error registering walker' });
    }
}

AuthController.walkerLogin = async (req, res) => {
    const data = req.body;

    if (!data.email || !data.password) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const walker = await AuthService.walkerLogin({ email: data.email });

        if (!walker) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const passwordMatch = await bcrypt.compare(data.password, walker.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const payload = {
            id: walker.id,
            name: walker.name,
            email: walker.email,
            role: walker.role
        }

        const options = {
            expiresIn: '1h',
            issuer: 'perrubi'
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, options);

        return res.status(200).json({ message: 'Login exitoso', token, walker });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error logging in' });
    }
}

export default AuthController