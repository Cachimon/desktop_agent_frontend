import { MAX_INPUT_LENGTH } from '@/constants'

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
