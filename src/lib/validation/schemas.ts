import { z } from 'zod'

/** Message keys → `messages.validation.*` */
export const V = {
  required: 'required',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  name: 'name',
  passwordMin: 'passwordMin',
  passwordStrength: 'passwordStrength',
  passwordMatch: 'passwordMatch',
  currentPassword: 'currentPassword',
  agree: 'agree',
  property: 'property',
  date: 'date',
  time: 'time',
} as const

export type ValidationKey = (typeof V)[keyof typeof V]

const emailField = z
  .string()
  .trim()
  .min(1, V.required)
  .email(V.email)

const passwordLogin = z.string().min(1, V.required).min(8, V.passwordMin)

const passwordStrong = z
  .string()
  .min(1, V.required)
  .min(8, V.passwordMin)
  .refine((value) => /[\d\W_]/.test(value), V.passwordStrength)

export const signInSchema = z.object({
  email: emailField,
  password: passwordLogin,
})

export type SignInValues = z.infer<typeof signInSchema>

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, V.firstName),
  lastName: z.string().trim().min(1, V.lastName),
  email: emailField,
  password: passwordStrong,
  intent: z.enum(['buy', 'rent']),
  agree: z.boolean().refine((value) => value === true, V.agree),
  newsletter: z.boolean(),
})

export type RegisterValues = z.infer<typeof registerSchema>

export const profileSchema = z
  .object({
    firstName: z.string().trim().min(2, V.firstName),
    lastName: z.string().trim().min(1, V.lastName),
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    const wantsChange = Boolean(data.currentPassword || data.newPassword || data.confirmPassword)
    if (!wantsChange) return

    if (!data.currentPassword) {
      ctx.addIssue({ code: 'custom', path: ['currentPassword'], message: V.currentPassword })
    }

    if (!data.newPassword) {
      ctx.addIssue({ code: 'custom', path: ['newPassword'], message: V.required })
    } else if (data.newPassword.length < 8) {
      ctx.addIssue({ code: 'custom', path: ['newPassword'], message: V.passwordMin })
    } else if (!/[\d\W_]/.test(data.newPassword)) {
      ctx.addIssue({ code: 'custom', path: ['newPassword'], message: V.passwordStrength })
    }

    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: V.passwordMatch })
    }
  })

export type ProfileValues = z.infer<typeof profileSchema>

export const inquireSchema = z.object({
  name: z.string().trim().min(2, V.name),
  email: emailField,
})

export type InquireValues = z.infer<typeof inquireSchema>

export const bookViewingSchema = z.object({
  propertyId: z.string().trim().min(1, V.property),
  viewingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, V.date),
  viewingTime: z.string().trim().min(1, V.time),
})

export type BookViewingValues = z.infer<typeof bookViewingSchema>
