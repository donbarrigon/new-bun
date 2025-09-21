import { ObjectId } from 'mongodb'

export interface User {
  _id: ObjectId | undefined
  email: string
  password: string
  profile: {
    nickname: string
    name: string | undefined
    phone: string | undefined
  }
  role_ids: ObjectId[]
  roles: Role[] | undefined // no guarda en la bd
  permission_ids: ObjectId[]
  permissions: Permission[] | undefined // no guarda en la bd
  createdAt: Date
  updatedAt: Date
}

export interface Role {
  _id: ObjectId
  name: string
  permision_ids: ObjectId[]
  permissions: Permission[] | undefined // no guarda en la bd
}

export interface Permission {
  _id: ObjectId
  name: string
}
