import { regex } from './regex.js'

/**
 * Valida un correo electrónico
 * @param {string} email - Correo a validar
 * @returns {string[]} Array de mensajes de error (vacío si es válido)
 */
export function isEmail(email) {
  const m = []
  if (typeof email !== 'string') m.push('El correo debe ser texto')
  if (email.length < 6 || email.length > 254) m.push('El correo debe tener entre 6 y 254 caracteres')
  if (!regex.email.test(email)) m.push('El correo no es válido')
  return m
}

/**
 * Valida un nombre de usuario/nickname
 * @param {string} userName - Nickname a validar
 * @returns {string[]} Array de mensajes de error (vacío si es válido)
 */
export function isNickname(userName) {
  const m = []
  if (typeof userName !== 'string') m.push('El nickname debe ser texto')
  if (userName.length < 2 || userName.length > 30) m.push('El nickname debe tener entre 2 y 30 caracteres')
  if (!regex.userName.test(userName)) {
    m.push('El nickname debe empezar con letra y solo puede tener letras, números, punto o guion bajo')
  }
  return m
}

/**
 * Valida una contraseña y su confirmación
 * @param {string} password - Contraseña a validar
 * @param {string} confirmPassword - Confirmación de la contraseña
 * @returns {string[]} Array de mensajes de error (vacío si es válido)
 */
export function isPassword(password, confirmPassword) {
  const m = []
  if (typeof password !== 'string') m.push('La contraseña debe ser texto')
  if (password.length < 8 || password.length > 32) m.push('La contraseña debe tener entre 8 y 32 caracteres')
  if (password !== confirmPassword) m.push('Las contraseñas no coinciden')
  return m
}

/**
 * Valida un nombre (con espacios y acentos permitidos)
 * @param {string} name - Nombre a validar
 * @returns {string[]} Array de mensajes de error (vacío si es válido)
 */
export function isName(name) {
  const m = []
  if (typeof name !== 'string') m.push('El nombre debe ser texto')
  if (name.length < 2 || name.length > 255) m.push('El nombre debe tener entre 2 y 255 caracteres')
  if (!regex.alphaSpacesAcents.test(name)) m.push('El nombre no puede tener caracteres especiales')
  return m
}

/**
 * Valida un número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {string[]} Array de mensajes de error (vacío si es válido)
 */
export function isPhoneNumber(phone) {
  const m = []
  if (typeof phone !== 'string') m.push('El teléfono debe ser texto')
  if (phone.length < 7 || phone.length > 15) m.push('El teléfono debe tener entre 7 y 15 caracteres')
  if (!regex.phone.test(phone)) m.push('El teléfono no es válido')
  return m
}
