import { compare } from 'bcrypt'
import User from './models/user'
import dbConnect from './connection'

export async function login(username, password) {
  if (!(username && password))
    throw new Error('Oops! Must include username and password')

  await dbConnect()
  const user = await User.findOne({username}).lean()

  if (!user)
    throw new Error('Oops! User not found')

  const isPasswordCorrect= await compare(password, user.password)

  if (!isPasswordCorrect)
    throw new Error('Oops! Password is incorrect')

  return user
}
//good