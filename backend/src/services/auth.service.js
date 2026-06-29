const AuthService = {}
import prisma from '../../db.js'

AuthService.userRegister = async (user) => {
    const newUser = await prisma.user.create({
        data: {
            name: user.name,
            email: user.email,
            password: user.password,
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
            name: walker.name,
            email: walker.email,
            password: walker.password,
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