import { encode, decode } from '@msgpack/msgpack'

/**
 * Construye una URL con parámetros de query string
 * @param {string} url - URL base
 * @param {Object} urlParams - Parámetros para el query string
 * @returns {string} URL con parámetros
 */
function withUrlParams(url, urlParams = {}) {
  const params = new URLSearchParams()
  for (const key in urlParams) {
    const value = urlParams[key]
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  }
  const query = params.toString()
  return query ? `${url}?${query}` : url
}

/**
 * Decodifica la respuesta MessagePack
 * @param {Response} response - Respuesta del servidor
 * @returns {Promise<any>} Datos decodificados
 */
async function decodeResponse(response) {
  const arrayBuffer = await response.arrayBuffer()
  return decode(new Uint8Array(arrayBuffer))
}

/**
 * Realiza una petición GET
 * @param {string} url - URL del endpoint
 * @param {Object} urlParams - Parámetros de query string
 * @returns {Promise<any>} Datos decodificados de la respuesta
 */
export async function get(url, urlParams = {}) {
  const response = await fetch(withUrlParams(url, urlParams), {
    method: 'GET',
    headers: {
      Accept: 'application/msgpack',
    },
  })
  return decodeResponse(response)
}

/**
 * Realiza una petición POST
 * @param {string} url - URL del endpoint
 * @param {*} data - Datos a enviar
 * @param {Object} urlParams - Parámetros de query string
 * @returns {Promise<any>} Datos decodificados de la respuesta
 */
export async function post(url, data = {}, urlParams = {}) {
  const response = await fetch(withUrlParams(url, urlParams), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/msgpack',
      Accept: 'application/msgpack',
    },
    body: encode(data),
  })
  return decodeResponse(response)
}

/**
 * Realiza una petición PUT
 * @param {string} url - URL del endpoint
 * @param {*} data - Datos a enviar
 * @param {Object} urlParams - Parámetros de query string
 * @returns {Promise<any>} Datos decodificados de la respuesta
 */
export async function put(url, data = {}, urlParams = {}) {
  const response = await fetch(withUrlParams(url, urlParams), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/msgpack',
      Accept: 'application/msgpack',
    },
    body: encode(data),
  })
  return decodeResponse(response)
}

/**
 * Realiza una petición PATCH
 * @param {string} url - URL del endpoint
 * @param {*} data - Datos a enviar
 * @param {Object} urlParams - Parámetros de query string
 * @returns {Promise<any>} Datos decodificados de la respuesta
 */
export async function patch(url, data = {}, urlParams = {}) {
  const response = await fetch(withUrlParams(url, urlParams), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/msgpack',
      Accept: 'application/msgpack',
    },
    body: encode(data),
  })
  return decodeResponse(response)
}

/**
 * Realiza una petición DELETE
 * @param {string} url - URL del endpoint
 * @param {*} data - Datos a enviar
 * @param {Object} urlParams - Parámetros de query string
 * @returns {Promise<any>} Datos decodificados de la respuesta
 */
export async function del(url, data = {}, urlParams = {}) {
  const response = await fetch(withUrlParams(url, urlParams), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/msgpack',
      Accept: 'application/msgpack',
    },
    body: encode(data),
  })
  return decodeResponse(response)
}

/**
 * Realiza una petición HEAD
 * @param {string} url - URL del endpoint
 * @param {*} data - Datos a enviar
 * @param {Object} urlParams - Parámetros de query string
 * @returns {Promise<Response>} Respuesta HTTP (sin body)
 */
export async function head(url, data = {}, urlParams = {}) {
  return fetch(withUrlParams(url, urlParams), {
    method: 'HEAD',
    headers: {
      Accept: 'application/msgpack',
    },
    body: encode(data),
  })
}

/**
 * Realiza una petición OPTIONS
 * @param {string} url - URL del endpoint
 * @param {*} data - Datos a enviar
 * @param {Object} urlParams - Parámetros de query string
 * @returns {Promise<any>} Datos decodificados de la respuesta
 */
export async function options(url, data = {}, urlParams = {}) {
  const response = await fetch(withUrlParams(url, urlParams), {
    method: 'OPTIONS',
    headers: {
      'Content-Type': 'application/msgpack',
      Accept: 'application/msgpack',
    },
    body: encode(data),
  })
  return decodeResponse(response)
}

/**
 * Realiza una petición CONNECT
 * @param {string} url - URL del endpoint
 * @param {*} data - Datos a enviar
 * @param {Object} urlParams - Parámetros de query string
 * @returns {Promise<any>} Datos decodificados de la respuesta
 */
export async function connect(url, data = {}, urlParams = {}) {
  const response = await fetch(withUrlParams(url, urlParams), {
    method: 'CONNECT',
    headers: {
      'Content-Type': 'application/msgpack',
      Accept: 'application/msgpack',
    },
    body: encode(data),
  })
  return decodeResponse(response)
}

/**
 * Realiza una petición TRACE
 * @param {string} url - URL del endpoint
 * @param {*} data - Datos a enviar
 * @param {Object} urlParams - Parámetros de query string
 * @returns {Promise<any>} Datos decodificados de la respuesta
 */
export async function trace(url, data = {}, urlParams = {}) {
  const response = await fetch(withUrlParams(url, urlParams), {
    method: 'TRACE',
    headers: {
      'Content-Type': 'application/msgpack',
      Accept: 'application/msgpack',
    },
    body: encode(data),
  })
  return decodeResponse(response)
}
