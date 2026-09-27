import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Customers } from './collections/Customers'
import { Media } from './collections/Media'
import { Properties } from './collections/Properties'
import { Neighborhoods } from './collections/Neighborhoods'
import { Pages } from './collections/Pages'
import { ViewingRequests } from './collections/ViewingRequests'
import { CustomerMessages } from './collections/CustomerMessages'
import { Agents } from './collections/Agents'
import { SiteSettings } from './globals/SiteSettings'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { previewPath } from './lib/preview'
import { adminTranslations } from './i18n/admin-translations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — NESTA',
    },
    components: {
      actions: [
        '/components/admin/AdminLanguageSwitcher#AdminLanguageSwitcher',
        '/components/admin/ContentLocaleHint#ContentLocaleHint',
      ],
      beforeLogin: ['/components/admin/AdminLanguageSwitcher#AdminLanguageSwitcher'],
    },
    livePreview: {
      collections: ['properties', 'neighborhoods', 'pages', 'agents'],
      globals: ['site-settings', 'header', 'footer'],
      url: ({ data, collectionConfig, globalConfig, locale }) => {
        const slug = collectionConfig?.slug || globalConfig?.slug
        if (!slug) return '/'
        const path = previewPath(slug, data) || '/'
        return locale?.code ? `${path}${path.includes('?') ? '&' : '?'}lng=${locale.code}` : path
      },
      breakpoints: [
        { name: 'mobile', label: 'Mobile', width: 375, height: 667 },
        { name: 'tablet', label: 'Tablet', width: 768, height: 1024 },
        { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
      ],
    },
  },
  i18n: {
    fallbackLanguage: 'ru',
    supportedLanguages: { ru, en },
    translations: adminTranslations,
  },
  localization: {
    defaultLocale: 'ru',
    fallback: true,
    locales: [
      { code: 'ru', label: 'Русский' },
      { code: 'en', label: 'English' },
    ],
  },
  collections: [
    Users,
    Customers,
    Media,
    Properties,
    Neighborhoods,
    Pages,
    ViewingRequests,
    CustomerMessages,
    Agents,
  ],
  globals: [SiteSettings, Header, Footer],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
    // Until formal migrations are added, keep schema in sync on boot/build.
    push: true,
  }),
  sharp,
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
            clientUploads: true,
          }),
        ]
      : []),
  ],
})
