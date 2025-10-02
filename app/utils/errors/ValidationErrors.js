import { HttpError } from './HttpError'
export class ValidationErrors {
  errors = {}

  constructor(errors = {}) {
    this.errors = errors
  }

  hasRequestErrors() {
    for (const _ in this.errors) {
      throw HttpError.badRequest(this.errors)
    }
  }

  hasEntityErrors() {
    for (const _ in this.errors) {
      throw HttpError.unprocessableEntity(this.errors)
    }
  }

  append(key, messages) {
    if (messages.length > 0) {
      ;(this.errors[key] ??= []).push(...messages)
    }
  }
}
