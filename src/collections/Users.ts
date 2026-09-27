import type { CollectionConfig } from 'payload'

import { loc } from '../i18n/label'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: loc('Пользователь', 'User'),
    plural: loc('Пользователи', 'Users'),
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'updatedAt'],
  },
  auth: true,
  fields: [],
}
