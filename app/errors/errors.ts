interface Props {
  status?: number
  message?: string
  error?: any
}

export class AppError extends Error {
  public status: number
  public error: any

  constructor({ status = 500, message = 'Something went wrong', error = null }: Props) {
    super(message)
    this.status = status
    this.error = error

    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
  }

  // 4xx - Client errors
  static badRequest(error?: any) {
    return new AppError({
      status: 400,
      message: 'Bad Request',
      error,
    })
  }
  static unauthorized(error?: any) {
    return new AppError({
      status: 401,
      message: 'Unauthorized',
      error,
    })
  }
  static forbidden(error?: any) {
    return new AppError({
      status: 403,
      message: 'Forbidden',
      error,
    })
  }
  static notFound(error?: any) {
    return new AppError({
      status: 404,
      message: 'Not Found',
      error,
    })
  }
  static methodNotAllowed(error?: any) {
    return new AppError({
      status: 405,
      message: 'Method Not Allowed',
      error,
    })
  }
  static notAcceptable(error?: any) {
    return new AppError({
      status: 406,
      message: 'Not Acceptable',
      error,
    })
  }
  static requestTimeout(error?: any) {
    return new AppError({
      status: 408,
      message: 'Request Timeout',
      error,
    })
  }
  static conflict(error?: any) {
    return new AppError({
      status: 409,
      message: 'Conflict',
      error,
    })
  }
  static gone(error?: any) {
    return new AppError({
      status: 410,
      message: 'Gone',
      error,
    })
  }
  static lengthRequired(error?: any) {
    return new AppError({
      status: 411,
      message: 'Length Required',
      error,
    })
  }
  static payloadTooLarge(error?: any) {
    return new AppError({
      status: 413,
      message: 'Payload Too Large',
      error,
    })
  }
  static unsupportedMediaType(error?: any) {
    return new AppError({
      status: 415,
      message: 'Unsupported Media Type',
      error,
    })
  }
  static unprocessableEntity(error?: any) {
    return new AppError({
      status: 422,
      message: 'Unprocessable Entity',
      error,
    })
  }
  static tooManyRequests(error?: any) {
    return new AppError({
      status: 429,
      message: 'Too Many Requests',
      error,
    })
  }

  // 5xx - Server errors
  static internal(error?: any) {
    return new AppError({
      status: 500,
      message: 'Internal Server Error',
      error,
    })
  }
  static notImplemented(error?: any) {
    return new AppError({
      status: 501,
      message: 'Not Implemented',
      error,
    })
  }
  static badGateway(error?: any) {
    return new AppError({
      status: 502,
      message: 'Bad Gateway',
      error,
    })
  }
  static serviceUnavailable(error?: any) {
    return new AppError({
      status: 503,
      message: 'Service Unavailable',
      error,
    })
  }
  static gatewayTimeout(error?: any) {
    return new AppError({
      status: 504,
      message: 'Gateway Timeout',
      error,
    })
  }
  static httpVersionNotSupported(error?: any) {
    return new AppError({
      status: 505,
      message: 'HTTP Version Not Supported',
      error,
    })
  }
}
