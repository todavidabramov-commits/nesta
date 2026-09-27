import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { loc } from '../i18n/label'
import { collectionPreview } from '../lib/preview'

export const Agents: CollectionConfig = {
  slug: 'agents',
  labels: {
    singular: loc('Агент', 'Agent'),
    plural: loc('Агенты', 'Agents'),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'rating', 'updatedAt'],
    preview: collectionPreview('agents'),
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: loc('Имя', 'Name'),
    },
    slugField('name'),
    {
      name: 'role',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Senior Property Advisor',
      label: loc('Должность', 'Role'),
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
      label: loc('Описание', 'Bio'),
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: loc('Фото', 'Photo'),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
          defaultValue: 4.9,
          admin: { width: '33%', step: 0.1 },
          label: loc('Рейтинг', 'Rating'),
        },
        {
          name: 'homesSold',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: { width: '33%' },
          label: loc('Продано объектов', 'Homes sold'),
        },
        {
          name: 'experienceYears',
          type: 'number',
          min: 0,
          defaultValue: 8,
          admin: { width: '34%' },
          label: loc('Опыт (лет)', 'Experience (years)'),
        },
      ],
    },
    {
      name: 'experienceLabel',
      type: 'text',
      localized: true,
      label: loc('Подпись опыта', 'Experience label'),
      admin: {
        description: loc(
          'Например: 8+ Years in Amsterdam Premium Market',
          'e.g. 8+ Years in Amsterdam Premium Market',
        ),
      },
    },
    {
      name: 'email',
      type: 'email',
      label: loc('Email', 'Email'),
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
      label: loc('Порядок', 'Order'),
    },
  ],
}
