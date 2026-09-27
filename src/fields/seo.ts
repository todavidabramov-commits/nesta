import type { Field } from 'payload'

import { loc } from '../i18n/label'

export const seoFields: Field = {
  name: 'meta',
  type: 'group',
  label: 'SEO',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: loc('Мета-заголовок', 'Meta title'),
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: loc('Мета-описание', 'Meta description'),
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: loc('Изображение для соцсетей', 'Social image'),
    },
  ],
}
