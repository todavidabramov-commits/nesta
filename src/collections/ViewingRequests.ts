import type { CollectionConfig } from 'payload'

import { loc } from '../i18n/label'

const isAdminUser = ({ req }: { req: { user?: { collection?: string } | null } }) =>
  Boolean(req.user && req.user.collection === 'users')

const isSelfCustomer = ({
  req,
}: {
  req: { user?: { id?: string | number; collection?: string } | null }
}) => {
  if (req.user?.collection === 'customers' && req.user.id != null) {
    return { customer: { equals: req.user.id } }
  }
  return false
}

export const ViewingRequests: CollectionConfig = {
  slug: 'viewing-requests',
  labels: {
    singular: loc('Заявка на просмотр', 'Viewing request'),
    plural: loc('Заявки на просмотр', 'Viewing requests'),
  },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'viewingDate', 'viewingTime', 'status', 'customer', 'createdAt'],
    description: loc(
      'Заявки с публичной страницы записи на просмотр.',
      'Requests from the public book-viewing page.',
    ),
    group: loc('Сайт', 'Site'),
  },
  access: {
    create: () => true,
    read: ({ req }) => isAdminUser({ req }) || isSelfCustomer({ req }),
    update: ({ req }) => isAdminUser({ req }) || isSelfCustomer({ req }),
    delete: isAdminUser,
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
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      label: loc('Клиент', 'Customer'),
      admin: {
        description: loc(
          'Аккаунт клиента, если заявка создана после входа.',
          'Customer account when the request was made while signed in.',
        ),
      },
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
