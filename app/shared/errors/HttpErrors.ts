interface Props {
  status?: number
  message?: string
  error?: any
}

export class HttpError extends Error {
  public status: number
  public error: any

  constructor({ status = 500, message = 'Algo salió mal', error = null }: Props) {
    super(message)
    this.status = status
    this.error = error

    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }

  static response(e: any): Response {
    if (e instanceof HttpError) {
      return Response.json(
        {
          message: e.message,
          error: e.error,
        },
        { status: e.status }
      )
    }

    const er = HttpError.internal(e)
    return Response.json(
      {
        message: er.message,
        error: er.error,
      },
      { status: er.status }
    )
  }

  // 4xx - Errores del cliente
  static badRequest(error?: any) {
    return new HttpError({
      status: 400,
      message: 'Solicitud incorrecta',
      error: errorData(error),
    })
  }
  static unauthorized(error?: any) {
    return new HttpError({
      status: 401,
      message: 'No autorizado',
      error: errorData(error),
    })
  }
  static forbidden(error?: any) {
    return new HttpError({
      status: 403,
      message: 'Prohibido',
      error: errorData(error),
    })
  }
  static notFound(error?: any) {
    return new HttpError({
      status: 404,
      message: 'No encontrado',
      error: errorData(error),
    })
  }
  static methodNotAllowed(error?: any) {
    return new HttpError({
      status: 405,
      message: 'Método no permitido',
      error: errorData(error),
    })
  }
  static notAcceptable(error?: any) {
    return new HttpError({
      status: 406,
      message: 'No aceptable',
      error: errorData(error),
    })
  }
  static requestTimeout(error?: any) {
    return new HttpError({
      status: 408,
      message: 'Tiempo de solicitud agotado',
      error: errorData(error),
    })
  }
  static conflict(error?: any) {
    return new HttpError({
      status: 409,
      message: 'Conflicto',
      error: errorData(error),
    })
  }
  static gone(error?: any) {
    return new HttpError({
      status: 410,
      message: 'Recurso eliminado',
      error: errorData(error),
    })
  }
  static lengthRequired(error?: any) {
    return new HttpError({
      status: 411,
      message: 'Longitud requerida',
      error: errorData(error),
    })
  }
  static payloadTooLarge(error?: any) {
    return new HttpError({
      status: 413,
      message: 'Carga demasiado grande',
      error: errorData(error),
    })
  }
  static unsupportedMediaType(error?: any) {
    return new HttpError({
      status: 415,
      message: 'Tipo de medio no soportado',
      error: errorData(error),
    })
  }
  static unprocessableEntity(error?: any) {
    return new HttpError({
      status: 422,
      message: 'Entidad no procesable',
      error: errorData(error),
    })
  }
  static tooManyRequests(error?: any) {
    return new HttpError({
      status: 429,
      message: 'Demasiadas solicitudes',
      error: errorData(error),
    })
  }

  // 5xx - Errores del servidor
  static internal(error?: any) {
    return new HttpError({
      status: 500,
      message: 'Error interno del servidor',
      error: errorData(error),
    })
  }
  static notImplemented(error?: any) {
    return new HttpError({
      status: 501,
      message: 'No implementado',
      error: errorData(error),
    })
  }
  static badGateway(error?: any) {
    return new HttpError({
      status: 502,
      message: 'Puerta de enlace incorrecta',
      error: errorData(error),
    })
  }
  static serviceUnavailable(error?: any) {
    return new HttpError({
      status: 503,
      message: 'Servicio no disponible',
      error: errorData(error),
    })
  }
  static gatewayTimeout(error?: any) {
    return new HttpError({
      status: 504,
      message: 'Tiempo de espera de la puerta de enlace agotado',
      error: errorData(error),
    })
  }
  static httpVersionNotSupported(error?: any) {
    return new HttpError({ status: 505, message: 'Versión HTTP no soportada', error: errorData(error) })
  }
}

// Función privada del módulo para manejar errores
function errorData(error?: any) {
  if (!error) return null
  if (error instanceof Error) {
    if (config.appDebug) {
      return error.message
    }
    return {
      message: error.message,
      stack: error.stack, // modo producción: mensaje + stack
    }
  }
  return error // cualquier otro tipo se devuelve tal cual
}
