import type { CollectionConfig } from 'payload'

import { loc } from '../i18n/label'

export const ViewingRequests: CollectionConfig = {
  slug: 'viewing-requests',
  labels: {
    singular: loc('Заявка на просмотр', 'Viewing request'),
    plural: loc('Заявки на просмотр', 'Viewing requests'),
  },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'viewingDate', 'viewingTime', 'status', 'createdAt'],
    description: loc(
      'Заявки с публичной страницы записи на просмотр.',
      'Requests from the public book-viewing page.',
    ),
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'summary',
      type: 'text',
      admin: { readOnly: true },
      label: loc('Кратко', 'Summary'),
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
      label: loc('Объект', 'Property'),
    },
    {
      name: 'viewingDate',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' },
      },
      label: loc('Дата просмотра', 'Viewing date'),
    },
    {
      name: 'viewingTime',
      type: 'text',
      required: true,
      label: loc('Время', 'Time'),
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'confirmed',
      options: [
        { label: loc('Новая', 'New'), value: 'new' },
        { label: loc('Подтверждена', 'Confirmed'), value: 'confirmed' },
        { label: loc('Отменена', 'Cancelled'), value: 'cancelled' },
      ],
      label: loc('Статус', 'Status'),
    },
    {
      name: 'locale',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
      label: loc('Язык UI', 'UI locale'),
    },
    {
      name: 'name',
      type: 'text',
      label: loc('Имя (если указано)', 'Name (optional)'),
    },
    {
      name: 'email',
      type: 'email',
      label: loc('Email (если указан)', 'Email (optional)'),
    },
    {
      name: 'notes',
      type: 'textarea',
      label: loc('Заметки', 'Notes'),
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data) return data
        let propertyTitle = ''
        if (data.property) {
          try {
            const id = typeof data.property === 'object' ? data.property.id : data.property
            const doc = await req.payload.findByID({
              collection: 'properties',
              id,
              depth: 0,
              locale: 'en',
            })
            propertyTitle = typeof doc.title === 'string' ? doc.title : ''
          } catch {
            propertyTitle = ''
          }
        }
        const date = data.viewingDate ? String(data.viewingDate).slice(0, 10) : ''
        const time = data.viewingTime || ''
        data.summary = [propertyTitle, date, time].filter(Boolean).join(' · ')
        return data
      },
    ],
  },
}
