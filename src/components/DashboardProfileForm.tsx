'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { updateCustomerProfile } from '@/app/(frontend)/actions/auth'
import { isCmsMedia } from '@/cms/utils'
import { FieldError, FieldLabel, fieldClassName } from '@/components/forms/FieldError'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useLocale } from '@/i18n/locale-context'
import type { CustomerSession } from '@/lib/customer-auth'
import { btnClass, cn } from '@/lib/ui'
import { profileSchema, validationMessage } from '@/lib/validation'

const fieldClass =
  'w-full rounded-md border border-line bg-surface-soft px-3.5 py-3 text-sm text-ink outline-none transition-[border-color] placeholder:text-muted focus:border-forest'

export function DashboardProfileForm({ customer }: { customer: CustomerSession }) {
  const router = useRouter()
  const { messages } = useLocale()
  const t = messages.dashboard.profile
  const v = messages.validation
  const form = useFormValidation(profileSchema)
  const fileRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState(customer.firstName)
  const [lastName, setLastName] = useState(customer.lastName)
  const [photoUrl, setPhotoUrl] = useState(customer.photoUrl)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const firstNameMsg = validationMessage(form.error('firstName'), v)
  const lastNameMsg = validationMessage(form.error('lastName'), v)
  const currentPasswordMsg = validationMessage(form.error('currentPassword'), v)
  const newPasswordMsg = validationMessage(form.error('newPassword'), v)
  const confirmPasswordMsg = validationMessage(form.error('confirmPassword'), v)

  const firstOk = firstName.trim().length > 1
  const lastOk = lastName.trim().length > 0
  const wantsPasswordChange = Boolean(currentPassword || newPassword || confirmPassword)
  const currentPasswordOk = !wantsPasswordChange || currentPassword.length > 0
  const newPasswordOk =
    !wantsPasswordChange || (newPassword.length >= 8 && /[\d\W_]/.test(newPassword))
  const confirmPasswordOk =
    !wantsPasswordChange || (confirmPassword.length > 0 && confirmPassword === newPassword)

  useEffect(() => {
    setFirstName(customer.firstName)
    setLastName(customer.lastName)
    if (!photoFile) setPhotoUrl(customer.photoUrl)
  }, [customer.firstName, customer.lastName, customer.photoUrl, photoFile])

  useEffect(() => {
    return () => {
      if (photoUrl.startsWith('blob:')) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  const initials =
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() ||
    customer.email[0]?.toUpperCase() ||
    'N'

  function onPickPhoto(file: File | undefined) {
    if (!file) return
    if (photoUrl.startsWith('blob:')) URL.revokeObjectURL(photoUrl)
    setPhotoFile(file)
    setPhotoUrl(URL.createObjectURL(file))
    setSaved(false)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setSaved(false)

    if (
      !form.validate({
        firstName,
        lastName,
        currentPassword,
        newPassword,
        confirmPassword,
      })
    ) {
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.set('firstName', firstName)
      formData.set('lastName', lastName)
      formData.set('currentPassword', currentPassword)
      formData.set('newPassword', newPassword)
      formData.set('confirmPassword', confirmPassword)
      if (photoFile) formData.set('photo', photoFile)

      const result = await updateCustomerProfile(formData)
      if (!result.ok) {
        setError(t.errors[result.error] || t.errors.unknown)
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPhotoFile(null)
      setSaved(true)
      form.clearAll()
      router.refresh()
    } catch {
      setError(t.errors.unknown)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 font-display text-[28px] font-normal leading-none text-ink min-[901px]:text-[36px]">
          {t.title}
        </h1>
        <p className="m-0 text-[13px] text-muted min-[901px]:text-sm">{t.lead}</p>
      </div>

      <div className="flex flex-col gap-5 min-[640px]:flex-row min-[640px]:items-center min-[640px]:gap-0">
        <div className="flex w-full shrink-0 flex-col items-center gap-2.5 min-[640px]:w-auto min-[640px]:pr-8">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative size-36 overflow-hidden rounded-2xl border border-line bg-surface-soft min-[901px]:size-44"
            aria-label={t.changePhoto}
          >
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt=""
                fill
                unoptimized={isCmsMedia(photoUrl) || photoUrl.startsWith('blob:')}
                className="object-cover"
                sizes="176px"
              />
            ) : (
              <span className="flex size-full items-center justify-center bg-forest text-3xl font-bold text-surface min-[901px]:text-4xl">
                {initials}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border-0 bg-transparent p-0 text-center text-[13px] font-semibold text-forest"
          >
            {t.changePhoto}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => onPickPhoto(e.target.files?.[0])}
          />
        </div>

        <div
          className="h-px w-full bg-line min-[640px]:h-40 min-[640px]:w-px min-[640px]:self-center"
          aria-hidden
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4 min-[640px]:pl-8">
          <label className="flex flex-col gap-1.5">
            <FieldLabel ok={firstOk && !firstNameMsg}>{t.firstName}</FieldLabel>
            <input
              className={fieldClassName(fieldClass, Boolean(firstNameMsg), firstOk && !firstNameMsg)}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
                form.clearField('firstName')
                setSaved(false)
                setError(null)
              }}
              autoComplete="given-name"
              aria-invalid={Boolean(firstNameMsg)}
            />
            <FieldError message={firstNameMsg} />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel ok={lastOk && !lastNameMsg}>{t.lastName}</FieldLabel>
            <input
              className={fieldClassName(fieldClass, Boolean(lastNameMsg), lastOk && !lastNameMsg)}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
                form.clearField('lastName')
                setSaved(false)
                setError(null)
              }}
              autoComplete="family-name"
              aria-invalid={Boolean(lastNameMsg)}
            />
            <FieldError message={lastNameMsg} />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel ok>{t.email}</FieldLabel>
            <input className={cn(fieldClass, 'border-[#2a5c3f] opacity-70')} value={customer.email} disabled readOnly />
          </label>
        </div>
      </div>

      <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
        <legend className="mb-0 p-0 text-[11px] font-bold uppercase tracking-wide text-muted">
          {t.passwordSection}
        </legend>
        <p className="m-0 text-xs text-muted">{t.passwordHint}</p>
        <label className="flex flex-col gap-1.5">
          <FieldLabel
            plain
            ok={wantsPasswordChange && currentPasswordOk && !currentPasswordMsg}
          >
            {t.currentPassword}
          </FieldLabel>
          <input
            className={fieldClassName(
              fieldClass,
              Boolean(currentPasswordMsg),
              wantsPasswordChange && currentPasswordOk && !currentPasswordMsg,
            )}
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value)
              form.clearField('currentPassword')
              setSaved(false)
              setError(null)
            }}
            autoComplete="current-password"
            aria-invalid={Boolean(currentPasswordMsg)}
          />
          <FieldError message={currentPasswordMsg} />
        </label>
        <div className="grid gap-4 min-[901px]:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <FieldLabel
              plain
              ok={wantsPasswordChange && newPasswordOk && !newPasswordMsg}
            >
              {t.newPassword}
            </FieldLabel>
            <input
              className={fieldClassName(
                fieldClass,
                Boolean(newPasswordMsg),
                wantsPasswordChange && newPasswordOk && !newPasswordMsg,
              )}
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                form.clearField('newPassword')
                form.clearField('confirmPassword')
                setSaved(false)
                setError(null)
              }}
              autoComplete="new-password"
              aria-invalid={Boolean(newPasswordMsg)}
            />
            <FieldError message={newPasswordMsg} />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel
              plain
              ok={wantsPasswordChange && confirmPasswordOk && !confirmPasswordMsg}
            >
              {t.confirmPassword}
            </FieldLabel>
            <input
              className={fieldClassName(
                fieldClass,
                Boolean(confirmPasswordMsg),
                wantsPasswordChange && confirmPasswordOk && !confirmPasswordMsg,
              )}
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                form.clearField('confirmPassword')
                setSaved(false)
                setError(null)
              }}
              autoComplete="new-password"
              aria-invalid={Boolean(confirmPasswordMsg)}
            />
            <FieldError message={confirmPasswordMsg} />
          </label>
        </div>
      </fieldset>

      {error ? (
        <p className="m-0 text-sm font-medium text-accent motion-safe:animate-[field-error-in_200ms_ease-out]">
          {error}
        </p>
      ) : null}
      {saved ? <p className="m-0 text-sm font-medium text-forest">{t.saved}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className={cn(btnClass('primary', 'sm'), 'self-start px-6 py-3 text-sm disabled:opacity-60')}
      >
        {submitting ? t.saving : t.save}
      </button>
    </form>
  )
}
