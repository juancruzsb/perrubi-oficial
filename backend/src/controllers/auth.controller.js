import AuthService from '../services/auth.service.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import asyncHandler from '../utils/async-handler.js'
import HttpError from '../utils/http-error.js'
import { stripPassword } from '../utils/sanitize.js'

const AuthController = {}

const TOKEN_OPTIONS = {
    expiresIn: '1h',
    issuer: 'perrubi'
}

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, TOKEN_OPTIONS);

AuthController.userRegister = asyncHandler(async (req, res) => {
    const user = req.body;

    if (!user.firstName || !user.email || !user.password) {
        throw new HttpError(400, 'Faltan campos obligatorios');
    }

    const existingUser = await AuthService.findUserByEmail(user.email);

    if (existingUser) {
        throw new HttpError(409, 'El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await AuthService.userRegister({
        firstName: user.firstName,
        lastName: user.lastName || null,
        email: user.email,
        passwordHash: hashedPassword,
    })

    return res.status(201).json({ message: 'Usuario registrado exitosamente', user: stripPassword(newUser) });
})

AuthController.userLogin = asyncHandler(async (req, res) => {
    const data = req.body;

    if (!data.email || !data.password) {
        throw new HttpError(400, 'Faltan campos obligatorios');
    }

    const user = await AuthService.findUserByEmail(data.email);

    if (!user) {
        throw new HttpError(401, 'Credenciales inválidas');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

    if (!passwordMatch) {
        throw new HttpError(401, 'Credenciales inválidas');
    }

    const payload = {
        id: user.id,
        type: 'user',
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
    }

    const token = signToken(payload);

    return res.status(200).json({ message: 'Login exitoso', token, user: stripPassword(user) });
})

AuthController.walkerRegister = asyncHandler(async (req, res) => {
    const walker = req.body;

    if (!walker.firstName || !walker.email || !walker.password) {
        throw new HttpError(400, 'Faltan campos obligatorios');
    }

    const existingWalker = await AuthService.findWalkerByEmail(walker.email);

    if (existingWalker) {
        throw new HttpError(409, 'El paseador ya existe');
    }

    const hashedPassword = await bcrypt.hash(walker.password, 10);

    const newWalker = await AuthService.walkerRegister({
        firstName: walker.firstName,
        lastName: walker.lastName || null,
        email: walker.email,
        passwordHash: hashedPassword,
    })

    return res.status(201).json({ message: 'Paseador registrado exitosamente', walker: stripPassword(newWalker) });
})

AuthController.walkerLogin = asyncHandler(async (req, res) => {
    const data = req.body;

    if (!data.email || !data.password) {
        throw new HttpError(400, 'Faltan campos obligatorios');
    }

    const walker = await AuthService.findWalkerByEmail(data.email);

    if (!walker) {
        throw new HttpError(401, 'Credenciales inválidas');
    }

    const passwordMatch = await bcrypt.compare(data.password, walker.passwordHash);

    if (!passwordMatch) {
        throw new HttpError(401, 'Credenciales inválidas');
    }

    const payload = {
        id: walker.id,
        type: 'walker',
        firstName: walker.firstName,
        lastName: walker.lastName,
        email: walker.email,
        role: walker.role
    }

    const token = signToken(payload);

    return res.status(200).json({ message: 'Login exitoso', token, walker: stripPassword(walker) });
})

AuthController.getMe = asyncHandler(async (req, res) => {
    const { id, type } = req.user;

    const entity = type === 'walker'
        ? await AuthService.findWalkerByEmail(req.user.email)
        : await AuthService.findUserByEmail(req.user.email);

    if (!entity) {
        throw new HttpError(404, type === 'walker' ? 'Paseador no encontrado' : 'Usuario no encontrado');
    }

    const key = type === 'walker' ? 'walker' : 'user';
    return res.status(200).json({ [key]: stripPassword(entity) });
})

AuthController.updateMe = asyncHandler(async (req, res) => {
    const { id, type } = req.user;
    const data = req.body;

    const updated = type === 'walker'
        ? await AuthService.updateWalker(id, data)
        : await AuthService.updateUser(id, data);

    const key = type === 'walker' ? 'walker' : 'user';
    return res.status(200).json({ message: 'Perfil actualizado', [key]: stripPassword(updated) });
})

AuthController.updateMyPassword = asyncHandler(async (req, res) => {
    const { id, type } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new HttpError(400, 'Faltan campos obligatorios');
    }

    const entity = type === 'walker'
        ? await AuthService.findWalkerByEmail(req.user.email)
        : await AuthService.findUserByEmail(req.user.email);

    if (!entity) {
        throw new HttpError(404, 'No encontrado');
    }

    const passwordMatch = await bcrypt.compare(currentPassword, entity.passwordHash);

    if (!passwordMatch) {
        throw new HttpError(401, 'Contraseña actual incorrecta');
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    if (type === 'walker') {
        await AuthService.updateWalkerPassword(id, newHash);
    } else {
        await AuthService.updateUserPassword(id, newHash);
    }

    return res.status(200).json({ message: 'Contraseña actualizada' });
})

export default AuthController
