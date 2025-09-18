import { ValidatorErrors } from '../../shared/errors/ValidatorErrors'
import { isEmail, isUserName, isPersonalName, isUnique, isPhoneNumber } from '../validator'

export async function userStoreValidator(req: Request): Promise<Record<string, any>> {
  const body = await req.json()
  const err = new ValidatorErrors()

  // campos requeridos
  err.append(!body['email'], 'email', 'El correo electrónico es requerido')
  err.append(!body['password'], 'password', 'La contraseña es requerida')
  err.append(!body['confirmPassword'], 'confirmPassword', 'La confirmación de la contraseña es requerida')
  err.append(!body['profile'] || !body['profile']['nickname'], 'nickname', 'El nickname es requerido')

  for (const key in body) {
    switch (key) {
      case 'email':
        err.append(!isEmail(body[key]), key, 'El correo electrónico debe ser válido')
        break

      case 'password':
        err.append(
          body[key]?.length < 8 || body[key]?.length > 32,
          key,
          'La contraseña debe tener entre 8 y 32 caracteres'
        )
        err.append(body['password'] !== body['confirmPassword'], key, 'Las contraseñas no coinciden')
        break

      case 'profile':
        for (const k in body[key]) {
          switch (k) {
            case 'nickname':
              err.append(
                !isUserName(body[key][k]),
                k,
                'Nickname inválido: debe empezar con letra, contener solo letras, números, punto o guion bajo y tener entre 2 y 30 caracteres'
              )
              err.append(!(await isUnique('users', 'profile.nickname', body[key][k])), k, 'El nickname ya está en uso')
              break

            case 'name':
              err.append(
                !isPersonalName(body[key][k]),
                k,
                'Nombre inválido: debe tener entre 1 y 255 caracteres y no permitir caracteres especiales'
              )
              break

            case 'phone':
              err.append(
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

  err.hasErrors()
  return body
}
