import type { CollectionConfig } from 'payload'

import { loc } from '../i18n/label'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: loc('Админ CMS', 'CMS admin'),
    plural: loc('Админы CMS', 'CMS admins'),
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'updatedAt'],
    description: loc(
      'Пользователи панели /admin. Клиенты сайта — в коллекции «Клиенты».',
      'Users of the /admin panel. Site customers live in the Customers collection.',
    ),
  },
  auth: true,
  fields: [],
}
