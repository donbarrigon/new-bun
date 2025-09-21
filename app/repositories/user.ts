import type { User } from '../models/User'
import { ValidationErrors } from '../utils/errors/ValidationErrors'
import { dbc } from './db/mongo'

//
const collection = 'users'

export async function userCreateRepository(user: User) {
  const e = new ValidationErrors()
  e.append('email', await emailExists(user.email))
  e.append('nickname', await nicknameExists(user.profile.nickname))
  e.hasRepositoryErrors()

  const result = await dbc(collection).insertOne(user)
  user._id = result.insertedId
}

async function emailExists(email: string): Promise<string[]> {
  if (await dbc(collection).findOne({ email: email })) {
    return ['El correo electrónica ya existe']
  }
  return []
}

async function nicknameExists(nickname: string): Promise<string[]> {
  if (await dbc(collection).findOne({ 'profile.nickname': nickname })) {
    return ['El nickname ya existe']
  }
  return []
}
