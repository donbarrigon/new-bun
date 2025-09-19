import { userStoreValidator } from '../../validators/user/store'
import { HttpError } from '../../shared/errors/HttpErrors'

export async function userStore(req: Request): Promise<Response> {
  const data = await userStoreValidator(req)

  return Response.json(data, { status: 201 })
}
