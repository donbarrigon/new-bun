import { ValidatorErrors } from '../../utils/errors/ValidatorErrors'
import { isEmail, isUserName, isPersonalName, isUnique, isPhoneNumber } from '../validator'

export interface UserStore {
  email: string
  password: string
  profile: {
    nickname: string
    personalName: string
    phoneNumber: string
  }
}
export async function userStoreValidator(req: Request): Promise<UserStore> {
  const body = await req.json()
  const e = new ValidatorErrors()

  // campos requeridos
  e.append(!body['email'], 'email', 'El correo electrónico es requerido')
  e.append(!body['password'], 'password', 'La contraseña es requerida')
  e.append(!body['confirmPassword'], 'confirmPassword', 'La confirmación de la contraseña es requerida')
  e.append(!body['profile'] || !body['profile']['nickname'], 'nickname', 'El nickname es requerido')

  for (const key in body) {
    switch (key) {
      case 'email':
        e.append(!isEmail(body[key]), key, 'El correo electrónico debe ser válido')
        break

      case 'password':
        e.append(
          body[key]?.length < 8 || body[key]?.length > 32,
          key,
          'La contraseña debe tener entre 8 y 32 caracteres'
        )
        e.append(body['password'] !== body['confirmPassword'], key, 'Las contraseñas no coinciden')
        break
      case 'confirmPassword':
        break

      case 'profile':
        for (const k in body[key]) {
          switch (k) {
            case 'nickname':
              e.append(
                !isUserName(body[key][k]),
                k,
                'Nickname inválido: debe empezar con letra, contener solo letras, números, punto o guion bajo y tener entre 2 y 30 caracteres'
              )
              e.append(!(await isUnique('users', 'profile.nickname', body[key][k])), k, 'El nickname ya está en uso')
              break

            case 'name':
              e.append(
                !isPersonalName(body[key][k]),
                k,
                'Nombre inválido: debe tener entre 1 y 255 caracteres y no permitir caracteres especiales'
              )
              break

            case 'phone':
              e.append(
                !isPhoneNumber(body[key][k]),
                k,
                'Teléfono inválido: opcional + al inicio, permite números, espacios, guiones y paréntesis'
              )
              break

            default:
              delete body[key][k]
              break
          }
        }
        break

      default:
        delete body[key]
        break
    }
  }

  e.hasErrors()
  delete body['confirmPassword']
  return body
}
