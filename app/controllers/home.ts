import { home } from '../views/home/index.ts'

export const index = async ({}: Request): Promise<Response> => {
  return view(home())
}

// retorna los archivos de la carpeta public
export const publicFiles = async (req: Request): Promise<Response> => {
  const url = new URL(req.url)

  const filePath = url.pathname.replace(/^\/public\//, '')

  const file = Bun.file(`./public/${filePath}`)

  if (!(await file.exists())) {
    return new Response('File not found', { status: 404 })
  }

  return new Response(file)
}
