const AuthService = {}
import prisma from '../../db.js'

AuthService.userRegister = async (user) => {
    const newUser = await prisma.user.create({
        data: {
            firstName: user.firstName,
            lastName: user.lastName? user.lastName : null,
            email: user.email,
            passwordHash: user.passwordHash,
        }
    })
    console.log(newUser)
    return newUser;
}

AuthService.userLogin = async (credentials) => {
    const result = await prisma.user.findUnique({
        where: {
            email: credentials.email,
        }
    })
    console.log(result)
    return result;
}

AuthService.walkerRegister = async (walker) => {
    const newWalker = await prisma.walker.create({
        data: {
            firstName: walker.firstName,
            lastName: walker.lastName? walker.lastName : null,
            email: walker.email,
            passwordHash: walker.passwordHash,
        }
    })
    console.log(newWalker)
    return newWalker;
}

AuthService.walkerLogin = async (credentials) => {
    const result = await prisma.walker.findUnique({
        where: {
            email: credentials.email,
        }
    })
    console.log(result)
    return result;
}

export default AuthService