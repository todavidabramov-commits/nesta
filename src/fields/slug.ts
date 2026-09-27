import type { Field } from 'payload'

import { loc } from '../i18n/label'

export const slugField = (fieldToUse = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  label: loc('Адрес в URL', 'URL slug'),
  admin: {
    position: 'sidebar',
    description: 'Формируется автоматически из названия, можно изменить вручную. / Generated from the title automatically; you can edit it manually.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (value) return slugify(String(value))
        if (data?.[fieldToUse]) return slugify(String(data[fieldToUse]))
        return value
      },
    ],
  },
})

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[а-яё]/gi, (ch) => {
      const map: Record<string, string> = {
        а: 'a',
        б: 'b',
        в: 'v',
        г: 'g',
        д: 'd',
        е: 'e',
        ё: 'e',
        ж: 'zh',
        з: 'z',
        и: 'i',
        й: 'y',
        к: 'k',
        л: 'l',
        м: 'm',
        н: 'n',
        о: 'o',
        п: 'p',
        р: 'r',
        с: 's',
        т: 't',
        у: 'u',
        ф: 'f',
        х: 'h',
        ц: 'ts',
        ч: 'ch',
        ш: 'sh',
        щ: 'sch',
        ъ: '',
        ы: 'y',
        ь: '',
        э: 'e',
        ю: 'yu',
        я: 'ya',
      }
      return map[ch.toLowerCase()] ?? ch
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
