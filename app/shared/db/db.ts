import { MongoClient, Db, ObjectId } from 'mongodb'

export type Document = {
  _id: ObjectId
  createdAt: Date
  updatedAt: Date
}

let client: MongoClient | null = null
let db: Db | null = null

export async function connectDB(): Promise<void> {
  if (!client) {
    client = new MongoClient(config.dbConectionString)
    await client.connect()
    db = client.db(config.dbName)
    console.log('✅ Conectado a MongoDB')
  }
}
export async function getDB(): Promise<Db> {
  if (!db) {
    await connectDB()
    db = client!.db(config.dbName)
  }
  return db
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log('👋 Conexión MongoDB cerrada')
  }
}
