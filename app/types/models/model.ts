import { ObjectId } from 'mongodb'
export type Document = {
  _id: ObjectId
  createdAt: Date
  updatedAt: Date
}
