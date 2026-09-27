import type { GlobalConfig } from 'payload'

import { loc } from '../i18n/label'
import { globalPreview } from '../lib/preview'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: loc('Настройки сайта', 'Site settings'),
  admin: {
    preview: globalPreview('site-settings'),
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'companyName',
      type: 'text',
      required: true,
      defaultValue: 'NESTA',
      label: loc('Название компании', 'Company name'),
    },
    {
      type: 'group',
      name: 'contacts',
      label: loc('Контакты', 'Contacts'),
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          defaultValue: 'Контакты',
          label: loc('Заголовок блока', 'Section title'),
          admin: {
            description: 'Показывается в футере (колонка Contact). / Shown in the footer Contact column.',
          },
        },
        {
          name: 'address',
          type: 'textarea',
          localized: true,
          defaultValue: 'Keizersgracht 421, Amsterdam',
          label: loc('Адрес', 'Address'),
        },
        {
          name: 'email',
          type: 'email',
          defaultValue: 'info@nesta.nl',
          label: loc('Email', 'Email'),
        },
        {
          name: 'phone',
          type: 'text',
          defaultValue: '+31 (0) 20 748 190',
          label: loc('Телефон', 'Phone'),
        },
        {
          name: 'phoneHref',
          type: 'text',
          defaultValue: 'tel:+3120748190',
          label: loc('Ссылка телефона', 'Phone link'),
          admin: {
            description: 'Например tel:+3120748190',
          },
        },
      ],
    },
  ],
}
