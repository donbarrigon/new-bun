import { ObjectId } from 'mongodb'

export interface IUser {
  _id: ObjectId | undefined
  email: string
  password: string
  profile: {
    nickname: string
    name: string | undefined
    phone: string | undefined
  }
  role_ids: ObjectId[]
  roles: IRole[] | undefined // no guarda en la bd
  permission_ids: ObjectId[]
  permissions: IPermission[] | undefined // no guarda en la bd
  createdAt: Date
  updatedAt: Date
}

export interface IRole {
  _id: ObjectId
  name: string
  permision_ids: ObjectId[]
  permissions: IPermission[] | undefined // no guarda en la bd
}

export interface IPermission {
  _id: ObjectId
  name: string
}
