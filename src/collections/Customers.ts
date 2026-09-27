import type { CollectionConfig } from 'payload'

import { loc } from '../i18n/label'

const isAdminUser = ({ req }: { req: { user?: { collection?: string } | null } }) =>
  Boolean(req.user && req.user.collection === 'users')

const isSelfCustomer = ({ req }: { req: { user?: { id?: string | number; collection?: string } | null } }) => {
  if (req.user?.collection === 'customers' && req.user.id != null) {
    return { id: { equals: req.user.id } }
  }
  return false
}

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: {
    singular: loc('Клиент', 'Customer'),
    plural: loc('Клиенты', 'Customers'),
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'intent', 'updatedAt'],
    description: loc(
      'Клиенты сайта (регистрация / вход). Не имеют доступа в админку CMS.',
      'Site customers (register / sign-in). No access to the CMS admin.',
    ),
    group: loc('Сайт', 'Site'),
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 14, // 14 days
    verify: false,
    maxLoginAttempts: 8,
    lockTime: 600 * 1000,
  },
  access: {
    admin: isAdminUser,
    create: () => true,
    read: ({ req }) => isAdminUser({ req }) || isSelfCustomer({ req }),
    update: ({ req }) => isAdminUser({ req }) || isSelfCustomer({ req }),
    delete: isAdminUser,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
      label: loc('Имя', 'First name'),
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      label: loc('Фамилия', 'Last name'),
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: loc('Фото', 'Photo'),
    },
    {
      name: 'intent',
      type: 'select',
      defaultValue: 'buy',
      options: [
        { label: loc('Купить', 'Buy'), value: 'buy' },
        { label: loc('Аренда', 'Rent'), value: 'rent' },
      ],
      label: loc('Интерес', 'Intent'),
    },
    {
      name: 'newsletter',
      type: 'checkbox',
      defaultValue: false,
      label: loc('Рассылка', 'Newsletter'),
    },
    {
      name: 'favorites',
      type: 'relationship',
      relationTo: 'properties',
      hasMany: true,
      label: loc('Избранное', 'Favorites'),
      admin: {
        description: loc(
          'Объекты, сохранённые клиентом на сайте.',
          'Properties saved by the customer on the site.',
        ),
      },
    },
    {
      name: 'savedSearches',
      type: 'array',
      label: loc('Сохранённые поиски', 'Saved searches'),
      labels: {
        singular: loc('Поиск', 'Search'),
        plural: loc('Поиски', 'Searches'),
      },
      admin: {
        description: loc(
          'Критерии умного подбора, сохранённые клиентом.',
          'Smart matching criteria saved by the customer.',
        ),
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: loc('Название', 'Title'),
        },
        {
          name: 'purpose',
          type: 'select',
          required: true,
          defaultValue: 'buy',
          options: [
            { label: loc('Купить', 'Buy'), value: 'buy' },
            { label: loc('Аренда', 'Rent'), value: 'rent' },
          ],
          label: loc('Цель', 'Purpose'),
        },
        {
          name: 'priorities',
          type: 'select',
          hasMany: true,
          options: [
            { label: loc('Пространство', 'Space'), value: 'space' },
            { label: loc('Тишина', 'Quiet'), value: 'quiet' },
            { label: loc('Транспорт', 'Transit'), value: 'transit' },
            { label: loc('Школы', 'Schools'), value: 'schools' },
            { label: loc('Центр', 'Center'), value: 'center' },
            { label: loc('Улица / двор', 'Outdoor'), value: 'outdoor' },
            { label: loc('Парковка', 'Parking'), value: 'parking' },
          ],
          label: loc('Приоритеты', 'Priorities'),
        },
        {
          name: 'budgetMin',
          type: 'number',
          required: true,
          label: loc('Бюджет от', 'Budget min'),
        },
        {
          name: 'budgetMax',
          type: 'number',
          required: true,
          label: loc('Бюджет до', 'Budget max'),
        },
        {
          name: 'bedrooms',
          type: 'number',
          required: true,
          min: 1,
          max: 4,
          label: loc('Спальни', 'Bedrooms'),
        },
      ],
    },
  ],
}
