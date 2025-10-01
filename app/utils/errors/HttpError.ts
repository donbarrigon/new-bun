import { MongoAWSError, MongoDriverError, MongoServerError } from 'mongodb'

export class HttpError extends Error {
  private status: number
  private error: any

  constructor(status = 500, error = 'Algo salió mal') {
    super(String(error))
    this.status = status
    this.error = errorData(error)

    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }

  public json(init?: ResponseInit): Response {
    if (init) {
      return new Response(this.error, { status: this.status, ...init })
    }
    return Response.json(this.error, { status: this.status })
  }

  static mongoError(e: any): HttpError {
    if (!e) return HttpError.internal('Error desconocido de la base de datos')

    // --- 1. Errores de duplicidad ---
    if (e.code === 11000 || e.code === 11001) {
      if (config.appDebug) {
        return HttpError.conflict({
          message: 'Registro duplicado',
          error: errorData(e),
        })
      }
      return HttpError.conflict('Registro duplicado')
    }

    // --- 2. Error de validación de esquema ---
    if (e.code === 121) {
      if (config.appDebug) {
        return HttpError.badRequest({
          message: 'Documento no válido según el esquema',
          error: errorData(e),
        })
      }
      return HttpError.badRequest('Documento no válido según el esquema')
    }

    // --- 3. Document too large ---
    if (e.code === 10334) {
      if (config.appDebug) {
        return HttpError.payloadTooLarge({
          message: 'Documento demasiado grande',
          error: errorData(e),
        })
      }
      return HttpError.payloadTooLarge('Documento demasiado grande')
    }

    // --- 4. Write concern errors ---
    if (e.code === 64 || e.code === 65 || e.code === 91 || e.code === 100) {
      if (config.appDebug) {
        return HttpError.serviceUnavailable({
          message: 'Error de escritura en la base de datos',
          error: errorData(e),
        })
      }
      return HttpError.serviceUnavailable('Error de escritura en la base de datos')
    }

    // --- 5. Errores de transacciones ---
    if (e.code === 251 || e.code === 244 || e.code === 112) {
      if (config.appDebug) {
        return HttpError.conflict({
          message: 'Error de transacción',
          error: errorData(e),
        })
      }
      return HttpError.conflict('Error de transacción')
    }

    // --- 6. Namespace no existe ---
    if (e.code === 26) {
      if (config.appDebug) {
        return HttpError.notFound({
          message: 'Colección o base de datos no existe',
          error: errorData(e),
        })
      }
      return HttpError.notFound('Colección o base de datos no existe')
    }

    // --- 7. Cursor no encontrado ---
    if (e.code === 43) {
      if (config.appDebug) {
        return HttpError.badRequest({
          message: 'Cursor expirado o no válido',
          error: errorData(e),
        })
      }
      return HttpError.badRequest('Cursor expirado o no válido')
    }

    // --- 8. Operación interrumpida ---
    if (e.code === 11601 || e.code === 11602) {
      if (config.appDebug) {
        return HttpError.requestTimeout({
          message: 'Operación interrumpida',
          error: errorData(e),
        })
      }
      return HttpError.requestTimeout('Operación interrumpida')
    }

    // --- 9. MaxTimeMSExpired ---
    if (e.code === 50) {
      if (config.appDebug) {
        return HttpError.requestTimeout({
          message: 'Tiempo máximo de ejecución excedido',
          error: errorData(e),
        })
      }
      return HttpError.requestTimeout('Tiempo máximo de ejecución excedido')
    }

    // --- 10. Errores de conexión ---
    if (e.name === 'MongoNetworkError' || e.name === 'MongoTimeoutError') {
      if (config.appDebug) {
        return HttpError.serviceUnavailable(errorData(e))
      }
      return HttpError.serviceUnavailable('Error de conexión con la base de datos')
    }

    // --- 11. Errores de tipo BSON ---
    if (e.name === 'BSONTypeError' || e.name === 'BSONError') {
      if (config.appDebug) {
        return HttpError.unprocessableEntity({
          message: 'Tipo de dato no válido',
          error: errorData(e),
        })
      }
      return HttpError.unprocessableEntity('Tipo de dato no válido')
    }

    // --- 12. Operación en nodo no primario ---
    if (
      e.code === 10058 ||
      e.code === 13436 ||
      e.message?.includes('not master') ||
      e.message?.includes('not primary')
    ) {
      if (config.appDebug) {
        return HttpError.serviceUnavailable({
          message: 'Intento de escritura en un nodo secundario',
          error: errorData(e),
        })
      }
      return HttpError.serviceUnavailable('Intento de escritura en un nodo secundario')
    }

    // --- 13. Errores de autenticación/autorización ---
    if (e.code === 13 || e.code === 18) {
      if (config.appDebug) {
        return HttpError.unauthorized({
          message: 'No autorizado',
          error: errorData(e),
        })
      }
      return HttpError.unauthorized('No autorizado')
    }

    if (e.code === 8000 || e.code === 31) {
      if (config.appDebug) {
        return HttpError.forbidden({
          message: 'Operación prohibida',
          error: errorData(e),
        })
      }
      return HttpError.forbidden('Operación prohibida')
    }

    // --- 14. Error de índice inexistente ---
    if (e.code === 27 || e.code === 85) {
      if (config.appDebug) {
        return HttpError.badRequest({
          message: 'Índice no existe',
          error: errorData(e),
        })
      }
      return HttpError.badRequest('Índice no existe')
    }

    // --- 15. Comando desconocido ---
    if (e.code === 59) {
      if (config.appDebug) {
        return HttpError.badRequest({
          message: 'Comando no reconocido',
          error: errorData(e),
        })
      }
      return HttpError.badRequest('Comando no reconocido')
    }

    // --- 16. Límite de memoria excedido ---
    if (e.code === 292) {
      if (config.appDebug) {
        return HttpError.serviceUnavailable({
          message: 'Límite de memoria excedido',
          error: errorData(e),
        })
      }
      return HttpError.serviceUnavailable('Límite de memoria excedido')
    }

    // --- 17. Errores de tipo MongoParseError ---
    if (e.name === 'MongoParseError') {
      if (config.appDebug) {
        return HttpError.badRequest({
          message: 'Error al parsear la conexión o consulta',
          error: errorData(e),
        })
      }
      return HttpError.badRequest('Error al parsear la conexión o consulta')
    }

    // --- 18. Errores de MongoDB Atlas/AWS ---
    if (e instanceof MongoAWSError) {
      if (config.appDebug) {
        return HttpError.serviceUnavailable({
          message: 'Error de autenticación AWS',
          error: errorData(e),
        })
      }
      return HttpError.serviceUnavailable('Error de autenticación AWS')
    }

    // --- 19. Errores de TopologyDestroyed ---
    if (e.name === 'MongoTopologyClosedError') {
      if (config.appDebug) {
        return HttpError.serviceUnavailable({
          message: 'Conexión a la base de datos cerrada',
          error: errorData(e),
        })
      }
      return HttpError.serviceUnavailable('Conexión a la base de datos cerrada')
    }

    // --- 20. Errores generales de servidor Mongo ---
    if (e.name === 'MongoServerError' || e.name === 'MongoError') {
      if (config.appDebug) {
        return HttpError.internal(errorData(e))
      }
      return HttpError.internal('Error interno del servidor de la base de datos')
    }

    // --- 21. Fallback ---
    if (config.appDebug) {
      return HttpError.internal(errorData(e))
    }
    return HttpError.internal('Error interno de la base de datos')
  }

  // ================================================================
  // 4xx - Errores del cliente
  // ================================================================
  static badRequest(error: any = 'Solicitud incorrecta') {
    return new HttpError(400, error)
  }

  static unauthorized(error: any = 'No autorizado') {
    return new HttpError(401, error)
  }

  static forbidden(error: any = 'Prohibido') {
    return new HttpError(403, error)
  }

  static notFound(error: any = 'No encontrado') {
    return new HttpError(404, error)
  }

  static methodNotAllowed(error: any = 'Método no permitido') {
    return new HttpError(405, error)
  }

  static notAcceptable(error: any = 'No aceptable') {
    return new HttpError(406, error)
  }

  static requestTimeout(error: any = 'Tiempo de solicitud agotado') {
    return new HttpError(408, error)
  }

  static conflict(error: any = 'Conflicto') {
    return new HttpError(409, error)
  }

  static gone(error: any = 'Recurso eliminado') {
    return new HttpError(410, error)
  }

  static lengthRequired(error: any = 'Longitud requerida') {
    return new HttpError(411, error)
  }

  static payloadTooLarge(error: any = 'Carga demasiado grande') {
    return new HttpError(413, error)
  }

  static unsupportedMediaType(error: any = 'Tipo de medio no soportado') {
    return new HttpError(415, error)
  }

  static sessionExpired(error: any = 'Sesión expirada') {
    return new HttpError(419, error)
  }

  static unprocessableEntity(error: any = 'Entidad no procesable') {
    return new HttpError(422, error)
  }

  static tooManyRequests(error: any = 'Demasiadas solicitudes') {
    return new HttpError(429, error)
  }

  // ================================================================
  // 5xx - Errores del servidor
  // ================================================================
  static internal(error: any = 'Error interno del servidor') {
    return new HttpError(500, error)
  }

  static notImplemented(error: any = 'No implementado') {
    return new HttpError(501, error)
  }

  static badGateway(error: any = 'Puerta de enlace incorrecta') {
    return new HttpError(502, error)
  }

  static serviceUnavailable(error: any = 'Servicio no disponible') {
    return new HttpError(503, error)
  }

  static gatewayTimeout(error: any = 'Tiempo de espera de la puerta de enlace agotado') {
    return new HttpError(504, error)
  }

  static httpVersionNotSupported(error: any = 'Versión HTTP no soportada') {
    return new HttpError(505, error)
  }
}

function errorData(e: any) {
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

      return result
    }
    return { message: e.message }
  }

  return e
}
