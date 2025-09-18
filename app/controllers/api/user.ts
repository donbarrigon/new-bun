export async function userStore(): Promise<Response> {
  return new Response('User created', { status: 201 })
}
