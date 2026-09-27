'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Eye, EyeOff, Info } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'

import { registerCustomer } from '@/app/(frontend)/actions/auth'
import { FieldError, FieldLabel, fieldClassName } from '@/components/forms/FieldError'
import { NestaLogo } from '@/components/NestaLogo'
import { useFormValidation } from '@/hooks/useFormValidation'
import { useLocale } from '@/i18n/locale-context'
import { cn } from '@/lib/ui'
import { registerSchema, validationMessage } from '@/lib/validation'

type Intent = 'buy' | 'rent'

const fieldClass =
  'w-full rounded-md border border-line bg-surface-soft px-3 py-2 text-[13px] text-ink outline-none transition-[border-color] placeholder:text-muted focus:border-forest focus:outline-none min-[901px]:px-3.5 min-[901px]:py-3 min-[901px]:text-sm'

function hasMinLength(password: string) {
  return password.length >= 8
}

function hasSymbolOrNumber(password: string) {
  return /[\d\W_]/.test(password)
}

export function RegisterLive() {
  const router = useRouter()
  const { messages } = useLocale()
  const t = messages.register
  const v = messages.validation
  const form = useFormValidation(registerSchema)

  const [intent, setIntent] = useState<Intent>('buy')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agree, setAgree] = useState(true)
  const [newsletter, setNewsletter] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const minOk = hasMinLength(password)
  const symbolOk = hasSymbolOrNumber(password)
  const firstOk = firstName.trim().length > 1
  const lastOk = lastName.trim().length > 0
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const passwordOk = minOk && symbolOk

  const firstNameMsg = validationMessage(form.error('firstName'), v)
  const lastNameMsg = validationMessage(form.error('lastName'), v)
  const emailMsg = validationMessage(form.error('email'), v)
  const passwordMsg = validationMessage(form.error('password'), v)
  const agreeMsg = validationMessage(form.error('agree'), v)

  const intentOptions = useMemo(
    () => [
      { id: 'buy' as const, label: t.intentBuyShort },
      { id: 'rent' as const, label: t.intentRentShort },
    ],
    [t.intentBuyShort, t.intentRentShort],
  )

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (
      !form.validate({
        firstName,
        lastName,
        email,
        password,
        intent,
        agree,
        newsletter,
      })
    ) {
      return
    }

    setSubmitting(true)
    try {
      const result = await registerCustomer({
        email,
        password,
        firstName,
        lastName,
        intent,
        newsletter,
      })
      if (!result.ok) {
        setFormError(
          t.errors[result.error === 'exists' ? 'exists' : result.error === 'validation' ? 'validation' : 'unknown'],
        )
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setFormError(t.errors.unknown)
    } finally {
      setSubmitting(false)
    }
  }

  const intentToggle = (
    <div className="flex flex-col gap-2">
      <p className="m-0 hidden text-[11px] font-bold uppercase tracking-wide text-muted min-[901px]:block">
        {t.intentLabel}
      </p>
      <div
        role="tablist"
        aria-label={t.intentLabel}
        className="flex w-full gap-0.5 rounded-md border border-line bg-surface-soft p-[3px] min-[901px]:gap-1 min-[901px]:rounded-lg min-[901px]:p-1"
      >
        {intentOptions.map((option) => {
          const active = intent === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setIntent(option.id)}
              className={cn(
                'flex-1 rounded-md border-0 px-3 py-2.5 text-center text-xs leading-none transition-colors',
                'min-[901px]:rounded-lg min-[901px]:px-4 min-[901px]:py-3 min-[901px]:text-[13px]',
                active
                  ? 'bg-forest font-bold text-surface'
                  : 'bg-transparent font-semibold text-muted',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )

  const nameFields = (
    <div className="flex flex-col gap-2.5 min-[901px]:flex-row min-[901px]:gap-4">
      <label className="flex min-w-0 flex-1 flex-col gap-1 min-[901px]:gap-1.5">
        <FieldLabel
          ok={firstOk && !firstNameMsg}
          className="text-[10px] min-[901px]:text-[11px]"
        >
          {t.firstName}
        </FieldLabel>
        <input
          className={fieldClassName(fieldClass, Boolean(firstNameMsg), firstOk && !firstNameMsg)}
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value)
            form.clearField('firstName')
            setFormError(null)
          }}
          autoComplete="given-name"
          aria-invalid={Boolean(firstNameMsg)}
        />
        <FieldError message={firstNameMsg} />
      </label>
      <label className="flex min-w-0 flex-1 flex-col gap-1 min-[901px]:gap-1.5">
        <FieldLabel
          ok={lastOk && !lastNameMsg}
          className="text-[10px] min-[901px]:text-[11px]"
        >
          {t.lastName}
        </FieldLabel>
        <input
          className={fieldClassName(fieldClass, Boolean(lastNameMsg), lastOk && !lastNameMsg)}
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value)
            form.clearField('lastName')
            setFormError(null)
          }}
          autoComplete="family-name"
          aria-invalid={Boolean(lastNameMsg)}
        />
        <FieldError message={lastNameMsg} />
      </label>
    </div>
  )

  const emailField = (
    <label className="flex flex-col gap-1 min-[901px]:gap-1.5">
      <FieldLabel
        ok={emailOk && !emailMsg}
        className="text-[10px] min-[901px]:text-[11px]"
      >
        {t.email}
      </FieldLabel>
      <input
        type="email"
        className={fieldClassName(
          cn(fieldClass, emailFocused && !emailMsg && !emailOk && 'border-2 border-forest py-[7px] min-[901px]:py-[11px]'),
          Boolean(emailMsg),
          emailOk && !emailMsg,
        )}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          form.clearField('email')
          setFormError(null)
        }}
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
        autoComplete="email"
        aria-invalid={Boolean(emailMsg)}
      />
      <FieldError message={emailMsg} />
      {!emailMsg ? (
        <span className="hidden text-xs text-muted min-[901px]:block">{t.emailHint}</span>
      ) : null}
    </label>
  )

  const passwordField = (
    <label className="flex flex-col gap-1 min-[901px]:gap-1.5">
      <FieldLabel
        ok={passwordOk && !passwordMsg}
        className="text-[10px] min-[901px]:text-[11px]"
      >
        {t.password}
      </FieldLabel>
      <span className="relative block">
        <input
          type={showPassword ? 'text' : 'password'}
          className={fieldClassName(cn(fieldClass, 'pr-10'), Boolean(passwordMsg), passwordOk && !passwordMsg)}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            form.clearField('password')
            setFormError(null)
          }}
          placeholder={t.passwordPlaceholder}
          autoComplete="new-password"
          aria-invalid={Boolean(passwordMsg)}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-muted shadow-none outline-none appearance-none hover:text-ink min-[901px]:right-3.5"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="size-4" strokeWidth={1.75} /> : <Eye className="size-4" strokeWidth={1.75} />}
        </button>
      </span>
      <FieldError message={passwordMsg} />
    </label>
  )

  const passwordReqs = (
    <div className="hidden flex-col gap-1.5 min-[901px]:flex">
      <p className="m-0 text-[11px] font-semibold text-muted">{t.passwordReqs}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs',
            minOk ? 'text-[#2a5c3f]' : 'text-muted',
          )}
        >
          {minOk ? (
            <Check className="size-2.5" strokeWidth={3} aria-hidden />
          ) : (
            <span className="size-2.5 rounded-full border border-current" aria-hidden />
          )}
          {t.reqMinLength}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs',
            symbolOk ? 'text-[#2a5c3f]' : 'text-muted',
          )}
        >
          {symbolOk ? (
            <Check className="size-2.5" strokeWidth={3} aria-hidden />
          ) : (
            <span className="size-2.5 rounded-full border border-current" aria-hidden />
          )}
          {t.reqSymbol}
        </span>
      </div>
    </div>
  )

  const agreeBox = (
    <button
      type="button"
      role="checkbox"
      aria-checked={agree}
      aria-invalid={Boolean(agreeMsg)}
      onClick={() => {
        setAgree((prev) => !prev)
        form.clearField('agree')
        setFormError(null)
      }}
      className={cn(
        'mt-0.5 flex shrink-0 items-center justify-center p-0',
        'size-3.5 rounded-[3px] min-[901px]:size-4 min-[901px]:rounded',
        agree
          ? 'border-0 bg-forest text-surface'
          : agreeMsg
            ? 'border border-[#c45c4a] bg-surface-soft'
            : 'border border-line bg-surface-soft',
      )}
    >
      {agree ? <Check className="size-2 min-[901px]:size-2.5" strokeWidth={3} aria-hidden /> : null}
    </button>
  )

  const termsRow = (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2 min-[901px]:gap-2.5">
        {agreeBox}
        <p className="m-0 text-[11px] leading-[1.4] text-muted min-[901px]:text-xs">
          {t.agreePrefix}
          <Link href="/terms" className="text-ink underline">
            {t.terms}
          </Link>
          {t.agreeMiddle}
          <Link href="/privacy" className="text-ink underline">
            {t.privacy}
          </Link>
          {t.agreeSuffix}
        </p>
      </div>
      <FieldError message={agreeMsg} className="pl-5 min-[901px]:pl-6" />
    </div>
  )

  const newsletterRow = (
    <div className="hidden items-start gap-2.5 min-[901px]:flex">
      <button
        type="button"
        role="checkbox"
        aria-checked={newsletter}
        onClick={() => setNewsletter((prev) => !prev)}
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded p-0',
          newsletter ? 'border-0 bg-forest text-surface' : 'border border-line bg-surface-soft',
        )}
      >
        {newsletter ? <Check className="size-2.5" strokeWidth={3} aria-hidden /> : null}
      </button>
      <p className="m-0 text-xs leading-[1.4] text-muted">{t.newsletter}</p>
    </div>
  )

  const submitBtn = (
    <button
      type="submit"
      disabled={submitting}
      className={cn(
        'w-full rounded-md bg-forest py-2.5 text-[13px] font-bold text-surface transition-opacity',
        'hover:opacity-[0.92] disabled:cursor-not-allowed disabled:opacity-45',
        'min-[901px]:py-3.5 min-[901px]:text-sm',
      )}
    >
      {t.submit}
    </button>
  )

  const googleBtn = (
    <button
      type="button"
      disabled
      title={t.googleSoon}
      className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 py-2.5 text-[13px] font-semibold text-ink opacity-55 min-[901px]:py-3"
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
  )

  const socialBlock = (
    <div className="flex w-full flex-col gap-2.5 min-[901px]:gap-4">
      <div className="flex items-center gap-3 min-[901px]:gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="shrink-0 text-[11px] text-muted min-[901px]:text-xs">{t.orRegister}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      {googleBtn}
    </div>
  )

  const signInFooter = (
    <p className="m-0 flex flex-wrap items-center justify-center gap-1.5 text-[13px]">
      <span className="text-muted">{t.hasAccount}</span>
      <Link href="/sign-in" className="font-bold text-forest underline">
        {t.signIn}
      </Link>
    </p>
  )

  const formErrorNode = formError ? (
    <p className="m-0 text-[12px] font-semibold text-[#8b3a2f] motion-safe:animate-[field-error-in_200ms_ease-out] min-[901px]:text-[13px]">
      {formError}
    </p>
  ) : null

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-r from-[#f7f3eb] to-[#efe7da]">
      <div className="flex min-h-0 flex-1 flex-col min-[901px]:hidden">
        <header className="relative flex h-20 shrink-0 items-center justify-between border-b border-line bg-surface px-[var(--page-pad)]">
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

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 px-5 pb-5 pt-4">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 font-display text-[28px] font-normal leading-[1.15] text-ink">
              {t.titleMobile}
            </h1>
            <p className="m-0 text-[13px] leading-[1.35] text-muted">{t.leadMobile}</p>
          </div>

          <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface p-3 shadow-[0_4px_6px_rgba(0,0,0,0.03)]">
            {intentToggle}
            {nameFields}
            {emailField}
            {passwordField}
            <div className="flex items-start gap-1.5">
              <Info className="mt-0.5 size-3 shrink-0 text-muted" aria-hidden />
              <p className="m-0 text-[10px] leading-normal text-muted">{t.emailHintMobile}</p>
            </div>
            {termsRow}
            {formErrorNode}
            {submitBtn}
          </div>

          {socialBlock}
          <div>{signInFooter}</div>
        </form>
      </div>

      <div className="hidden min-h-dvh min-[901px]:flex">
        <div className="relative flex w-[640px] shrink-0 flex-col justify-between border-r border-line bg-surface p-16">
          <Link
            href="/"
            className="group absolute left-5 top-5 z-[1] inline-flex items-center gap-1.5 font-display text-lg font-normal leading-none text-ink no-underline transition-opacity duration-200 hover:opacity-70"
          >
            <ArrowLeft
              className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5"
              strokeWidth={1.5}
              aria-hidden
            />
            {t.cancel}
          </Link>
          <div className="flex justify-center">
            <Link href="/" className="inline-flex items-center" aria-label={messages.common.brand}>
              <NestaLogo size={120} />
            </Link>
          </div>

          <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-5">
            <div className="flex flex-col gap-3">
              <h1 className="m-0 font-display text-[40px] font-normal leading-[1.15] text-ink">
                {t.titleDesktop}
              </h1>
              <p className="m-0 text-[15px] leading-normal text-muted">{t.leadDesktop}</p>
            </div>

            {intentToggle}

            <div className="flex flex-col gap-4">
              {nameFields}
              {emailField}
              {passwordField}
              {passwordReqs}
            </div>

            <div className="flex flex-col gap-3">
              {termsRow}
              {newsletterRow}
            </div>

            <div className="flex flex-col gap-4">
              {formErrorNode}
              {submitBtn}
              {socialBlock}
            </div>
          </form>

          {signInFooter}
        </div>

        <aside className="relative flex min-w-0 flex-1 flex-col justify-between p-20">
          <Image
            src="/images/register-cover.jpg"
            alt=""
            fill
            priority
            unoptimized
            className="object-cover"
            sizes="(max-width: 900px) 0px, 56vw"
          />
          <div className="absolute inset-0 bg-[rgba(22,51,36,0.45)]" aria-hidden />

          <div className="relative z-[1] flex-1" aria-hidden />

          <div className="relative z-[1] flex max-w-[520px] flex-col gap-6">
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-accent">
              {t.coverEyebrow}
            </p>
            <p className="m-0 font-display text-[48px] font-normal leading-[1.15] text-surface">
              {t.coverQuote}
            </p>
            <p className="m-0 text-base leading-relaxed text-[#e7e1d7]">{t.coverLead}</p>
          </div>

          <div className="relative z-[1] mt-16 flex items-center gap-4">
            <span className="h-px w-8 bg-accent" aria-hidden />
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-accent">
              {t.coverCredit}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
