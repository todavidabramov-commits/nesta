'use client'

import { useCallback, useState } from 'react'
import type { ZodType } from 'zod'

import { parseForm, type FieldErrors, type ValidationKey } from '@/lib/validation'

export function useFormValidation<T>(schema: ZodType<T>) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [showErrors, setShowErrors] = useState(false)

  const validate = useCallback(
    (data: unknown): data is T => {
      const result = parseForm(schema, data)
      setShowErrors(true)
      if (result.ok) {
        setFieldErrors({})
        return true
      }
      setFieldErrors(result.fieldErrors)
      return false
    },
    [schema],
  )

  const clearField = useCallback((name: string) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setFieldErrors({})
  }, [])

  const error = useCallback(
    (name: string): ValidationKey | undefined => {
      if (!showErrors) return undefined
      return fieldErrors[name]
    },
    [fieldErrors, showErrors],
  )

  return {
    fieldErrors,
    showErrors,
    validate,
    clearField,
    clearAll,
    error,
    setFieldErrors,
  }
}
