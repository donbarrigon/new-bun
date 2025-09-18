import { HttpError } from './HttpErrors.ts'
export class ValidatorErrors {
  errors: Record<string, string[]> = {}
  constructor(errors: Record<string, string[]> = {}) {
    this.errors = errors
  }

  hasErrors(): void {
    if (Object.keys(this.errors).length > 0) {
      throw HttpError.badRequest(this.errors)
    }
  }

  append(bool: boolean, key: string, message: string): void {
    if (!bool) return
    ;(this.errors[key] ??= []).push(message)
  }
}
