'use client'

import { Popup, useTranslation } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'
import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const COPY = {
  ru: {
    label: 'О языке контента',
    title: 'Язык контента',
    text: 'Переключатель задаёт языковую версию текущей записи. Язык интерфейса панели от него не зависит. Русская и английская версии заполняются и сохраняются независимо. Незаполненные поля выбранного языка на сайте берутся из русской версии.',
  },
  en: {
    label: 'About content language',
    title: 'Content language',
    text: 'This control selects the language version of the current record. It does not change the admin interface language. Russian and English versions are edited and saved independently. Unfilled fields in the selected language fall back to the Russian values on the website.',
  },
}

export function ContentLocaleHint() {
  const pathname = usePathname()
  const { i18n } = useTranslation()
  const [target, setTarget] = useState<Element | null>(null)
  const copy = i18n.language?.startsWith('ru') ? COPY.ru : COPY.en

  useLayoutEffect(() => {
    setTarget(document.querySelector('.app-header__localizer'))
  }, [pathname])

  if (!target) return <span className="content-locale-hint-slot" hidden />

  return createPortal(
    <div className="content-locale-hint">
      <Popup
        button={
          <span className="content-locale-hint__icon" aria-label={copy.label}>
            ?
          </span>
        }
        buttonType="custom"
        caret
        horizontalAlign="left"
        showOnHover
        size="large"
      >
        <div className="content-locale-hint__panel">
          <strong>{copy.title}</strong>
          <p>{copy.text}</p>
        </div>
      </Popup>
    </div>,
    target,
  )
}
