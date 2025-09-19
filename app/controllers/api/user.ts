import { userStoreValidator } from '../../validators/user/store'
import { insertOne } from '../../utils/db/db'
import bcrypt from 'bcrypt'

export async function userStore(req: Request): Promise<Response> {
  const data = await userStoreValidator(req)
  data.password = await bcrypt.hash(data.password, 10)
  return Response.json(data, { status: 201 })
}
