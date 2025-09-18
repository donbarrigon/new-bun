import type { Document } from '../../shared/db/db.ts'
export interface User extends Document {
  profile: UserProfile
  email: string
  password: string
}

export interface UserProfile {
  name?: string
  nickname: string
  phone?: string
}
