import { index } from '../app/controllers/home.ts'

export default (): Record<
  string,
  (request: Request) => Response | Promise<Response>
> => {
  return {
    '/': index,
  }
}
