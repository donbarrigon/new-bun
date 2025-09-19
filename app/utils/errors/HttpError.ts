import { MongoServerError } from 'mongodb'

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

    if (e instanceof MongoServerError) {
      const m = mongoError(e)
      return Response.json(
        {
          message: m.message,
          error: m.error,
        },
        { status: m.status }
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
    return new HttpError({
      status: 505,
      message: 'Versión HTTP no soportada',
      error: errorData(error),
    })
  }
}

/**
 * Convierte errores de MongoDB a HttpError según su código o tipo
 * @param err Error recibido en el catch
 * @return HttpError correspondiente
 */
export function mongoError(e: any): HttpError {
  if (!e) return HttpError.internal('Error desconocido de la base de datos')

  // --- 1. Errores de duplicidad ---
  // Violación de índice único o compuesto
  if (e.code === 11000 || e.code === 11001) {
    return HttpError.conflict({
      message: 'Registro duplicado',
      error: e.keyValue || e,
    })
  }

  // --- 2. Error de validación de esquema ---
  if (e.code === 121) {
    return HttpError.badRequest({
      message: 'Documento no válido según el esquema',
      error: e.errmsg || e,
    })
  }

  // --- 3. Document too large ---
  if (e.code === 10334) {
    return HttpError.payloadTooLarge({
      message: 'Documento demasiado grande',
      error: e.errmsg || e,
    })
  }

  // --- 4. Write concern errors ---
  if (e.code === 64 || e.code === 65 || e.code === 91) {
    return HttpError.serviceUnavailable({
      message: 'Error de escritura en la base de datos',
      error: e,
    })
  }

  // --- 5. Errores de conexión ---
  if (e.name === 'MongoNetworkError' || e.name === 'MongoTimeoutError') {
    return HttpError.serviceUnavailable(e)
  }

  // --- 6. Errores de tipo BSON ---
  if (e.name === 'BSONTypeError') {
    return HttpError.unprocessableEntity({
      message: 'Tipo de dato no válido',
      error: e.message,
    })
  }

  // --- 7. Operación en nodo no primario ---
  if (e.code === 10058 || e.message?.includes('not master')) {
    return HttpError.serviceUnavailable({
      message: 'Intento de escritura en un nodo secundario',
      error: e,
    })
  }

  // --- 8. Errores de autenticación/autorización ---
  if (e.code === 13) {
    return HttpError.unauthorized({
      message: 'No autorizado',
      error: e,
    })
  }

  if (e.code === 8000) {
    return HttpError.forbidden({
      message: 'Operación prohibida',
      error: e,
    })
  }

  // --- 9. Error de índice inexistente ---
  if (e.code === 27) {
    return HttpError.badRequest({
      message: 'Índice no existe',
      error: e,
    })
  }

  // --- 10. Errores generales de servidor Mongo ---
  if (e.name === 'MongoServerError' || e.name === 'MongoError') {
    return HttpError.internal(e)
  }

  // --- 11. Fallback ---
  return HttpError.internal(e)
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
