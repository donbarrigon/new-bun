export type ControllerFun = (req: Request) => Promise<Response>
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE'
export type RouteHandler = ControllerFun | Partial<Record<HttpMethod, ControllerFun>>
export type RouteMap = Record<string, RouteHandler>
