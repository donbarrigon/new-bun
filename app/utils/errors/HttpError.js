import { encode } from "@msgpack/msgpack";
import { MongoAWSError, MongoDriverError, MongoServerError } from "mongodb";

/**
 * Clase personalizada para manejar errores HTTP
 */
export class HttpError extends Error {
  /**
   * Crea un nuevo error HTTP
   * @param {number} status - Código de estado HTTP
   * @param {*} error - Datos del error
   */
  constructor(status = 500, error = "Algo salió mal") {
    super(String(error));
    this.status = status;
    this.error = error;

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }

  /**
   * Retorna una respuesta HTTP en formato JSON
   * @param {ResponseInit} [init] - Opciones adicionales para la respuesta
   * @returns {Response} Respuesta HTTP
   */
  json(init) {
    if (init) {
      return new Response(this.error, { status: this.status, ...init });
    }
    return Response.json(this.error, { status: this.status });
  }

  /**
   * Retorna una respuesta HTTP en formato msgpack
   * @param {ResponseInit} init - Opciones adicionales para la respuesta
   * @returns {Response} Respuesta HTTP
   */
  msgpack(init) {
    const body = encode(this.error);
    if (init) {
      return new Response(body, {
        status: this.status,
        headers: {
          "Content-Type": "application/msgpack",
          ...init.headers,
        },
        ...init,
      });
    }

    return new Response(body, {
      status: this.status,
      headers: {
        "Content-Type": "application/msgpack",
      },
    });
  }

  // ================================================================
  // Errores de mongodb
  // ================================================================

  /**
   * Convierte errores de MongoDB en HttpError apropiados
   * @param {*} e - Error de MongoDB
   * @returns {HttpError} Error HTTP correspondiente
   */
  static mongo(e) {
    if (!e)
      return HttpError.internal("No sabemos qué pasó con la base de datos");

    // --- 1. Errores de duplicidad ---
    if (e.code === 11000 || e.code === 11001) {
      return HttpError.conflict(e, "Este registro ya existe");
    }

    // --- 2. Error de validación de esquema ---
    if (e.code === 121) {
      return HttpError.badRequest(
        e,
        "Los datos no cumplen con el formato esperado"
      );
    }

    // --- 3. Document too large ---
    if (e.code === 10334) {
      return HttpError.payloadTooLarge(e, "Los datos son demasiado grandes");
    }

    // --- 4. Write concern errors ---
    if (e.code === 64 || e.code === 65 || e.code === 91 || e.code === 100) {
      return HttpError.serviceUnavailable(
        e,
        "No pudimos guardar los datos, intenta de nuevo"
      );
    }

    // --- 5. Errores de transacciones ---
    if (e.code === 251 || e.code === 244 || e.code === 112) {
      return HttpError.conflict(
        e,
        "Hubo un problema con la operación, intenta nuevamente"
      );
    }

    // --- 6. Namespace no existe ---
    if (e.code === 26) {
      return HttpError.notFound(e, "No encontramos lo que buscabas");
    }

    // --- 7. Cursor no encontrado ---
    if (e.code === 43) {
      return HttpError.badRequest(
        e,
        "La búsqueda expiró, por favor intenta de nuevo"
      );
    }

    // --- 8. Operación interrumpida ---
    if (e.code === 11601 || e.code === 11602) {
      return HttpError.requestTimeout(e, "La operación tardó demasiado");
    }

    // --- 9. MaxTimeMSExpired ---
    if (e.code === 50) {
      return HttpError.requestTimeout(e, "La operación tardó demasiado tiempo");
    }

    // --- 10. Errores de conexión ---
    if (e.name === "MongoNetworkError" || e.name === "MongoTimeoutError") {
      return HttpError.serviceUnavailable(
        e,
        "No pudimos conectarnos a la base de datos"
      );
    }

    // --- 11. Errores de tipo BSON ---
    if (e.name === "BSONTypeError" || e.name === "BSONError") {
      return HttpError.unprocessableEntity(e, "El tipo de dato no es válido");
    }

    // --- 12. Operación en nodo no primario ---
    if (
      e.code === 10058 ||
      e.code === 13436 ||
      e.message?.includes("not master") ||
      e.message?.includes("not primary")
    ) {
      return HttpError.serviceUnavailable(
        e,
        "La base de datos no está disponible en este momento"
      );
    }

    // --- 13. Errores de autenticación/autorización ---
    if (e.code === 13 || e.code === 18) {
      return HttpError.unauthorized(e, "No tienes permiso para hacer esto");
    }

    if (e.code === 8000 || e.code === 31) {
      return HttpError.forbidden(e, "No puedes realizar esta acción");
    }

    // --- 14. Error de índice inexistente ---
    if (e.code === 27 || e.code === 85) {
      return HttpError.badRequest(
        e,
        "Hay un problema con la configuración de la búsqueda"
      );
    }

    // --- 15. Comando desconocido ---
    if (e.code === 59) {
      return HttpError.badRequest(e, "La operación solicitada no existe");
    }

    // --- 16. Límite de memoria excedido ---
    if (e.code === 292) {
      return HttpError.serviceUnavailable(
        e,
        "La operación necesita demasiados recursos"
      );
    }

    // --- 17. Errores de tipo MongoParseError ---
    if (e.name === "MongoParseError") {
      return HttpError.badRequest(
        e,
        "Hubo un problema al procesar la solicitud"
      );
    }

    // --- 18. Errores de MongoDB Atlas/AWS ---
    if (e instanceof MongoAWSError) {
      return HttpError.serviceUnavailable(
        e,
        "No pudimos autenticarnos con el servicio"
      );
    }

    // --- 19. Errores de TopologyDestroyed ---
    if (e.name === "MongoTopologyClosedError") {
      return HttpError.serviceUnavailable(
        e,
        "Perdimos la conexión con la base de datos"
      );
    }

    // --- 20. Errores generales de servidor Mongo ---
    if (e.name === "MongoServerError" || e.name === "MongoError") {
      return HttpError.internal(e, "Hubo un problema con la base de datos");
    }

    // --- 21. Fallback ---
    return HttpError.internal(e, "Algo salió mal con la base de datos");
  }

  // ================================================================
  // 4xx - Errores del cliente
  // ================================================================

  /**
   * Error 400 - Solicitud incorrecta
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static badRequest(error = "La solicitud no es correcta", message) {
    return new HttpError(400, errorData(error, message));
  }

  /**
   * Error 401 - No autorizado
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static unauthorized(error = "Necesitas iniciar sesión", message) {
    return new HttpError(401, errorData(error, message));
  }

  /**
   * Error 403 - Prohibido
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static forbidden(error = "No tienes permiso para hacer esto", message) {
    return new HttpError(403, errorData(error, message));
  }

  /**
   * Error 404 - No encontrado
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static notFound(error = "No encontramos lo que buscas", message) {
    return new HttpError(404, errorData(error, message));
  }

  /**
   * Error 405 - Método no permitido
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static methodNotAllowed(error = "Esta acción no está permitida", message) {
    return new HttpError(405, errorData(error, message));
  }

  /**
   * Error 406 - No aceptable
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static notAcceptable(error = "No podemos procesar tu solicitud", message) {
    return new HttpError(406, errorData(error, message));
  }

  /**
   * Error 408 - Tiempo agotado
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static requestTimeout(error = "La solicitud tardó demasiado", message) {
    return new HttpError(408, errorData(error, message));
  }

  /**
   * Error 409 - Conflicto
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static conflict(error = "Hay un conflicto con los datos", message) {
    return new HttpError(409, errorData(error, message));
  }

  /**
   * Error 410 - Recurso eliminado
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static gone(error = "Este recurso ya no existe", message) {
    return new HttpError(410, errorData(error, message));
  }

  /**
   * Error 411 - Longitud requerida
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static lengthRequired(error = "Falta información necesaria", message) {
    return new HttpError(411, errorData(error, message));
  }

  /**
   * Error 413 - Carga demasiado grande
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static payloadTooLarge(error = "Los datos son demasiado grandes", message) {
    return new HttpError(413, errorData(error, message));
  }

  /**
   * Error 415 - Tipo de medio no soportado
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static unsupportedMediaType(error = "El formato no es compatible", message) {
    return new HttpError(415, errorData(error, message));
  }

  /**
   * Error 419 - Sesión expirada
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static sessionExpired(error = "Tu sesión ha expirado", message) {
    return new HttpError(419, errorData(error, message));
  }

  /**
   * Error 422 - Entidad no procesable
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static unprocessableEntity(error = "No pudimos procesar los datos", message) {
    return new HttpError(422, errorData(error, message));
  }

  /**
   * Error 429 - Demasiadas solicitudes
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static tooManyRequests(
    error = "Demasiadas solicitudes, espera un momento",
    message
  ) {
    return new HttpError(429, errorData(error, message));
  }

  // ================================================================
  // 5xx - Errores del servidor
  // ================================================================

  /**
   * Error 500 - Error interno del servidor
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static internal(error = "Algo salió mal en el servidor", message) {
    return new HttpError(500, errorData(error, message));
  }

  /**
   * Error 501 - No implementado
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static notImplemented(
    error = "Esta función aún no está disponible",
    message
  ) {
    return new HttpError(501, errorData(error, message));
  }

  /**
   * Error 502 - Puerta de enlace incorrecta
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static badGateway(error = "Hubo un problema con el servidor", message) {
    return new HttpError(502, errorData(error, message));
  }

  /**
   * Error 503 - Servicio no disponible
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static serviceUnavailable(
    error = "El servicio no está disponible ahora",
    message
  ) {
    return new HttpError(503, errorData(error, message));
  }

  /**
   * Error 504 - Tiempo de espera agotado
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static gatewayTimeout(
    error = "El servidor tardó demasiado en responder",
    message
  ) {
    return new HttpError(504, errorData(error, message));
  }

  /**
   * Error 505 - Versión HTTP no soportada
   * @param {*} error - Datos del error
   * @param {string} [message] - Mensaje personalizado (opcional)
   * @returns {HttpError}
   */
  static httpVersionNotSupported(
    error = "Tu navegador usa una versión muy antigua",
    message
  ) {
    return new HttpError(505, errorData(error, message));
  }
}

/**
 * Procesa los datos del error para la respuesta
 * @param {*} e - Error a procesar
 * @param {string} [msg] - Mensaje personalizado (opcional)
 * @returns {Object} Datos del error formateados
 */
function errorData(e, msg) {
  if (typeof e === "string") {
    return { message: e };
  }

  if (e instanceof Error) {
    if (config.appDebug) {
      const result = {};

      // 1. Obtener propiedades propias
      const ownKeys = Object.getOwnPropertyNames(e);
      for (const key of ownKeys) {
        try {
          result[key] = e[key];
        } catch {
          result[key] = "[No pudimos leer esto]";
        }
      }

      // 2. Obtener propiedades del prototipo (heredadas)
      let proto = Object.getPrototypeOf(e);
      while (proto && proto !== Object.prototype && proto !== Error.prototype) {
        const protoKeys = Object.getOwnPropertyNames(proto);
        for (const key of protoKeys) {
          if (!result[key] && key !== "constructor") {
            try {
              result[key] = e[key];
            } catch {
              result[key] = "[No pudimos leer esto]";
            }
          }
        }
        proto = Object.getPrototypeOf(proto);
      }

      // 3. Agregar información adicional útil
      result._className = e.constructor.name;

      if (msg) {
        return {
          message: msg,
          error: result,
        };
      }
      return result;
    }

    if (msg) {
      return { message: msg };
    }
    return { message: e.message };
  }

  return e;
}
