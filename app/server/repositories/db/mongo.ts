import { MongoClient, ObjectId } from 'mongodb'

export type User = {
  _id: ObjectId
  createdAt: Date
  updatedAt: Date
}

const client = new MongoClient(config.dbConectionString)
console.log(`${config.workerTag}✅ Conexión MongoDB establecida`)

async function test() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect()
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log('Pinged your deployment. You successfully connected to MongoDB!')
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close()
  }
}

export async function connectDB() {
  await client.connect()
  console.log(`${config.workerTag}✅ Conexión MongoDB establecida`)
}

export function db() {
  return client.db(config.dbName)
}

export function dbc(name: string) {
  return client.db(config.dbName).collection(name)
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close()
    console.log(`${config.workerTag}📵 Conexión MongoDB cerrada`)
  }
}

export async function insertOne(collection: string, data: any) {
  data.createdAt = new Date()
  data.updatedAt = new Date()
  const result = await dbc(collection).insertOne(data)
  data._id = result.insertedId
}

export async function insertMany(collection: string, data: any[]) {
  data.forEach((d: any) => {
    d.createdAt = new Date()
    d.updatedAt = new Date()
  })

  const result = await dbc(collection).insertMany(data)

  data.forEach((d: any, i: number) => {
    d._id = result.insertedIds[i]
  })
}

export async function updateOne(collection: string, id: string, data: any) {
  data.updatedAt = new Date()
  await dbc(collection).updateOne({ _id: new ObjectId(id) }, { $set: data })
}
