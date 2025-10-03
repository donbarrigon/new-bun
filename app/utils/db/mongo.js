import { MongoClient, ObjectId } from "mongodb"

const client = new MongoClient(config.dbConectionString)
console.log(`${config.workerTag}✅ Conexión MongoDB establecida`)

async function test() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect()
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 })
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    )
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

export function dbc(name) {
  return client.db(config.dbName).collection(name)
}

export async function closeDB() {
  if (client) {
    await client.close()
    console.log(`${config.workerTag}📵 Conexión MongoDB cerrada`)
  }
}

export async function insertOne(collection, data) {
  data.createdAt = new Date()
  data.updatedAt = new Date()
  const result = await dbc(collection).insertOne(data)
  data._id = result.insertedId
}

export async function insertMany(collection, data) {
  data.forEach((d) => {
    d.createdAt = new Date()
    d.updatedAt = new Date()
  })

  const result = await dbc(collection).insertMany(data)

  data.forEach((d, i) => {
    d._id = result.insertedIds[i]
  })
}

export async function updateOne(collection, id, data) {
  data.updatedAt = new Date()
  await dbc(collection).updateOne({ _id: new ObjectId(id) }, { $set: data })
}
