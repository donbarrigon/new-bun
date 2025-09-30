import { dbc } from './mongo'
export async function isUnique(collection: string, field: string, value: any): Promise<string[]> {
  try {
    const exists = await dbc(collection).findOne({ [field]: value })
    if (exists) {
      return ['Ya existe']
    }
    return []
  } catch (e) {
    return [String(e)]
  }
}

export async function exists(collection: string, field: string, value: any): Promise<string[]> {
  try {
    const doc = dbc(collection).findOne({ [field]: value })
    if (!doc) {
      return ['No existe']
    }
    return []
  } catch (e) {
    return [String(e)]
  }
}
