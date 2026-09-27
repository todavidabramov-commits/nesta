import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { loc } from '../i18n/label'
import { collectionPreview } from '../lib/preview'

export const Neighborhoods: CollectionConfig = {
  slug: 'neighborhoods',
  labels: {
    singular: loc('Район', 'Neighborhood'),
    plural: loc('Районы', 'Neighborhoods'),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    preview: collectionPreview('neighborhoods'),
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
      label: loc('Название', 'Name'),
    },
    slugField('name'),
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
      label: loc('Порядок', 'Order'),
    },
  ],
}
