import type { GlobalConfig } from 'payload'

import { loc } from '../i18n/label'
import { globalPreview } from '../lib/preview'

export const Header: GlobalConfig = {
  slug: 'header',
  label: loc('Шапка', 'Header'),
  admin: {
    preview: globalPreview('header'),
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'nav',
      type: 'array',
      label: loc('Навигация', 'Navigation'),
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: loc('Название', 'Label'),
        },
        {
          name: 'href',
          type: 'text',
          required: true,
          label: loc('Ссылка', 'Link'),
        },
      ],
    },
    {
      name: 'signInLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Войти / Регистрация',
      label: loc('Текст «Войти»', 'Sign in label'),
    },
    {
      name: 'signInHref',
      type: 'text',
      defaultValue: '/sign-in',
      label: loc('Ссылка «Войти»', 'Sign in link'),
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
      admin: { hidden: true },
      label: loc('Текст кнопки (не используется)', 'Button text (unused)'),
    },
    {
      name: 'ctaHref',
      type: 'text',
      admin: { hidden: true },
      label: loc('Ссылка кнопки (не используется)', 'Button link (unused)'),
    },
  ],
}
