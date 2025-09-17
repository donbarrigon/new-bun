import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export const connectDB = async (): Promise<void> => {
  if (!client) {
    client = new MongoClient(config.dbConectionString)
    await client.connect()
    db = client.db(config.dbName)
    console.log('✅ Conectado a MongoDB')
  }
}
export const getDB = async (): Promise<Db> => {
  if (!db) {
    await connectDB()
    db = client!.db(config.dbName)
  }
  return db
}

export const closeDB = async () => {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log('👋 Conexión MongoDB cerrada')
  }
}
