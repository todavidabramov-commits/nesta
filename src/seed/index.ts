import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.resolve(dirname, '../../public/images')

async function uploadImage(payload: Payload, filename: string, alt: string): Promise<number> {
  const filepath = path.join(imagesDir, filename)
  const buffer = readFileSync(filepath)
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs[0]) return existing.docs[0].id

  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data: buffer,
      mimetype: 'image/jpeg',
      name: filename,
      size: buffer.length,
    },
  })
  return doc.id
}

async function uploadSvg(payload: Payload, filename: string, alt: string): Promise<number> {
  const filepath = path.join(imagesDir, filename)
  const buffer = readFileSync(filepath)
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  const file = {
    data: buffer,
    mimetype: 'image/svg+xml' as const,
    name: filename,
    size: buffer.length,
  }
  if (existing.docs[0]) {
    await payload.update({
      collection: 'media',
      id: existing.docs[0].id,
      data: { alt },
      file,
    })
    return existing.docs[0].id
  }

  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file,
  })
  return doc.id
}

async function upsertNeighborhood(
  payload: Payload,
  data: { slug: string; nameRu: string; nameEn: string; order: number },
): Promise<number> {
  const found = await payload.find({
    collection: 'neighborhoods',
    where: { slug: { equals: data.slug } },
    limit: 1,
    locale: 'ru',
  })
  const base = {
    slug: data.slug,
    name: data.nameRu,
    order: data.order,
  }
  let id: number
  if (found.docs[0]) {
    id = found.docs[0].id
    await payload.update({
      collection: 'neighborhoods',
      id,
      locale: 'ru',
      data: base,
    })
  } else {
    const created = await payload.create({
      collection: 'neighborhoods',
      locale: 'ru',
      data: base,
    })
    id = created.id
  }
  await payload.update({
    collection: 'neighborhoods',
    id,
    locale: 'en',
    data: { name: data.nameEn },
  })
  return id
}

export async function seed(payload: Payload) {
  const heroId = await uploadImage(payload, 'hero.jpg', 'Amsterdam apartment interior')
  const covers = [
    await uploadImage(payload, 'property-1.jpg', 'Lijnbaansgracht Penthouse'),
    await uploadImage(payload, 'property-2.jpg', 'Willemsparkweg Family Residence'),
    await uploadImage(payload, 'property-3.jpg', 'Herengracht Canal Apartment'),
    await uploadImage(payload, 'property-4.jpg', 'Ruysdaelkade Studio Loft'),
  ]
  const floorPlanId = await uploadSvg(payload, 'floor-plan.svg', 'Floor plan')
  const agentPhotoId = await uploadImage(payload, 'agent-sophie.jpg', 'Sophie Martin')

  const neighborhoods = [
    { slug: 'jordaan', nameRu: 'Йордан', nameEn: 'Jordaan', order: 1 },
    { slug: 'oud-zuid', nameRu: 'Ауд-Зейд', nameEn: 'Oud-Zuid', order: 2 },
    { slug: 'grachtengordel', nameRu: 'Граchtenгордел', nameEn: 'Grachtengordel', order: 3 },
    { slug: 'de-pijp', nameRu: 'Де Пейп', nameEn: 'De Pijp', order: 4 },
  ]

  const neighborhoodIds: Record<string, number> = {}
  for (const item of neighborhoods) {
    const id = await upsertNeighborhood(payload, item)
    neighborhoodIds[item.slug] = typeof id === 'number' ? id : Number(id)
  }

  const agentFound = await payload.find({
    collection: 'agents',
    where: { slug: { equals: 'sophie-martin' } },
    limit: 1,
    locale: 'ru',
  })
  const agentRu = {
    name: 'Софи Мартин',
    slug: 'sophie-martin',
    role: 'Старший консультант по недвижимости',
    bio: 'Софи специализируется на исторических домах у каналов и люксовых квартирах в Ауд-Зейд и Йордане. Благодаря связям в кругах архитектурной охраны она находит off-market объекты для международных клиентов.',
    photo: agentPhotoId,
    rating: 4.9,
    homesSold: 128,
    experienceYears: 8,
    experienceLabel: '8+ лет на премиальном рынке Амстердама',
    email: 'sophie@nesta.nl',
    order: 1,
  }
  let agentId: number | string
  if (agentFound.docs[0]) {
    agentId = agentFound.docs[0].id
    await payload.update({ collection: 'agents', id: agentId, locale: 'ru', data: agentRu })
  } else {
    const created = await payload.create({ collection: 'agents', locale: 'ru', data: agentRu })
    agentId = created.id
  }
  await payload.update({
    collection: 'agents',
    id: agentId,
    locale: 'en',
    data: {
      name: 'Sophie Martin',
      role: 'Senior Property Advisor',
      bio: 'Sophie specializes in historic canal house acquisitions and luxury apartments in Oud-Zuid and Jordaan. With deep connections within the local architectural preservation circles, she secures off-market residential masterpieces for selective international clients.',
      experienceLabel: '8+ Years in Amsterdam Premium Market',
    },
  })

  const properties = [
    {
      slug: 'lijnbaansgracht-penthouse',
      address: 'Lijnbaansgracht 112, Amsterdam',
      titleRu: 'Пентхаус на Lijnbaansgracht',
      titleEn: 'Lijnbaansgracht Penthouse',
      neighborhood: neighborhoodIds.jordaan,
      listingType: 'buy' as const,
      price: 895000,
      areaM2: 112,
      bedrooms: 2,
      energyLabel: 'A++',
      yearBuilt: 1895,
      yearRenovated: 2022,
      latitude: 52.3748,
      longitude: 4.8812,
      propertyType: 'penthouse' as const,
      cover: covers[0],
      gallery: [covers[0], covers[1], covers[2]],
      featured: true,
      order: 1,
      summaryRu: 'Светлый пентхаус над каналами с видом с террасы.',
      summaryEn: 'A luminous penthouse above the canals with private terrace outlooks.',
      descriptionRu:
        'На тихом участке Lijnbaansgracht пентхаус сочетает исторические детали с современным открытым планом. Высокие потолки, много света и частная терраса на крыше — редкость для Йордана.',
      descriptionEn:
        'Set on a quiet stretch of Lijnbaansgracht, this penthouse pairs restored period details with a contemporary open plan. High ceilings, generous light, and a private roof terrace make it a rare find in the Jordaan.',
      highlightsRu: ['Терраса на крыше', 'Гостиная на юг', 'Лифт'],
      highlightsEn: ['Private roof terrace', 'South-facing living room', 'Lift access'],
      floorPlan: floorPlanId,
      locationAccessRu: [
        { label: 'Метро Rokin', detail: '8 мин пешком' },
        { label: 'Площадь Дам', detail: '5 мин на велосипеде' },
        { label: 'Nine Streets', detail: '2 мин пешком' },
      ],
      locationAccessEn: [
        { label: 'Rokin Metro Station', detail: '8 min walk' },
        { label: 'Dam Square', detail: '5 min bike' },
        { label: 'Nine Streets', detail: '2 min walk' },
      ],
    },
    {
      slug: 'willemsparkweg-family-residence',
      address: 'Willemsparkweg 48, Amsterdam',
      titleRu: 'Семейная резиденция на Willemsparkweg',
      titleEn: 'Willemsparkweg Family Residence',
      neighborhood: neighborhoodIds['oud-zuid'],
      listingType: 'buy' as const,
      price: 1450000,
      areaM2: 184,
      bedrooms: 4,
      energyLabel: 'A',
      yearBuilt: 1920,
      yearRenovated: 2019,
      latitude: 52.3562,
      longitude: 4.8765,
      propertyType: 'apartment' as const,
      cover: covers[1],
      gallery: [covers[1], covers[0], covers[3]],
      featured: true,
      order: 2,
      summaryRu: 'Просторный семейный дом у Вонделпарка.',
      summaryEn: 'Spacious family home near Vondelpark with refined interiors.',
      descriptionRu:
        'Элегантная резиденция на Willemsparkweg: четыре спальни, парадные гостиные и тихий двор. Для семьи, которой нужны масштаб и спокойствие в Ауд-Зейд.',
      descriptionEn:
        'A gracious residence on Willemsparkweg offering four bedrooms, formal reception rooms, and a quiet courtyard. Ideal for families seeking scale and calm in Oud-Zuid.',
      highlightsRu: ['Рядом с Вонделпарком', 'Четыре спальни', 'Внутренний двор'],
      highlightsEn: ['Near Vondelpark', 'Four bedrooms', 'Courtyard garden'],
    },
    {
      slug: 'herengracht-canal-apartment',
      address: 'Herengracht 320, Amsterdam',
      titleRu: 'Квартира на канале Herengracht',
      titleEn: 'Herengracht Canal Apartment',
      neighborhood: neighborhoodIds.grachtengordel,
      listingType: 'buy' as const,
      price: 1250000,
      areaM2: 130,
      bedrooms: 3,
      energyLabel: 'B',
      yearBuilt: 1880,
      yearRenovated: 2015,
      latitude: 52.3668,
      longitude: 4.8905,
      propertyType: 'apartment' as const,
      cover: covers[2],
      gallery: [covers[2], covers[0], covers[1]],
      featured: true,
      order: 3,
      summaryRu: 'Квартира у канала с классическими пропорциями.',
      summaryEn: 'Canal-front apartment with classic proportions and modern comfort.',
      descriptionRu:
        'На Herengracht трёхспальная квартира соединяет виды на канал с аккуратной современной отделкой. Оригинальные полы и высокие окна в каждой комнате.',
      descriptionEn:
        'On the Herengracht, this three-bedroom apartment balances monumental canal views with a carefully renovated interior. Original floors and tall windows frame every room.',
      highlightsRu: ['Вид на канал', 'Оригинальные полы', 'Три спальни'],
      highlightsEn: ['Canal views', 'Original floors', 'Three bedrooms'],
    },
    {
      slug: 'ruysdaelkade-studio-loft',
      address: 'Ruysdaelkade 64, Amsterdam',
      titleRu: 'Студия-лофт на Ruysdaelkade',
      titleEn: 'Ruysdaelkade Studio Loft',
      neighborhood: neighborhoodIds['de-pijp'],
      listingType: 'buy' as const,
      price: 525000,
      areaM2: 64,
      bedrooms: 1,
      energyLabel: 'A+',
      yearBuilt: 1905,
      yearRenovated: null,
      latitude: 52.3539,
      longitude: 4.8948,
      propertyType: 'loft' as const,
      cover: covers[3],
      gallery: [covers[3], covers[2], covers[1]],
      featured: true,
      order: 4,
      summaryRu: 'Светлый лофт с индустриальным характером в Де Пейп.',
      summaryEn: 'Bright loft studio with industrial character in De Pijp.',
      descriptionRu:
        'Компактный лофт на Ruysdaelkade с двойной высотой, открытой кухней и спальной антресолью. Идеален как городской pied-à-terre или live-work пространство.',
      descriptionEn:
        'A compact loft on Ruysdaelkade with double-height volume, open kitchen, and flexible sleeping mezzanine. Perfect as a city pied-à-terre or creative live-work space.',
      highlightsRu: ['Двойная высота', 'Открытая кухня', 'Антресоль'],
      highlightsEn: ['Double-height space', 'Open kitchen', 'Mezzanine sleeping'],
    },
    {
      slug: 'prinsengracht-canal-rental',
      address: 'Prinsengracht 840, Amsterdam',
      titleRu: 'Аренда у канала на Prinsengracht',
      titleEn: 'Prinsengracht Canal Rental',
      neighborhood: neighborhoodIds.grachtengordel,
      listingType: 'rent' as const,
      price: 3250,
      areaM2: 78,
      bedrooms: 2,
      energyLabel: 'A++',
      yearBuilt: 1890,
      yearRenovated: 2022,
      latitude: 52.3685,
      longitude: 4.8862,
      propertyType: 'apartment' as const,
      cover: covers[2],
      gallery: [covers[2], covers[0], covers[3]],
      featured: false,
      order: 5,
      summaryRu: 'Светлая двухспальная квартира у канала — €3 250 в месяц.',
      summaryEn: 'Bright two-bedroom canal apartment — €3,250 per month.',
      descriptionRu:
        'Меблированная квартира на Prinsengracht с видом на воду, открытой кухней и спокойным двором. Аренда включает отопление; депозит — два месяца.',
      descriptionEn:
        'Furnished apartment on Prinsengracht with water views, an open kitchen, and a quiet courtyard. Rent includes heating; deposit is two months.',
      highlightsRu: ['Вид на канал', 'Мебель', '€3 250/мес'],
      highlightsEn: ['Canal view', 'Furnished', '€3,250/mo'],
    },
    {
      slug: 'jordaan-townhouse-rental',
      address: 'Egelantiersgracht 22, Amsterdam',
      titleRu: 'Аренда таунхауса в Йордане',
      titleEn: 'Jordaan Townhouse Rental',
      neighborhood: neighborhoodIds.jordaan,
      listingType: 'rent' as const,
      price: 4250,
      areaM2: 118,
      bedrooms: 3,
      energyLabel: 'C',
      yearBuilt: 1910,
      yearRenovated: 2010,
      latitude: 52.3755,
      longitude: 4.884,
      propertyType: 'canal-house' as const,
      cover: covers[0],
      gallery: [covers[0], covers[1], covers[2]],
      featured: false,
      order: 6,
      summaryRu: 'Трёхспальный дом у канала — €4 250 в месяц.',
      summaryEn: 'Three-bedroom canal townhouse — €4,250 per month.',
      descriptionRu:
        'Исторический дом в Йордане с тремя спальнями, кабинетом и частной террасой. Идеален для семьи на длительный срок.',
      descriptionEn:
        'A historic Jordaan townhouse with three bedrooms, a study, and a private terrace. Ideal for longer family stays.',
      highlightsRu: ['Терраса', 'Три спальни', '€4 250/мес'],
      highlightsEn: ['Terrace', 'Three bedrooms', '€4,250/mo'],
    },
    {
      slug: 'de-pijp-loft-rental',
      address: 'Ferdinand Bolstraat 88, Amsterdam',
      titleRu: 'Аренда лофта в Де Пейп',
      titleEn: 'De Pijp Loft Rental',
      neighborhood: neighborhoodIds['de-pijp'],
      listingType: 'rent' as const,
      price: 2450,
      areaM2: 58,
      bedrooms: 1,
      energyLabel: 'A',
      yearBuilt: 2005,
      yearRenovated: null,
      latitude: 52.3541,
      longitude: 4.8972,
      propertyType: 'loft' as const,
      cover: covers[3],
      gallery: [covers[3], covers[2], covers[1]],
      featured: false,
      order: 7,
      summaryRu: 'Компактный лофт у Albert Cuyp — €2 450 в месяц.',
      summaryEn: 'Compact loft near Albert Cuyp — €2,450 per month.',
      descriptionRu:
        'Светлый лофт с антресолью и открытой кухней в сердце Де Пейп. Удобно для одного или пары.',
      descriptionEn:
        'A bright loft with mezzanine and open kitchen in the heart of De Pijp. Convenient for one person or a couple.',
      highlightsRu: ['Антресоль', 'Рядом с рынком', '€2 450/мес'],
      highlightsEn: ['Mezzanine', 'Near the market', '€2,450/mo'],
    },
  ]

  const defaultAccessRu = [
    { label: 'Метро Rokin', detail: '8 мин пешком' },
    { label: 'Площадь Дам', detail: '5 мин на велосипеде' },
    { label: 'Nine Streets', detail: '2 мин пешком' },
  ]
  const defaultAccessEn = [
    { label: 'Rokin Metro Station', detail: '8 min walk' },
    { label: 'Dam Square', detail: '5 min bike' },
    { label: 'Nine Streets', detail: '2 min walk' },
  ]

  for (const item of properties) {
    const found = await payload.find({
      collection: 'properties',
      where: { slug: { equals: item.slug } },
      limit: 1,
      locale: 'ru',
    })
    const ruData = {
      title: item.titleRu,
      slug: item.slug,
      neighborhood: item.neighborhood,
      listingType: item.listingType,
      propertyType: item.propertyType,
      price: item.price,
      address: item.address || undefined,
      areaM2: item.areaM2,
      bedrooms: item.bedrooms,
      energyLabel: item.energyLabel as
        | 'A++++'
        | 'A+++'
        | 'A++'
        | 'A+'
        | 'A'
        | 'B'
        | 'C'
        | 'D'
        | 'E'
        | 'F'
        | 'G',
      yearBuilt: item.yearBuilt,
      yearRenovated: item.yearRenovated ?? null,
      latitude: item.latitude,
      longitude: item.longitude,
      cover: item.cover,
      gallery: item.gallery.map((image) => ({ image })),
      featured: item.featured,
      summary: item.summaryRu,
      description: item.descriptionRu,
      highlights: item.highlightsRu.map((text) => ({ text })),
      floorPlan: 'floorPlan' in item && item.floorPlan ? item.floorPlan : floorPlanId,
      locationAccess:
        'locationAccessRu' in item && item.locationAccessRu
          ? item.locationAccessRu
          : defaultAccessRu,
      order: item.order,
      agent: agentId,
    }
    let id: string | number
    if (found.docs[0]) {
      id = found.docs[0].id
      await payload.update({ collection: 'properties', id, locale: 'ru', data: ruData })
    } else {
      const created = await payload.create({ collection: 'properties', locale: 'ru', data: ruData })
      id = created.id
    }
    await payload.update({
      collection: 'properties',
      id,
      locale: 'en',
      data: {
        title: item.titleEn,
        summary: item.summaryEn,
        description: item.descriptionEn,
        highlights: item.highlightsEn.map((text) => ({ text })),
        locationAccess:
          'locationAccessEn' in item && item.locationAccessEn
            ? item.locationAccessEn
            : defaultAccessEn,
      },
    })
  }

  const homeFound = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    locale: 'ru',
  })
  const homeRu = {
    title: 'Главная',
    slug: 'home',
    hero: {
      headline: 'Найдите место, куда хочется возвращаться.',
      lead: 'Кураторская жилая архитектура, квартиры с высокими потолками и исторические дома у каналов в самых желанных районах Амстердама.',
      heroImage: heroId,
    },
    featured: {
      eyebrow: 'Кураторская подборка',
      headline: 'Дома, которые стоит увидеть',
      linkLabel: 'Смотреть все на продажу',
      linkHref: '/buy',
    },
  }
  let homeId: string | number
  if (homeFound.docs[0]) {
    homeId = homeFound.docs[0].id
    await payload.update({ collection: 'pages', id: homeId, locale: 'ru', data: homeRu })
  } else {
    const created = await payload.create({ collection: 'pages', locale: 'ru', data: homeRu })
    homeId = created.id
  }
  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    data: {
      title: 'Home',
      hero: {
        headline: 'Find a place worth coming home to.',
        lead: "Curated residential architecture, high-ceilinged apartments, and historical canal houses in Amsterdam's most coveted neighborhoods.",
        heroImage: heroId,
      },
      featured: {
        eyebrow: 'Curated Collection',
        headline: 'Homes worth seeing',
        linkLabel: 'View all for sale',
        linkHref: '/buy',
      },
    },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'ru',
    data: {
      companyName: 'NESTA',
      contacts: {
        title: 'Контакты',
        address: 'Keizersgracht 421, Amsterdam',
        email: 'info@nesta.nl',
        phone: '+31 (0) 20 748 190',
        phoneHref: 'tel:+3120748190',
      },
    },
  })
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      contacts: {
        title: 'Contact',
        address: 'Keizersgracht 421, Amsterdam',
        email: 'info@nesta.nl',
        phone: '+31 (0) 20 748 190',
        phoneHref: 'tel:+3120748190',
      },
    },
  })

  await payload.updateGlobal({
    slug: 'header',
    locale: 'ru',
    data: {
      nav: [
        { label: 'Купить', href: '/buy' },
        { label: 'Аренда', href: '/rent' },
        { label: 'Новостройки', href: '/new-developments' },
        { label: 'Районы', href: '/neighborhoods' },
        { label: 'Избранное', href: '/favorites' },
      ],
      signInLabel: 'Войти',
      signInHref: '/sign-in',
      ctaLabel: 'Разместить объект',
      ctaHref: '/list-property',
    },
  })
  await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    data: {
      nav: [
        { label: 'Buy', href: '/buy' },
        { label: 'Rent', href: '/rent' },
        { label: 'New developments', href: '/new-developments' },
        { label: 'Neighborhoods', href: '/neighborhoods' },
        { label: 'Favorites', href: '/favorites' },
      ],
      signInLabel: 'Sign in',
      ctaLabel: 'List a property',
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    locale: 'ru',
    data: {
      tagline:
        'Ведущий консультант по жилой недвижимости Амстердама: архитектурное наследие и современный комфорт.',
      columns: [
        {
          title: 'Объекты',
          links: [
            { label: 'Дома у каналов', href: '/buy?type=canal-house' },
            { label: 'Пентхаусы', href: '/buy?type=penthouse' },
            { label: 'Новостройки', href: '/new-developments' },
          ],
        },
        {
          title: 'Районы',
          links: [
            { label: 'Йордан', href: '/neighborhoods/jordaan' },
            { label: 'Ауд-Зейд', href: '/neighborhoods/oud-zuid' },
            { label: 'Граchtenгордел', href: '/neighborhoods/grachtengordel' },
          ],
        },
      ],
      copyright: '© 2026 NESTA Real Estate. Все права защищены.',
      legal: [
        { label: 'Политика конфиденциальности', href: '/privacy' },
        { label: 'Условия использования', href: '/terms' },
      ],
    },
  })
  await payload.updateGlobal({
    slug: 'footer',
    locale: 'en',
    data: {
      tagline:
        "Amsterdam's premier residential real-estate advisory, uniting exceptional architectural heritage with sophisticated modern living.",
      columns: [
        {
          title: 'Properties',
          links: [
            { label: 'Canal Houses', href: '/buy?type=canal-house' },
            { label: 'Penthouses', href: '/buy?type=penthouse' },
            { label: 'New Developments', href: '/new-developments' },
          ],
        },
        {
          title: 'Neighborhoods',
          links: [
            { label: 'Jordaan', href: '/neighborhoods/jordaan' },
            { label: 'Oud-Zuid', href: '/neighborhoods/oud-zuid' },
            { label: 'Grachtengordel', href: '/neighborhoods/grachtengordel' },
          ],
        },
      ],
      copyright: '© 2026 NESTA Real Estate. All rights reserved.',
      legal: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Use', href: '/terms' },
      ],
    },
  })

  payload.logger.info('NESTA seed complete.')
}

export async function seedIfEmpty(payload: Payload) {
  const pages = await payload.find({ collection: 'pages', limit: 1 })
  if (pages.totalDocs > 0) {
    payload.logger.info('Content already present — skip seed (use --force to overwrite).')
    return
  }
  await seed(payload)
}
