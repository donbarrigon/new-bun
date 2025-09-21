import { HttpError } from './HttpError.ts'
export class ValidationErrors {
  errors: Record<string, string[]> = {}
  constructor(errors: Record<string, string[]> = {}) {
    this.errors = errors
  }

  hasRequestErrors(): void {
    for (const _ in this.errors) {
      throw HttpError.badRequest(this.errors)
    }
  }

  hasRepositoryErrors(): void {
    for (const _ in this.errors) {
      throw HttpError.unprocessableEntity(this.errors)
    }
  }

  append(key: string, message: string[]): void {
    if (message.length > 0) {
      ;(this.errors[key] ??= []).push(...message)
    }
  }
}
