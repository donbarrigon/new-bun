import { ValidationErrors } from '../../../utils/errors/ValidationErrors'
import { isEmail, isNickname, isName, isPhoneNumber, isPassword } from '../../../utils/validations/fields'
import { toNameCase } from '../../../utils/format/strings'
import bcrypt from 'bcrypt'
import type { IUser } from '../../models/User'

export async function userStoreValidator(req: Request): Promise<IUser> {
  const body = await req.json()
  const e = new ValidationErrors()

  // campos requeridos
  e.append('email', !body['email'] ? ['El correo electrónico es requerido'] : [])
  e.append('password', !body['password'] ? ['La contraseña es requerida'] : [])
  e.append(
    'passwordConfirmation',
    !body['passwordConfirmation'] ? ['La confirmación de la contraseña es requerida'] : []
  )
  e.append('nickname', !body['nickname'] ? ['El nickname es requerido'] : [])

  for (const key in body) {
    switch (key) {
      case 'email':
        e.append(key, isEmail(body[key]))
        break

      case 'password':
        e.append(key, isPassword(body[key], body['passwordConfirmation'] ?? ''))
        break
      case 'passwordConfirmation':
        break

      case 'nickname':
        e.append(key, isNickname(body[key]))
        break

      case 'name':
        e.append(key, isName(body[key]))
        break

      case 'phone':
        e.append(key, isPhoneNumber(body[key]))
        break

      default:
        break
    }
  }
  e.hasRequestErrors()

  return {
    _id: undefined,
    email: body.email.toLowerCase(),
    password: await bcrypt.hash(body.password, 10),
    profile: {
      nickname: body.nickname.toLowerCase(),
      name: body.name ? toNameCase(body.name) : undefined,
      phone: body.phone ?? undefined,
    },
    role_ids: [],
    roles: undefined,
    permission_ids: [],
    permissions: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
