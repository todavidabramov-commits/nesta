import type { CollectionConfig } from 'payload'

import { seoFields } from '../fields/seo'
import { slugField } from '../fields/slug'
import { loc } from '../i18n/label'
import { collectionPreview } from '../lib/preview'

export const Properties: CollectionConfig = {
  slug: 'properties',
  labels: {
    singular: loc('Объект', 'Property'),
    plural: loc('Объекты', 'Properties'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'listingType',
      'price',
      'areaM2',
      'bedrooms',
      'energyLabel',
      'yearBuilt',
      'featured',
      'updatedAt',
    ],
    preview: collectionPreview('properties'),
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
      label: loc('Название', 'Title'),
    },
    slugField(),
    {
      name: 'neighborhood',
      type: 'relationship',
      relationTo: 'neighborhoods',
      required: true,
      label: loc('Район', 'Neighborhood'),
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'agents',
      label: loc('Агент', 'Agent'),
      admin: {
        description: loc(
          'Показывается в блоке Schedule a viewing на странице объекта.',
          'Shown in the Schedule a viewing card on the property page.',
        ),
      },
    },
    {
      name: 'listingType',
      type: 'select',
      required: true,
      defaultValue: 'buy',
      options: [
        { label: loc('Покупка', 'Buy'), value: 'buy' },
        { label: loc('Аренда', 'Rent'), value: 'rent' },
      ],
      label: loc('Тип сделки', 'Listing type'),
    },
    {
      name: 'propertyType',
      type: 'select',
      required: true,
      defaultValue: 'apartment',
      options: [
        { label: loc('Квартира', 'Apartment'), value: 'apartment' },
        { label: loc('Дом у канала', 'Canal house'), value: 'canal-house' },
        { label: loc('Пентхаус', 'Penthouse'), value: 'penthouse' },
        { label: loc('Новостройка', 'New development'), value: 'new-development' },
        { label: loc('Лофт', 'Loft'), value: 'loft' },
      ],
      label: loc('Тип объекта', 'Property type'),
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      label: loc('Цена (€, для аренды — в месяц)', 'Price (€, monthly for rent)'),
    },
    {
      name: 'address',
      type: 'text',
      label: loc('Адрес (для просмотра)', 'Address (for viewings)'),
      admin: {
        description: loc(
          'Показывается в подтверждении записи на просмотр.',
          'Shown on the book-viewing confirmation card.',
        ),
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'areaM2',
          type: 'number',
          required: true,
          min: 0,
          label: loc('Жилая площадь (м²)', 'Living area (m²)'),
          admin: { width: '50%' },
        },
        {
          name: 'bedrooms',
          type: 'number',
          required: true,
          min: 0,
          label: loc('Спальни', 'Bedrooms'),
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'energyLabel',
          type: 'select',
          required: true,
          defaultValue: 'A',
          options: [
            { label: 'A++++', value: 'A++++' },
            { label: 'A+++', value: 'A+++' },
            { label: 'A++', value: 'A++' },
            { label: 'A+', value: 'A+' },
            { label: 'A', value: 'A' },
            { label: 'B', value: 'B' },
            { label: 'C', value: 'C' },
            { label: 'D', value: 'D' },
            { label: 'E', value: 'E' },
            { label: 'F', value: 'F' },
            { label: 'G', value: 'G' },
          ],
          label: loc('Энергокласс', 'Energy label'),
          admin: { width: '33%' },
        },
        {
          name: 'yearBuilt',
          type: 'number',
          required: true,
          min: 1400,
          max: 2100,
          label: loc('Год постройки', 'Built year'),
          admin: { width: '33%' },
        },
        {
          name: 'yearRenovated',
          type: 'number',
          min: 1400,
          max: 2100,
          label: loc('Год ремонта', 'Renovated year'),
          admin: {
            width: '34%',
            description: loc(
              'Необязательно. Показывается рядом с годом постройки на карточке.',
              'Optional. Shown next to built year on the property card.',
            ),
          },
        },
      ],
    },
    {
      name: 'latitude',
      type: 'number',
      defaultValue: 52.3676,
      admin: { step: 0.000001 },
      label: loc('Широта', 'Latitude'),
    },
    {
      name: 'longitude',
      type: 'number',
      defaultValue: 4.9041,
      admin: { step: 0.000001 },
      label: loc('Долгота', 'Longitude'),
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: loc('Обложка', 'Cover'),
    },
    {
      name: 'gallery',
      type: 'array',
      label: loc('Галерея', 'Gallery'),
      labels: {
        singular: loc('Фото', 'Photo'),
        plural: loc('Фото', 'Photos'),
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: loc('Изображение', 'Image'),
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: loc('На главной', 'Featured on homepage'),
    },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      label: loc('Краткое описание', 'Summary'),
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: loc('Описание', 'Description'),
    },
    {
      name: 'highlights',
      type: 'array',
      localized: true,
      label: loc('Особенности', 'Highlights'),
      labels: {
        singular: loc('Пункт', 'Item'),
        plural: loc('Пункты', 'Items'),
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
          label: loc('Текст', 'Text'),
        },
      ],
    },
    {
      name: 'floorPlan',
      type: 'upload',
      relationTo: 'media',
      label: loc('План этажа', 'Floor plan'),
    },
    {
      name: 'locationAccess',
      type: 'array',
      localized: true,
      label: loc('Локация и доступ', 'Location & access'),
      labels: {
        singular: loc('Пункт', 'Item'),
        plural: loc('Пункты', 'Items'),
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: loc('Место', 'Place'),
        },
        {
          name: 'detail',
          type: 'text',
          required: true,
          label: loc('Детали', 'Detail'),
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
      label: loc('Порядок', 'Order'),
    },
    seoFields,
  ],
}
