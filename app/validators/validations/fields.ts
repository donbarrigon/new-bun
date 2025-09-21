import { regex } from './regex'

export function isEmail(email: string): string[] {
  const m: string[] = []
  if (typeof email !== 'string') m.push('El correo electrónico debe ser una cadena de texto')
  if (email.length < 6 || email.length > 254) m.push('El correo électronico debe tener entre 6 y 254 caracteres')
  if (!regex.email.test(email)) m.push('El correo électronico no es valido')
  return m
}

export function isNickname(userName: string): string[] {
  // ^[a-zA-Z] → debe empezar con letra
  // [a-zA-Z0-9._] → permite letras, números, punto y guion bajo
  const m: string[] = []
  if (typeof userName !== 'string') m.push('El nickname debe ser una cadena de texto')
  if (userName.length < 2 || userName.length > 30) m.push('El nickname debe tener entre 2 y 30 caracteres')
  if (!regex.userName.test(userName)) {
    m.push('Nickname inválido: debe empezar con letra, puede contener solo letras, números, punto o guion bajo')
  }
  return m
}

export function isPassword(password: string, confirmPassword: string): string[] {
  const m: string[] = []
  if (typeof password !== 'string') m.push('La contraseña debe ser una cadena de texto')
  if (password.length < 8 || password.length > 32) m.push('La contraseña debe tener entre 8 y 32 caracteres')
  if (password !== confirmPassword) m.push('Las contraseñas no coinciden')
  return m
}

export function isName(name: string): string[] {
  const m: string[] = []
  if (typeof name !== 'string') m.push('El nombre debe ser una cadena de texto')
  if (name.length < 2 || name.length > 255) m.push('El nombre debe tener entre 2 y 255 caracteres')
  if (!regex.alphaSpacesAcents.test(name)) m.push('El nombre no debe contener caracteres especiales')
  return m
}

export function isPhoneNumber(phone: string): string[] {
  // ^\+? → opcional + al inicio
  // [0-9\s\-()]{7,15} → permite números, espacios, guiones y paréntesis, entre 7 y 15 caracteres
  const m: string[] = []
  if (typeof phone !== 'string') m.push('El telefono debe ser una cadena de texto')
  if (phone.length < 7 || phone.length > 15) m.push('El telefono debe tener entre 7 y 15 caracteres')
  if (!regex.phone.test(phone)) m.push('El telefono no es valido')
  return m
}
