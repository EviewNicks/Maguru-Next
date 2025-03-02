// __tests__/__mocks__/utils.ts
import { ClassValue } from 'clsx'

export const cn = (...inputs: ClassValue[]) => {
  return inputs.filter(Boolean).join(' ').trim()
}
