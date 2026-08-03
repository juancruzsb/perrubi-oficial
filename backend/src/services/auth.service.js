const AuthService = {}
import prisma from '../../db.js'

AuthService.userRegister = async (user) => {
    const newUser = await prisma.user.create({
        data: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            passwordHash: user.passwordHash,
        }
    })
    return newUser;
}

AuthService.findUserByEmail = async (email) => {
    const result = await prisma.user.findUnique({
        where: { email }
    })
    return result;
}

AuthService.updateUser = async (userId, data) => {
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
        }
    })
    return updatedUser;
}

AuthService.updateUserPassword = async (userId, passwordHash) => {
    return prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
    })
}

AuthService.walkerRegister = async (walker) => {
    const newWalker = await prisma.walker.create({
        data: {
            firstName: walker.firstName,
            lastName: walker.lastName,
            email: walker.email,
            passwordHash: walker.passwordHash,
        }
    })
    return newWalker;
}

AuthService.findWalkerByEmail = async (email) => {
    const result = await prisma.walker.findUnique({
        where: { email }
    })
    return result;
}

AuthService.updateWalker = async (walkerId, data) => {
    const updatedWalker = await prisma.walker.update({
        where: { id: walkerId },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            description: data.description,
            profilePicture: data.profilePicture,
        }
    })
    return updatedWalker;
}

AuthService.updateWalkerPassword = async (walkerId, passwordHash) => {
    return prisma.walker.update({
        where: { id: walkerId },
        data: { passwordHash }
    })
}

export default AuthService
