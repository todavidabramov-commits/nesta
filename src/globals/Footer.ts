import type { GlobalConfig } from 'payload'

import { loc } from '../i18n/label'
import { globalPreview } from '../lib/preview'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: loc('Подвал', 'Footer'),
  admin: {
    preview: globalPreview('footer'),
    description:
      'Колонка Contact берётся из «Настройки сайта → Контакты», не дублируйте её здесь. / The Contact column comes from Site settings → Contacts — do not duplicate it here.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'tagline',
      type: 'textarea',
      localized: true,
      label: loc('Описание бренда', 'Brand tagline'),
    },
    {
      name: 'columns',
      type: 'array',
      label: loc('Колонки ссылок', 'Link columns'),
      admin: {
        description: 'Например Properties и Neighborhoods. Contact — из настроек сайта.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: loc('Заголовок колонки', 'Column title'),
        },
        {
          name: 'links',
          type: 'array',
          label: loc('Ссылки', 'Links'),
          fields: [
            { name: 'label', type: 'text', required: true, localized: true, label: loc('Название', 'Label') },
            { name: 'href', type: 'text', required: true, label: loc('Ссылка', 'Link') },
          ],
        },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      localized: true,
      label: loc('Копирайт', 'Copyright'),
    },
    {
      name: 'legal',
      type: 'array',
      label: loc('Юридические ссылки', 'Legal links'),
      fields: [
        { name: 'label', type: 'text', required: true, localized: true, label: loc('Название', 'Label') },
        { name: 'href', type: 'text', required: true, label: loc('Ссылка', 'Link') },
      ],
    },
  ],
}
