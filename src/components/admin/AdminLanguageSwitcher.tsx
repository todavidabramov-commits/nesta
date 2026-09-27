'use client'

import type { AcceptedLanguages } from '@payloadcms/translations'
import { Popup, PopupList, useTranslation } from '@payloadcms/ui'

const OPTIONS: { value: AcceptedLanguages; name: string; short: string }[] = [
  { value: 'ru', name: 'Русский', short: 'RU' },
  { value: 'en', name: 'English', short: 'EN' },
]

export function AdminLanguageSwitcher() {
  const { i18n, switchLanguage, t } = useTranslation()
  const current = OPTIONS.find((item) => item.value === i18n.language) || OPTIONS[0]

  return (
    <div className="admin-lang-switch">
      <Popup
        button={
          <span className="admin-lang-switch__trigger" aria-label={t('general:language')}>
            <GlobeIcon />
            <span className="admin-lang-switch__name">{current.name}</span>
            <span className="admin-lang-switch__code">{current.short}</span>
          </span>
        }
        caret
        horizontalAlign="right"
        render={({ close }) => (
          <PopupList.ButtonGroup>
            {OPTIONS.map((item) => (
              <PopupList.Button
                key={item.value}
                active={item.value === current.value}
                disabled={item.value === current.value}
                onClick={() => {
                  close()
                  if (item.value === current.value || !switchLanguage) return
                  void switchLanguage(item.value)
                }}
              >
                {item.name}
                {'\u00A0'}
                <span className="admin-lang-switch__option-code">({item.short})</span>
              </PopupList.Button>
            ))}
          </PopupList.ButtonGroup>
        )}
        size="large"
      />
    </div>
  )
}

function GlobeIcon() {
  return (
    <svg className="admin-lang-switch__globe" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 12h17M12 3c2.8 2.4 4.2 5.6 4.2 9s-1.4 6.6-4.2 9c-2.8-2.4-4.2-5.6-4.2-9S9.2 5.4 12 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}
