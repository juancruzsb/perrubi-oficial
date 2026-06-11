const AuthService = {}
import prisma from '../../db.js'

AuthService.register = async (user) => {
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

export default AuthService