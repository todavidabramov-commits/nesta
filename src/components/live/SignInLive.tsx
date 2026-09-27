'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { signInCustomer } from '@/app/(frontend)/actions/auth'
import { FieldError, FieldLabel, fieldClassName } from '@/components/forms/FieldError'
import { NestaLogo } from '@/components/NestaLogo'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useLocale } from '@/i18n/locale-context'
import { btnClass, cn } from '@/lib/ui'
import { signInSchema, validationMessage } from '@/lib/validation'

const fieldClass =
  'w-full rounded-md border border-line bg-surface-soft px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-forest focus:ring-0'

export function SignInLive({ next = '/dashboard' }: { next?: string }) {
  const router = useRouter()
  const { messages } = useLocale()
  const t = messages.signIn
  const v = messages.validation
  const form = useFormValidation(signInSchema)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const emailMsg = validationMessage(form.error('email'), v)
  const passwordMsg = validationMessage(form.error('password'), v)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const passwordOk = password.length >= 8

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!form.validate({ email, password })) return

    setSubmitting(true)
    try {
      const result = await signInCustomer({ email, password })
      if (!result.ok) {
        setFormError(
          t.errors[
            result.error === 'validation'
              ? 'validation'
              : result.error === 'credentials'
                ? 'credentials'
                : 'unknown'
          ],
        )
        return
      }
      router.push(next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard')
      router.refresh()
    } catch {
      setFormError(t.errors.unknown)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-r from-[#f7f3eb] to-[#efe7da]">
      <header className="relative flex h-20 shrink-0 items-center justify-between border-b border-line bg-surface px-[var(--page-pad)] min-[901px]:hidden">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center [&_img]:h-[52px] [&_img]:w-auto"
          aria-label={messages.common.brand}
        >
          <NestaLogo size={52} />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 font-display text-[15px] font-normal text-ink no-underline"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
          {t.cancel}
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 min-[901px]:min-h-dvh">
        <div className="relative flex w-full flex-col px-5 py-6 min-[901px]:w-[640px] min-[901px]:shrink-0 min-[901px]:justify-between min-[901px]:border-r min-[901px]:border-line min-[901px]:bg-surface min-[901px]:p-16">
          <Link
            href="/"
            className="group absolute left-5 top-5 z-[1] hidden items-center gap-1.5 font-display text-lg font-normal leading-none text-ink no-underline transition-opacity duration-200 hover:opacity-70 min-[901px]:inline-flex"
          >
            <ArrowLeft
              className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5"
              strokeWidth={1.5}
              aria-hidden
            />
            {t.cancel}
          </Link>
          <div className="hidden justify-center min-[901px]:flex">
            <Link href="/" className="inline-flex items-center" aria-label={messages.common.brand}>
              <NestaLogo size={120} />
            </Link>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mx-auto flex w-full max-w-[512px] flex-col gap-6 min-[901px]:mx-0 min-[901px]:max-w-none min-[901px]:gap-5"
          >
            <div className="flex flex-col gap-2 min-[901px]:gap-3">
              <h1 className="m-0 font-display text-[32px] font-normal leading-[1.15] text-ink min-[901px]:text-[40px]">
                {t.title}
              </h1>
              <p className="m-0 text-sm leading-relaxed text-muted min-[901px]:text-[15px]">
                {t.lead}
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-[0_4px_6px_rgba(0,0,0,0.03)] min-[901px]:gap-4 min-[901px]:rounded-none min-[901px]:border-0 min-[901px]:bg-transparent min-[901px]:p-0 min-[901px]:shadow-none">
              <label className="flex flex-col gap-1.5">
                <FieldLabel ok={emailOk && !emailMsg}>{t.email}</FieldLabel>
                <input
                  type="email"
                  className={fieldClassName(fieldClass, Boolean(emailMsg), emailOk && !emailMsg)}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    form.clearField('email')
                    setFormError(null)
                  }}
                  autoComplete="email"
                  aria-invalid={Boolean(emailMsg)}
                />
                <FieldError message={emailMsg} />
              </label>

              <label className="flex flex-col gap-1.5">
                <FieldLabel
                  ok={passwordOk && !passwordMsg}
                  trailing={
                    <Link
                      href="/forgot-password"
                      className="normal-case font-semibold text-forest no-underline"
                    >
                      {t.forgot}
                    </Link>
                  }
                >
                  {t.password}
                </FieldLabel>
                <span className="relative block">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={fieldClassName(
                      cn(fieldClass, 'pr-10'),
                      Boolean(passwordMsg),
                      passwordOk && !passwordMsg,
                    )}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      form.clearField('password')
                      setFormError(null)
                    }}
                    autoComplete="current-password"
                    aria-invalid={Boolean(passwordMsg)}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-muted shadow-none outline-none appearance-none hover:text-ink"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" strokeWidth={1.75} />
                    ) : (
                      <Eye className="size-4" strokeWidth={1.75} />
                    )}
                  </button>
                </span>
                <FieldError message={passwordMsg} />
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={remember}
                  onClick={() => setRemember((prev) => !prev)}
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded p-0',
                    remember ? 'border-0 bg-forest text-surface' : 'border border-line bg-surface-soft',
                  )}
                >
                  {remember ? <Check className="size-2.5" strokeWidth={3} aria-hidden /> : null}
                </button>
                <span className="text-xs text-muted">{t.remember}</span>
              </label>

              {formError ? (
                <p className="m-0 text-[13px] font-semibold text-[#8b3a2f] motion-safe:animate-[field-error-in_200ms_ease-out]">
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  btnClass('primary', 'block'),
                  'rounded-md py-3 disabled:cursor-not-allowed disabled:opacity-50 min-[901px]:py-3.5',
                )}
              >
                {t.submit}
              </button>
            </div>

            <div className="flex flex-col gap-3 min-[901px]:gap-4">
              <div className="flex items-center gap-3 min-[901px]:gap-4">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[11px] text-muted min-[901px]:text-xs">{t.orContinue}</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <button
                type="button"
                disabled
                title={t.googleSoon}
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 py-3 text-[13px] font-semibold text-ink opacity-55"
              >
                <Image
                  src="/images/icon-google.svg"
                  alt=""
                  width={16}
                  height={16}
                  unoptimized
                  className="size-4"
                />
                {t.google}
              </button>
            </div>
          </form>

          <p className="m-0 mt-6 flex flex-wrap justify-center gap-1.5 text-[13px] min-[901px]:mt-0">
            <span className="text-muted">{t.noAccount}</span>
            <Link href="/register" className="font-bold text-forest underline">
              {t.register}
            </Link>
          </p>
        </div>

        <aside className="relative hidden min-w-0 flex-1 flex-col justify-between self-stretch p-20 min-[901px]:flex">
          <Image
            src="/images/register-cover.jpg"
            alt=""
            fill
            priority
            unoptimized
            className="object-cover"
            sizes="(max-width: 900px) 0px, 60vw"
          />
          <div className="absolute inset-0 bg-[rgba(22,51,36,0.45)]" aria-hidden />
          <div className="relative z-[1] mt-auto flex max-w-[520px] flex-col gap-6">
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-accent">
              {messages.register.coverEyebrow}
            </p>
            <p className="m-0 font-display text-5xl font-normal leading-[1.15] text-surface">
              {messages.register.coverQuote}
            </p>
            <p className="m-0 text-base leading-relaxed text-[#e7e1d7]">
              {messages.register.coverLead}
            </p>
          </div>
          <div className="relative z-[1] mt-16 flex items-center gap-4">
            <span className="h-px w-8 bg-accent" aria-hidden />
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-accent">
              {messages.register.coverCredit}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
