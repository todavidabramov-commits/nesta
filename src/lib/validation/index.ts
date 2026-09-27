import type { ZodType } from 'zod'

import type { Messages } from '@/i18n/messages'

import type { ValidationKey } from './schemas'

export * from './schemas'

export type FieldErrors = Partial<Record<string, ValidationKey>>

export function parseForm<T>(
  schema: ZodType<T>,
  data: unknown,
): { ok: true; data: T } | { ok: false; fieldErrors: FieldErrors } {
  const result = schema.safeParse(data)
  if (result.success) return { ok: true, data: result.data }

  const fieldErrors: FieldErrors = {}
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] || '')
    if (!key || fieldErrors[key]) continue
    fieldErrors[key] = issue.message as ValidationKey
  }
  return { ok: false, fieldErrors }
}

export function validationMessage(
  key: string | undefined,
  messages: Messages['validation'],
): string | undefined {
  if (!key) return undefined
  if (key in messages) return messages[key as keyof Messages['validation']]
  return messages.required
}
