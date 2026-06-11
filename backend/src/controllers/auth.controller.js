import AuthService from '../services/auth.service.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const AuthController = {}

AuthController.register = async (req, res) => {
    const user = req.body;

    try {
        if (!user.name || !user.email || !user.password) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const newUser = await AuthService.register({
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
    const user = req.body;

    if (!user.email || !user.password) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const user = await AuthService.userLogin({ email: user.email });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

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

export default AuthController