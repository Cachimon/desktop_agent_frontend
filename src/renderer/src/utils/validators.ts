import { MAX_INPUT_LENGTH, VERIFICATION_CODE_LENGTH } from '@/constants'

export function validateInput(input: string): { valid: boolean; error?: string } {
  const trimmed = input.trim()
  if (trimmed.length === 0) {
    return { valid: false }
  }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { valid: false, error: `消息过长，请缩短后发送（最大 ${MAX_INPUT_LENGTH} 字符）` }
  }
  return { valid: true }
}

export function isEmptyInput(input: string): boolean {
  return input.trim().length === 0
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidVerificationCode(code: string): boolean {
  const codeRegex = /^\d{6}$/
  return codeRegex.test(code)
}

export function isValidWorkspacePath(path: string): boolean {
  return path.trim().length > 0
}
