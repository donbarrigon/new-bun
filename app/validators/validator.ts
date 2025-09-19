import { getDB } from '../utils/db/db'

const regex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[0-9\s\-()]+$/,
  userName: /^[a-zA-Z][a-zA-Z0-9._]*$/,
  personalName: /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+([ '-][A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/,
}

export function isEmail(email: string): boolean {
  if (typeof email !== 'string') return false
  if (email.length < 6 || email.length > 254) return false
  return regex.email.test(email)
}

export function isUserName(userName: string): boolean {
  // ^[a-zA-Z] → debe empezar con letra
  // [a-zA-Z0-9._] → permite letras, números, punto y guion bajo
  if (typeof userName !== 'string') return false
  if (userName.length < 2 || userName.length > 30) return false
  return regex.userName.test(userName)
}

export function isPersonalName(personalName: string): boolean {
  if (typeof personalName !== 'string') return false
  if (personalName.length < 1 || personalName.length > 255) return false
  return regex.personalName.test(personalName)
}

export function isPhoneNumber(phone: string): boolean {
  // ^\+? → opcional + al inicio
  // [0-9\s\-()]{7,15} → permite números, espacios, guiones y paréntesis, entre 7 y 15 caracteres
  if (typeof phone !== 'string') return false
  if (phone.length < 7 || phone.length > 15) return false
  return regex.phone.test(phone)
}

export async function isUnique(collection: string, field: string, value: any): Promise<boolean> {
  try {
    const db = await getDB()
    const exists = await db.collection(collection).findOne({ [field]: value })
    return !exists
  } catch (err) {
    return false
  }
}

export async function exists(collection: string, field: string, value: any): Promise<boolean> {
  try {
    const db = await getDB()
    const doc = await db.collection(collection).findOne({ [field]: value })
    return !!doc
  } catch (err) {
    return false
  }
}
