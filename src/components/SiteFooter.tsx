import Link from 'next/link'

import type { FooterView, SiteSettingsView } from '@/cms/types'
import { NestaLogo } from '@/components/NestaLogo'

export function SiteFooter({ footer, settings }: { footer: FooterView; settings: SiteSettingsView }) {
  const contacts = settings.contacts || {
    title: '',
    address: '',
    email: '',
    phone: '',
    phoneHref: '',
  }
  const contactTitle = contacts.title || 'Contact'

  return (
    <footer className="mt-auto bg-footer px-0 pb-12 pt-20 text-footer-muted max-[700px]:pb-6 max-[700px]:pt-10">
      <div className="mx-auto mb-16 flex w-full max-w-page justify-between gap-12 px-[var(--page-pad)] max-[1100px]:flex-col max-[700px]:mb-6 max-[700px]:gap-6">
        <div className="flex max-w-80 shrink-0 flex-col items-center text-center max-[700px]:max-w-none max-[700px]:gap-6">
          <NestaLogo
            size={120}
            variant="onDark"
            className="mb-6 [&_img]:h-[120px] [&_img]:w-auto max-[700px]:mb-0 max-[700px]:[&_img]:h-24"
          />
          {footer.tagline ? (
            <p className="m-0 text-sm leading-normal max-[700px]:text-[13px]">{footer.tagline}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-20 max-[1100px]:flex-wrap max-[1100px]:gap-8 max-[700px]:flex-col max-[700px]:gap-6">
          {footer.columns.map((column, columnIndex) => (
            <div
              key={`col-${columnIndex}-${column.title || column.links[0]?.href || ''}`}
              className="flex flex-col gap-4 max-[700px]:hidden"
            >
              <p className="m-0 text-xs font-bold uppercase tracking-[0.06em] text-accent">{column.title}</p>
              {column.links.map((link, linkIndex) => (
                <Link
                  key={`link-${linkIndex}-${link.href}`}
                  href={link.href}
                  className="whitespace-pre-line text-sm leading-snug text-footer-muted hover:text-surface-muted"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          <div className="flex flex-col gap-4 max-[700px]:gap-2">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.06em] text-accent">{contactTitle}</p>
            {contacts.address ? (
              <p className="m-0 whitespace-pre-line text-sm leading-snug text-footer-muted">{contacts.address}</p>
            ) : null}
            {contacts.email ? (
              <a
                href={`mailto:${contacts.email}`}
                className="whitespace-pre-line text-sm leading-snug text-footer-muted hover:text-surface-muted"
              >
                {contacts.email}
              </a>
            ) : null}
            {contacts.phone ? (
              <a
                href={contacts.phoneHref || `tel:${contacts.phone.replace(/\s+/g, '')}`}
                className="whitespace-pre-line text-sm leading-snug text-footer-muted hover:text-surface-muted"
              >
                {contacts.phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-page items-center justify-between gap-6 border-t border-footer-line px-[var(--page-pad)] pt-6 text-[13px] text-footer-dim max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-3 max-[700px]:text-[11px]">
        <p className="m-0">{footer.copyright}</p>
        <div className="flex gap-6 max-[700px]:hidden">
          {footer.legal.map((link, index) => (
            <Link key={`legal-${index}-${link.href}`} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
