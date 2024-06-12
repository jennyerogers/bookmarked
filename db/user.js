import User from './models/user'
import dbConnect from './connection'

export async function create(username, password) {
  if (!(username && password))
    throw new Error('Oops! Must include username and password')

  await dbConnect()

  const user = await User.create({username, password})

  if (!user)
    throw new Error('Oops! There was an error creating the user')

  return user.toJSON()
}
//good