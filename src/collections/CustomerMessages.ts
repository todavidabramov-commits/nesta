import type { CollectionConfig, FieldAccess } from 'payload'

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

const adminOnlyUpdate: FieldAccess = ({ req }) => isAdminUser({ req })

export const CustomerMessages: CollectionConfig = {
  slug: 'customer-messages',
  labels: {
    singular: loc('Сообщение клиенту', 'Customer message'),
    plural: loc('Сообщения клиентам', 'Customer messages'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'customer', 'read', 'createdAt'],
    description: loc(
      'Сообщения отправляет только администратор. Клиент видит их в кабинете → Сообщения.',
      'Only admins can send messages. Customers see them in cabinet → Messages.',
    ),
    group: loc('Сайт', 'Site'),
  },
  access: {
    create: isAdminUser,
    read: ({ req }) => isAdminUser({ req }) || isSelfCustomer({ req }),
    update: ({ req }) => isAdminUser({ req }) || isSelfCustomer({ req }),
    delete: isAdminUser,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: loc('Тема', 'Subject'),
      access: { update: adminOnlyUpdate },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      label: loc('Текст', 'Body'),
      access: { update: adminOnlyUpdate },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
      label: loc('Клиент', 'Customer'),
      access: { update: adminOnlyUpdate },
      admin: {
        description: loc(
          'Кому придёт уведомление в кабинете.',
          'Who receives this in their cabinet inbox.',
        ),
      },
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: loc('Прочитано', 'Read'),
      admin: {
        description: loc(
          'Клиент отмечает прочтение в кабинете. Можно сбросить вручную.',
          'Customer marks as read in the cabinet. Admins can reset.',
        ),
        position: 'sidebar',
      },
    },
    {
      name: 'readAt',
      type: 'date',
      label: loc('Прочитано в', 'Read at'),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        condition: (_, siblingData) => Boolean(siblingData?.read),
      },
      access: {
        update: ({ req }) =>
          Boolean(req.user && (req.user.collection === 'users' || req.user.collection === 'customers')),
      },
    },
  ],
  timestamps: true,
}
