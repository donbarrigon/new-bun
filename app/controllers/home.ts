import { home } from '../views/home/index.ts'

export const index = async ({}: Request): Promise<Response> => {
  return render(home())
}

// retorna los archivos de la carpeta public
export const staticFiles = async (req: Request): Promise<Response> => {
  const url = new URL(req.url)

  // ruta relativa después de /public/
  const filePath = url.pathname.replace(/^\/public\//, '')

  const file = Bun.file(`./public/${filePath}`)

  if (!(await file.exists())) {
    return new Response('File not found', { status: 404 })
  }

  return new Response(file)
}
