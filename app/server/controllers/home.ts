import { homePage } from '../../ui/views/home/index'
export async function index() {
  return view(homePage())
}

export async function publicFiles(req: Request): Promise<Response> {
  const url = new URL(req.url)

  const filePath = url.pathname.replace(/^\/public\//, '')

  const file = Bun.file(`./public/${filePath}`)

  if (!(await file.exists())) {
    return new Response('File not found', { status: 404 })
  }

  return new Response(file)
}
