import type { CollectionConfig } from 'payload'

import { seoFields } from '../fields/seo'
import { slugField } from '../fields/slug'
import { loc } from '../i18n/label'
import { collectionPreview } from '../lib/preview'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: loc('Страница', 'Page'),
    plural: loc('Страницы', 'Pages'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    preview: collectionPreview('pages'),
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: loc('Заголовок', 'Title'),
    },
    slugField(),
    {
      name: 'hero',
      type: 'group',
      label: loc('Первый экран', 'Hero'),
      fields: [
        {
          name: 'headline',
          type: 'text',
          localized: true,
          label: loc('Заголовок', 'Headline'),
        },
        {
          name: 'lead',
          type: 'textarea',
          localized: true,
          label: loc('Подзаголовок', 'Lead'),
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          label: loc('Изображение', 'Hero image'),
        },
      ],
    },
    {
      name: 'featured',
      type: 'group',
      label: loc('Избранная подборка', 'Featured section'),
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          localized: true,
          label: loc('Надзаголовок', 'Eyebrow'),
        },
        {
          name: 'headline',
          type: 'text',
          localized: true,
          label: loc('Заголовок', 'Headline'),
        },
        {
          name: 'linkLabel',
          type: 'text',
          localized: true,
          label: loc('Текст ссылки', 'Link label'),
        },
        {
          name: 'linkHref',
          type: 'text',
          defaultValue: '/buy',
          label: loc('Ссылка', 'Link'),
        },
      ],
    },
    seoFields,
  ],
}
