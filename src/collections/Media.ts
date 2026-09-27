import type { CollectionConfig } from 'payload'

import { loc } from '../i18n/label'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: loc('Файл', 'File'),
    plural: loc('Медиатека', 'Media'),
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: loc('Подпись (alt)', 'Alt text'),
    },
  ],
  upload: {
    mimeTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
}
