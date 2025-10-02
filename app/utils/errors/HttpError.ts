import { encode } from '@msgpack/msgpack'
import { MongoAWSError, MongoDriverError, MongoServerError } from 'mongodb'

export class HttpError extends Error {
  private status: number
  private error: any

  constructor(status = 500, error: any = 'Algo salió mal') {
    super(String(error))
    this.status = status
    this.error = error

    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }

  public json(init?: ResponseInit): Response {
    if (init) {
      return new Response(this.error, { status: this.status, ...init })
    }
    return Response.json(this.error, { status: this.status })
  }

  public msgpack(init?: ResponseInit): Response {
    const body = encode(this.error)
    if (init) {
      return new Response(body as BodyInit, {
        status: this.status,
        headers: {
          'Content-Type': 'application/msgpack',
          ...init.headers,
        },
        ...init,
      })
    }

    return new Response(body as BodyInit, {
      status: this.status,
      headers: {
        'Content-Type': 'application/msgpack',
      },
    })
  }

  // ================================================================
  // Errores de mongodb
  // ================================================================
  public static mongo(e: any): HttpError {
    if (!e) return HttpError.internal('Error desconocido de la base de datos')

    // --- 1. Errores de duplicidad ---
    if (e.code === 11000 || e.code === 11001) {
      return HttpError.conflict(e, 'Registro duplicado')
    }

    // --- 2. Error de validación de esquema ---
    if (e.code === 121) {
      return HttpError.badRequest(e, 'Documento no válido según el esquema')
    }

    // --- 3. Document too large ---
    if (e.code === 10334) {
      return HttpError.payloadTooLarge(e, 'Documento demasiado grande')
    }

    // --- 4. Write concern errors ---
    if (e.code === 64 || e.code === 65 || e.code === 91 || e.code === 100) {
      return HttpError.serviceUnavailable(e, 'Error de escritura en la base de datos')
    }

    // --- 5. Errores de transacciones ---
    if (e.code === 251 || e.code === 244 || e.code === 112) {
      return HttpError.conflict(e, 'Error de transacción')
    }

    // --- 6. Namespace no existe ---
    if (e.code === 26) {
      return HttpError.notFound(e, 'Colección o base de datos no existe')
    }

    // --- 7. Cursor no encontrado ---
    if (e.code === 43) {
      return HttpError.badRequest(e, 'Cursor expirado o no válido')
    }

    // --- 8. Operación interrumpida ---
    if (e.code === 11601 || e.code === 11602) {
      return HttpError.requestTimeout(e, 'Operación interrumpida')
    }

    // --- 9. MaxTimeMSExpired ---
    if (e.code === 50) {
      return HttpError.requestTimeout(e, 'Tiempo máximo de ejecución excedido')
    }

    // --- 10. Errores de conexión ---
    if (e.name === 'MongoNetworkError' || e.name === 'MongoTimeoutError') {
      return HttpError.serviceUnavailable(e, 'Error de conexión con la base de datos')
    }

    // --- 11. Errores de tipo BSON ---
    if (e.name === 'BSONTypeError' || e.name === 'BSONError') {
      return HttpError.unprocessableEntity(e, 'Tipo de dato no válido')
    }

    // --- 12. Operación en nodo no primario ---
    if (
      e.code === 10058 ||
      e.code === 13436 ||
      e.message?.includes('not master') ||
      e.message?.includes('not primary')
    ) {
      return HttpError.serviceUnavailable(e, 'Intento de escritura en un nodo secundario')
    }

    // --- 13. Errores de autenticación/autorización ---
    if (e.code === 13 || e.code === 18) {
      return HttpError.unauthorized(e, 'No autorizado')
    }

    if (e.code === 8000 || e.code === 31) {
      return HttpError.forbidden(e, 'Operación prohibida')
    }

    // --- 14. Error de índice inexistente ---
    if (e.code === 27 || e.code === 85) {
      return HttpError.badRequest(e, 'Índice no existe')
    }

    // --- 15. Comando desconocido ---
    if (e.code === 59) {
      return HttpError.badRequest(e, 'Comando no reconocido')
    }

    // --- 16. Límite de memoria excedido ---
    if (e.code === 292) {
      return HttpError.serviceUnavailable(e, 'Límite de memoria excedido')
    }

    // --- 17. Errores de tipo MongoParseError ---
    if (e.name === 'MongoParseError') {
      return HttpError.badRequest(e, 'Error al parsear la conexión o consulta')
    }

    // --- 18. Errores de MongoDB Atlas/AWS ---
    if (e instanceof MongoAWSError) {
      return HttpError.serviceUnavailable(e, 'Error de autenticación AWS')
    }

    // --- 19. Errores de TopologyDestroyed ---
    if (e.name === 'MongoTopologyClosedError') {
      return HttpError.serviceUnavailable(e, 'Conexión a la base de datos cerrada')
    }

    // --- 20. Errores generales de servidor Mongo ---
    if (e.name === 'MongoServerError' || e.name === 'MongoError') {
      return HttpError.internal(e, 'Error interno del servidor de la base de datos')
    }

    // --- 21. Fallback ---
    return HttpError.internal(e, 'Error interno de la base de datos')
  }
  // ================================================================
  // 4xx - Errores del cliente
  // ================================================================
  public static badRequest(error: any = 'Solicitud incorrecta', message?: any) {
    return new HttpError(400, errorData(error, message))
  }

  public static unauthorized(error: any = 'No autorizado', message?: any) {
    return new HttpError(401, errorData(error, message))
  }

  public static forbidden(error: any = 'Prohibido', message?: any) {
    return new HttpError(403, errorData(error, message))
  }

  public static notFound(error: any = 'No encontrado', message?: any) {
    return new HttpError(404, errorData(error, message))
  }

  public static methodNotAllowed(error: any = 'Método no permitido', message?: any) {
    return new HttpError(405, errorData(error, message))
  }

  public static notAcceptable(error: any = 'No aceptable', message?: any) {
    return new HttpError(406, errorData(error, message))
  }

  public static requestTimeout(error: any = 'Tiempo de solicitud agotado', message?: any) {
    return new HttpError(408, errorData(error, message))
  }

  public static conflict(error: any = 'Conflicto', message?: any) {
    return new HttpError(409, errorData(error, message))
  }

  public static gone(error: any = 'Recurso eliminado', message?: any) {
    return new HttpError(410, errorData(error, message))
  }

  public static lengthRequired(error: any = 'Longitud requerida', message?: any) {
    return new HttpError(411, errorData(error, message))
  }

  public static payloadTooLarge(error: any = 'Carga demasiado grande', message?: any) {
    return new HttpError(413, errorData(error, message))
  }

  public static unsupportedMediaType(error: any = 'Tipo de medio no soportado', message?: any) {
    return new HttpError(415, errorData(error, message))
  }

  public static sessionExpired(error: any = 'Sesión expirada', message?: any) {
    return new HttpError(419, errorData(error, message))
  }

  public static unprocessableEntity(error: any = 'Entidad no procesable', message?: any) {
    return new HttpError(422, errorData(error, message))
  }

  public static tooManyRequests(error: any = 'Demasiadas solicitudes', message?: any) {
    return new HttpError(429, errorData(error, message))
  }

  // ================================================================
  // 5xx - Errores del servidor
  // ================================================================
  public static internal(error: any = 'Error interno del servidor', message?: any) {
    return new HttpError(500, errorData(error, message))
  }

  public static notImplemented(error: any = 'No implementado', message?: any) {
    return new HttpError(501, errorData(error, message))
  }

  public static badGateway(error: any = 'Puerta de enlace incorrecta', message?: any) {
    return new HttpError(502, errorData(error, message))
  }

  public static serviceUnavailable(error: any = 'Servicio no disponible', message?: any) {
    return new HttpError(503, errorData(error, message))
  }

  public static gatewayTimeout(error: any = 'Tiempo de espera de la puerta de enlace agotado', message?: any) {
    return new HttpError(504, errorData(error, message))
  }

  public static httpVersionNotSupported(error: any = 'Versión HTTP no soportada', message?: any) {
    return new HttpError(505, errorData(error, message))
  }
}

function errorData(e: any, msg?: string) {
  if (typeof e === 'string') {
    return { message: e }
  }

  if (e instanceof Error) {
    if (config.appDebug) {
      const result: any = {}

      // 1. Obtener propiedades propias (tu código actual)
      const ownKeys = Object.getOwnPropertyNames(e)
      for (const key of ownKeys) {
        try {
          result[key] = (e as any)[key]
        } catch {
          result[key] = '[Error al acceder]'
        }
      }

      // 2. Obtener propiedades del prototipo (heredadas)
      let proto = Object.getPrototypeOf(e)
      while (proto && proto !== Object.prototype && proto !== Error.prototype) {
        const protoKeys = Object.getOwnPropertyNames(proto)
        for (const key of protoKeys) {
          if (!result[key] && key !== 'constructor') {
            try {
              result[key] = (e as any)[key]
            } catch {
              result[key] = '[Error al acceder]'
            }
          }
        }
        proto = Object.getPrototypeOf(proto)
      }
      // 3. Agregar información adicional útil
      result._className = e.constructor.name

      if (msg) {
        return {
          message: msg,
          error: result,
        }
      }
      return result
    }
    if (msg) {
      return { message: msg }
    }
    return { message: e.message }
  }
  return e
}
