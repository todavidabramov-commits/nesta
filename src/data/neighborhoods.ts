import type { Locale } from '@/i18n/config'

export type NeighborhoodLifestyle = 'historic' | 'bohemian' | 'waterfront' | 'family' | 'creative'

export type NeighborhoodGuide = {
  slug: string
  name: Record<Locale, string>
  vibe: Record<Locale, string>
  summary: Record<Locale, string>
  coverUrl: string
  heroUrl: string
  avgBuy: string
  avgRent: string
  activeCount: number
  lifestyle: NeighborhoodLifestyle[]
  headline: Record<Locale, string>
  body: Record<Locale, string>
  stats: Array<{
    label: Record<Locale, string>
    value: Record<Locale, string>
  }>
  transit: Array<{
    label: Record<Locale, string>
    icon: 'transit' | 'bike'
  }>
  sections: Array<{
    title: Record<Locale, string>
    body: Record<Locale, string>
  }>
}

export const neighborhoodGuides: NeighborhoodGuide[] = [
  {
    slug: 'jordaan',
    name: { en: 'Jordaan', ru: 'Йордан' },
    vibe: { en: 'Bohemian Luxury', ru: 'Богемный люкс' },
    summary: {
      en: 'Narrow streets, artisanal boutiques, secret courtyards and quintessential canal houses.',
      ru: 'Узкие улочки, ремесленные бутики, скрытые дворики и классические дома у каналов.',
    },
    coverUrl: '/images/neighborhood-jordaan.jpg',
    heroUrl: '/images/neighborhood-jordaan.jpg',
    avgBuy: '€12,100/m²',
    avgRent: '€2,450/mo',
    activeCount: 0,
    lifestyle: ['bohemian', 'historic'],
    headline: {
      en: 'History meets modern vitality',
      ru: 'История встречает современную жизнь',
    },
    body: {
      en: "Amsterdam's Jordaan blends artisan courtyards with coveted canal architecture. Living here means boutique streets, quiet residential pockets, and immediate access to the western canal belt.",
      ru: 'Йордан сочетает ремесленные дворики с востребованной архитектурой у каналов. Здесь — бутиковые улицы, тихие жилые карманы и быстрый доступ к западному поясу каналов.',
    },
    stats: [
      {
        label: { en: 'Avg. Price per m²', ru: 'Средняя цена за м²' },
        value: { en: '€12,100', ru: '€12,100' },
      },
      {
        label: { en: 'Premium Apartments', ru: 'Премиальные квартиры' },
        value: { en: '18 active', ru: '18 активных' },
      },
      {
        label: { en: 'Parks & Green spaces', ru: 'Парки и зелень' },
        value: { en: 'Westerpark nearby', ru: 'Рядом Westerpark' },
      },
    ],
    transit: [
      {
        label: { en: 'Centraal Station — 10 min tram', ru: 'Centraal — 10 мин на трамвае' },
        icon: 'transit',
      },
      {
        label: { en: 'Excellent bicycle pathways', ru: 'Отличная велосеть' },
        icon: 'bike',
      },
    ],
    sections: [
      {
        title: { en: 'Transportation & Commute', ru: 'Транспорт и доступность' },
        body: {
          en: 'Trams along Rozengracht and Marnixstraat connect quickly to Centraal, Leidseplein, and the western districts.',
          ru: 'Трамваи по Rozengracht и Marnixstraat быстро связывают район с Centraal, Leidseplein и западными кварталами.',
        },
      },
      {
        title: { en: 'Renowned Schools & Academies', ru: 'Школы и академии' },
        body: {
          en: 'Primary schools and creative academies sit within short walks of quiet residential courtyards.',
          ru: 'Школы и творческие академии — в пешей доступности от тихих жилых дворов.',
        },
      },
      {
        title: { en: 'Michelin Gastronomy & Cafes', ru: 'Гастрономия и кафе' },
        body: {
          en: 'From Noordermarkt weekends to intimate wine bars tucked behind canal façades.',
          ru: 'От уикендов на Noordermarkt до камерных винных баров за фасадами у каналов.',
        },
      },
      {
        title: { en: 'Parks & Secret Gardens', ru: 'Парки и сады' },
        body: {
          en: 'Hidden hofjes and Westerpark give Jordaan a rare balance of density and green calm.',
          ru: 'Скрытые hofjes и Westerpark дают Йордану редкий баланс плотности и зелёного спокойствия.',
        },
      },
    ],
  },
  {
    slug: 'de-pijp',
    name: { en: 'De Pijp', ru: 'Де Пейп' },
    vibe: { en: 'Vibrant Culture', ru: 'Живая культура' },
    summary: {
      en: 'Bohemian energy meets world-class culinary hotspots and the legendary Albert Cuypmarkt.',
      ru: 'Богемная энергия, гастрономия мирового уровня и легендарный Albert Cuypmarkt.',
    },
    coverUrl: '/images/neighborhood-de-pijp.jpg',
    heroUrl: '/images/neighborhood-de-pijp.jpg',
    avgBuy: '€11,100/m²',
    avgRent: '€2,250/mo',
    activeCount: 0,
    lifestyle: ['bohemian', 'creative'],
    headline: {
      en: 'Market streets and modern lofts',
      ru: 'Рыночные улицы и современные лофты',
    },
    body: {
      en: 'De Pijp is Amsterdam’s culinary and cultural crossroads — dense, social, and full of renovated apartments above lively street-level commerce.',
      ru: 'Де Пейп — гастрономический и культурный перекрёсток Амстердама: плотный, социальный, с обновлёнными квартирами над оживлённой коммерцией.',
    },
    stats: [
      {
        label: { en: 'Avg. Price per m²', ru: 'Средняя цена за м²' },
        value: { en: '€11,100', ru: '€11,100' },
      },
      {
        label: { en: 'Premium Apartments', ru: 'Премиальные квартиры' },
        value: { en: '22 active', ru: '22 активных' },
      },
      {
        label: { en: 'Parks & Green spaces', ru: 'Парки и зелень' },
        value: { en: 'Sarphatipark', ru: 'Sarphatipark' },
      },
    ],
    transit: [
      {
        label: { en: 'North/South metro — 4 min', ru: 'Метро N/Z — 4 мин' },
        icon: 'transit',
      },
      {
        label: { en: 'Cycle lanes to Museumplein', ru: 'Велодорожки к Museumplein' },
        icon: 'bike',
      },
    ],
    sections: [
      {
        title: { en: 'Transportation & Commute', ru: 'Транспорт и доступность' },
        body: {
          en: 'De Pijp metro and Ferdinand Bolstraat trams make Zuidas and Centraal straightforward.',
          ru: 'Метро De Pijp и трамваи по Ferdinand Bolstraat удобно связывают район с Zuidas и Centraal.',
        },
      },
      {
        title: { en: 'Renowned Schools & Academies', ru: 'Школы и академии' },
        body: {
          en: 'International and Dutch primary options cluster around Sarphatipark and Ceintuurbaan.',
          ru: 'Международные и голландские школы сосредоточены у Sarphatipark и Ceintuurbaan.',
        },
      },
      {
        title: { en: 'Michelin Gastronomy & Cafes', ru: 'Гастрономия и кафе' },
        body: {
          en: 'Albert Cuypmarkt anchors a dense map of specialty coffee, wine bars, and chef-led kitchens.',
          ru: 'Albert Cuypmarkt — центр плотной карты specialty-кофе, винных баров и шеф-кухонь.',
        },
      },
      {
        title: { en: 'Parks & Secret Gardens', ru: 'Парки и сады' },
        body: {
          en: 'Sarphatipark is the neighborhood living room — green, social, and steps from premium homes.',
          ru: 'Sarphatipark — гостиная района: зелёная, социальная и в шаге от премиальных домов.',
        },
      },
    ],
  },
  {
    slug: 'oud-west',
    name: { en: 'Oud-West', ru: 'Ауд-Вест' },
    vibe: { en: 'Trendy Residential', ru: 'Трендовый жилой' },
    summary: {
      en: 'Family-friendly green avenues, elegant post-war architectures, and high-concept food halls.',
      ru: 'Семейные зелёные аллеи, элегантная послевоенная архитектура и концептуальные фуд-холлы.',
    },
    coverUrl: '/images/neighborhood-oud-west.jpg',
    heroUrl: '/images/neighborhood-oud-west.jpg',
    avgBuy: '€9,600/m²',
    avgRent: '€2,200/mo',
    activeCount: 0,
    lifestyle: ['family', 'creative'],
    headline: {
      en: 'Green avenues, elevated living',
      ru: 'Зелёные аллеи и спокойный премиум',
    },
    body: {
      en: 'Oud-West balances family streets with Foodhallen energy — roomy apartments, parks nearby, and a polished residential rhythm.',
      ru: 'Ауд-Вест сочетает семейные улицы с энергией Foodhallen — просторные квартиры, парки рядом и спокойный жилой ритм.',
    },
    stats: [
      {
        label: { en: 'Avg. Price per m²', ru: 'Средняя цена за м²' },
        value: { en: '€9,600', ru: '€9,600' },
      },
      {
        label: { en: 'Premium Apartments', ru: 'Премиальные квартиры' },
        value: { en: '14 active', ru: '14 активных' },
      },
      {
        label: { en: 'Parks & Green spaces', ru: 'Парки и зелень' },
        value: { en: 'Vondelpark edge', ru: 'У края Vondelpark' },
      },
    ],
    transit: [
      {
        label: { en: 'Overtoom tram corridor', ru: 'Трамвайный коридор Overtoom' },
        icon: 'transit',
      },
      {
        label: { en: 'Direct cycle to Vondelpark', ru: 'Прямой велопуть к Vondelpark' },
        icon: 'bike',
      },
    ],
    sections: [
      {
        title: { en: 'Transportation & Commute', ru: 'Транспорт и доступность' },
        body: {
          en: 'Overtoom and Kinkerstraat corridors link Leidseplein, museum district, and western neighborhoods.',
          ru: 'Коридоры Overtoom и Kinkerstraat связывают Leidseplein, музейный квартал и западные районы.',
        },
      },
      {
        title: { en: 'Renowned Schools & Academies', ru: 'Школы и академии' },
        body: {
          en: 'Strong primary options and after-school culture make Oud-West a family favorite.',
          ru: 'Сильные школы и кружки делают Ауд-Вест любимым семейным районом.',
        },
      },
      {
        title: { en: 'Michelin Gastronomy & Cafes', ru: 'Гастрономия и кафе' },
        body: {
          en: 'De Hallen and surrounding streets deliver concept dining without downtown intensity.',
          ru: 'De Hallen и окрестные улицы дают концептуальную кухню без центральной суеты.',
        },
      },
      {
        title: { en: 'Parks & Secret Gardens', ru: 'Парки и сады' },
        body: {
          en: 'Vondelpark is effectively the backyard — morning runs, weekend picnics, evening strolls.',
          ru: 'Vondelpark как задний двор — утренние пробежки, пикники и вечерние прогулки.',
        },
      },
    ],
  },
  {
    slug: 'grachtengordel',
    name: { en: 'Grachtengordel', ru: 'Граченгордел' },
    vibe: { en: 'Historic Core', ru: 'Историческое ядро' },
    summary: {
      en: 'Monumental canal palaces from the Golden Age curve around historic bridges and prestige addresses.',
      ru: 'Монументальные дворцы у каналов Золотого века, мосты и престижные адреса.',
    },
    coverUrl: '/images/neighborhood-grachtengordel.jpg',
    heroUrl: '/images/neighborhood-grachtengordel.jpg',
    avgBuy: '€13,100/m²',
    avgRent: '€2,950/mo',
    activeCount: 0,
    lifestyle: ['historic'],
    headline: {
      en: 'Canal palaces and prestige addresses',
      ru: 'Дворцы у каналов и престижные адреса',
    },
    body: {
      en: "Amsterdam's Central District contains some of the world's most impressive residential canal architecture. The historical Grachtengordel belt curves gracefully around the core, preserving timber-framed houses dating back to the Dutch Golden Age.",
      ru: 'Центральный пояс каналов хранит одну из самых впечатляющих жилых архитектур мира. Исторический Граченгордел плавно огибает ядро города, сохраняя дома со времён Золотого века.',
    },
    stats: [
      {
        label: { en: 'Avg. Price per m²', ru: 'Средняя цена за м²' },
        value: { en: '€13,100', ru: '€13,100' },
      },
      {
        label: { en: 'Premium Apartments', ru: 'Премиальные квартиры' },
        value: { en: '9 active', ru: '9 активных' },
      },
      {
        label: { en: 'Parks & Green spaces', ru: 'Парки и зелень' },
        value: { en: 'Canal courtyards', ru: 'Дворы у каналов' },
      },
    ],
    transit: [
      {
        label: { en: 'Centraal Station — 5 min metro', ru: 'Centraal — 5 мин на метро' },
        icon: 'transit',
      },
      {
        label: { en: 'Excellent bicycle pathways', ru: 'Отличная велосеть' },
        icon: 'bike',
      },
    ],
    sections: [
      {
        title: { en: 'Transportation & Commute', ru: 'Транспорт и доступность' },
        body: {
          en: 'Metros run frequently through Centraal and Rokin, linking Oud-West, Zuid, and Schiphol within 15 minutes.',
          ru: 'Метро через Centraal и Rokin связывает Ауд-Вест, Зёйд и Схипхол примерно за 15 минут.',
        },
      },
      {
        title: { en: 'Renowned Schools & Academies', ru: 'Школы и академии' },
        body: {
          en: 'Includes primary bilingual montessoris and historical grammar institutes along quiet secondary streets.',
          ru: 'Двуязычные монтессори и исторические гимназии на тихих боковых улицах.',
        },
      },
      {
        title: { en: 'Michelin Gastronomy & Cafes', ru: 'Гастрономия и кафе' },
        body: {
          en: 'From hidden gourmet basements on Herengracht to artisanal third-wave coffee in the Nine Streets.',
          ru: 'От скрытых гастрономических подвалов на Herengracht до specialty-кофе в Девяти улицах.',
        },
      },
      {
        title: { en: 'Parks & Secret Gardens', ru: 'Парки и сады' },
        body: {
          en: "Beautiful private inner courtyards ('binnentuinen') and canal sidewalks as neighborhood gathering places.",
          ru: 'Частные внутренние дворы (binnentuinen) и набережные как места встреч района.',
        },
      },
    ],
  },
  {
    slug: 'centrum',
    name: { en: 'Centrum', ru: 'Центрум' },
    vibe: { en: 'Old World Charm', ru: 'Старосветский шарм' },
    summary: {
      en: "Living inside history. Bustling walkways, old brick docks, and the city's ancient architectural core.",
      ru: 'Жизнь внутри истории: оживлённые улицы, старые причалы и архитектурное ядро города.',
    },
    coverUrl: '/images/neighborhood-centrum.jpg',
    heroUrl: '/images/neighborhood-centrum.jpg',
    avgBuy: '€9,600/m²',
    avgRent: '€2,350/mo',
    activeCount: 0,
    lifestyle: ['historic'],
    headline: {
      en: 'The city’s living museum',
      ru: 'Живой музей города',
    },
    body: {
      en: 'Centrum places you at Amsterdam’s historic heart — walkable culture, iconic waterways, and residences layered into centuries of architecture.',
      ru: 'Центрум — историческое сердце Амстердама: пешеходная культура, культовые водные пути и жильё внутри многовековой архитектуры.',
    },
    stats: [
      {
        label: { en: 'Avg. Price per m²', ru: 'Средняя цена за м²' },
        value: { en: '€9,600', ru: '€9,600' },
      },
      {
        label: { en: 'Premium Apartments', ru: 'Премиальные квартиры' },
        value: { en: '11 active', ru: '11 активных' },
      },
      {
        label: { en: 'Parks & Green spaces', ru: 'Парки и зелень' },
        value: { en: 'Canal green pockets', ru: 'Зелёные карманы у каналов' },
      },
    ],
    transit: [
      {
        label: { en: 'Centraal at the doorstep', ru: 'Centraal у порога' },
        icon: 'transit',
      },
      {
        label: { en: 'Walkable to every district', ru: 'Пешком до всех районов' },
        icon: 'bike',
      },
    ],
    sections: [
      {
        title: { en: 'Transportation & Commute', ru: 'Транспорт и доступность' },
        body: {
          en: 'Trams, metro, ferries, and Centraal converge here — unmatched connectivity for urban residents.',
          ru: 'Трамваи, метро, паромы и Centraal сходятся здесь — максимальная связность для городской жизни.',
        },
      },
      {
        title: { en: 'Renowned Schools & Academies', ru: 'Школы и академии' },
        body: {
          en: 'Historic institutes and international programs sit within the old city ring.',
          ru: 'Исторические институты и международные программы внутри старого кольца города.',
        },
      },
      {
        title: { en: 'Michelin Gastronomy & Cafes', ru: 'Гастрономия и кафе' },
        body: {
          en: 'From Damrak energy to quiet courtyard dining rooms behind monumental façades.',
          ru: 'От энергии Damrak до тихих двориковых ресторанов за монументальными фасадами.',
        },
      },
      {
        title: { en: 'Parks & Secret Gardens', ru: 'Парки и сады' },
        body: {
          en: 'Pocket parks and canal edges create green moments inside dense historic fabric.',
          ru: 'Карманные парки и набережные дают зелёные паузы в плотной исторической ткани.',
        },
      },
    ],
  },
  {
    slug: 'oud-zuid',
    name: { en: 'Amsterdam-Zuid', ru: 'Амстердам-Зёйд' },
    vibe: { en: 'Prestigious Estates', ru: 'Престижные резиденции' },
    summary: {
      en: 'Stately 19th-century mansions, elite private academies, and the immediate shade of Vondelpark.',
      ru: 'Величавые особняки XIX века, элитные академии и тень Vondelpark.',
    },
    coverUrl: '/images/neighborhood-zuid.jpg',
    heroUrl: '/images/neighborhood-zuid.jpg',
    avgBuy: '€9,700/m²',
    avgRent: '€2,800/mo',
    activeCount: 0,
    lifestyle: ['family', 'historic'],
    headline: {
      en: 'Museum district grandeur',
      ru: 'Величие музейного квартала',
    },
    body: {
      en: 'Amsterdam-Zuid pairs museum-district prestige with family-scale apartments and villa streets in the shade of Vondelpark.',
      ru: 'Амстердам-Зёйд сочетает престиж музейного квартала с семейными квартирами и вилловыми улицами у Vondelpark.',
    },
    stats: [
      {
        label: { en: 'Avg. Price per m²', ru: 'Средняя цена за м²' },
        value: { en: '€9,700', ru: '€9,700' },
      },
      {
        label: { en: 'Premium Apartments', ru: 'Премиальные квартиры' },
        value: { en: '16 active', ru: '16 активных' },
      },
      {
        label: { en: 'Parks & Green spaces', ru: 'Парки и зелень' },
        value: { en: 'Vondelpark & Beatrixpark', ru: 'Vondelpark и Beatrixpark' },
      },
    ],
    transit: [
      {
        label: { en: 'Zuidas & Schiphol link', ru: 'Связь с Zuidas и Схипхолом' },
        icon: 'transit',
      },
      {
        label: { en: 'Park-edge cycle routes', ru: 'Веломаршруты у парка' },
        icon: 'bike',
      },
    ],
    sections: [
      {
        title: { en: 'Transportation & Commute', ru: 'Транспорт и доступность' },
        body: {
          en: 'North/South metro and Zuidas rail make airport and business-district commutes effortless.',
          ru: 'Метро N/Z и железная дорога Zuidas упрощают путь в аэропорт и деловой район.',
        },
      },
      {
        title: { en: 'Renowned Schools & Academies', ru: 'Школы и академии' },
        body: {
          en: 'Elite academies and international schools define the residential brief for many families.',
          ru: 'Элитные академии и международные школы — ключевой аргумент для многих семей.',
        },
      },
      {
        title: { en: 'Michelin Gastronomy & Cafes', ru: 'Гастрономия и кафе' },
        body: {
          en: 'Museumplein and Apollobuurt host refined dining rooms and specialty cafés.',
          ru: 'Museumplein и Apollobuurt — изысканные рестораны и specialty-кафе.',
        },
      },
      {
        title: { en: 'Parks & Secret Gardens', ru: 'Парки и сады' },
        body: {
          en: 'Vondelpark is the defining amenity — expansive, curated, and walkable from premium homes.',
          ru: 'Vondelpark — главная привилегия района: просторный, ухоженный и пешком от премиальных домов.',
        },
      },
    ],
  },
  {
    slug: 'amsterdam-oost',
    name: { en: 'Amsterdam-Oost', ru: 'Амстердам-Ост' },
    vibe: { en: 'Creative & Green', ru: 'Креатив и зелень' },
    summary: {
      en: 'Wide waterfronts, beautiful neo-renaissance estates, diverse markets, and botanical gardens.',
      ru: 'Широкие набережные, неоренессансные особняки, рынки и ботанические сады.',
    },
    coverUrl: '/images/neighborhood-oost.jpg',
    heroUrl: '/images/neighborhood-oost.jpg',
    avgBuy: '€8,700/m²',
    avgRent: '€1,850/mo',
    activeCount: 0,
    lifestyle: ['creative', 'waterfront', 'family'],
    headline: {
      en: 'Waterfronts and botanical calm',
      ru: 'Набережные и ботаническое спокойствие',
    },
    body: {
      en: 'Amsterdam-Oost stretches from Indische Buurt energy to Oosterpark greenery — creative, diverse, and increasingly premium.',
      ru: 'Амстердам-Ост — от энергии Indische Buurt до зелени Oosterpark: креативный, разнообразный и всё более премиальный.',
    },
    stats: [
      {
        label: { en: 'Avg. Price per m²', ru: 'Средняя цена за м²' },
        value: { en: '€8,700', ru: '€8,700' },
      },
      {
        label: { en: 'Premium Apartments', ru: 'Премиальные квартиры' },
        value: { en: '25 active', ru: '25 активных' },
      },
      {
        label: { en: 'Parks & Green spaces', ru: 'Парки и зелень' },
        value: { en: 'Oosterpark & Flevopark', ru: 'Oosterpark и Flevopark' },
      },
    ],
    transit: [
      {
        label: { en: 'Tram & metro to Centraal', ru: 'Трамвай и метро к Centraal' },
        icon: 'transit',
      },
      {
        label: { en: 'Waterfront cycle paths', ru: 'Велодорожки у воды' },
        icon: 'bike',
      },
    ],
    sections: [
      {
        title: { en: 'Transportation & Commute', ru: 'Транспорт и доступность' },
        body: {
          en: 'Tram lines and Weesperplein metro keep the center close while preserving Eastern calm.',
          ru: 'Трамваи и метро Weesperplein держат центр близко, сохраняя спокойствие востока.',
        },
      },
      {
        title: { en: 'Renowned Schools & Academies', ru: 'Школы и академии' },
        body: {
          en: 'Diverse school options support international and local families across the eastern districts.',
          ru: 'Разнообразные школы для международных и местных семей по восточным кварталам.',
        },
      },
      {
        title: { en: 'Michelin Gastronomy & Cafes', ru: 'Гастрономия и кафе' },
        body: {
          en: 'Dappermarkt and Javastraat fuel a culinary scene that feels local and contemporary.',
          ru: 'Dappermarkt и Javastraat питают локальную и современную гастросцену.',
        },
      },
      {
        title: { en: 'Parks & Secret Gardens', ru: 'Парки и сады' },
        body: {
          en: 'Oosterpark, Flevopark, and Hortus lanes give Oost an unusually green residential profile.',
          ru: 'Oosterpark, Flevopark и дорожки Hortus дают Осту необычно зелёный профиль.',
        },
      },
    ],
  },
  {
    slug: 'amsterdam-noord',
    name: { en: 'Amsterdam-Noord', ru: 'Амстердам-Норд' },
    vibe: { en: 'Modern Waterfront', ru: 'Современный ватерфронт' },
    summary: {
      en: 'Avant-garde architecture, expansive repurposed industrial yards, and breezy water vistas.',
      ru: 'Авангардная архитектура, бывшие промзоны и открытые виды на воду.',
    },
    coverUrl: '/images/neighborhood-noord.jpg',
    heroUrl: '/images/neighborhood-noord.jpg',
    avgBuy: '€6,900/m²',
    avgRent: '€1,700/mo',
    activeCount: 0,
    lifestyle: ['waterfront', 'creative'],
    headline: {
      en: 'Industrial yards, new horizons',
      ru: 'Промзоны и новые горизонты',
    },
    body: {
      en: 'Amsterdam-Noord is the city’s modern waterfront chapter — ferry-connected, architecturally bold, and rich in converted industrial estates.',
      ru: 'Амстердам-Норд — современная водная глава города: паромы, смелая архитектура и бывшие промзоны.',
    },
    stats: [
      {
        label: { en: 'Avg. Price per m²', ru: 'Средняя цена за м²' },
        value: { en: '€6,900', ru: '€6,900' },
      },
      {
        label: { en: 'Premium Apartments', ru: 'Премиальные квартиры' },
        value: { en: '31 active', ru: '31 активных' },
      },
      {
        label: { en: 'Parks & Green spaces', ru: 'Парки и зелень' },
        value: { en: 'Waterfront parks', ru: 'Парки у воды' },
      },
    ],
    transit: [
      {
        label: { en: 'Ferry to Centraal — 5 min', ru: 'Паром до Centraal — 5 мин' },
        icon: 'transit',
      },
      {
        label: { en: 'Northbank cycle routes', ru: 'Веломаршруты северного берега' },
        icon: 'bike',
      },
    ],
    sections: [
      {
        title: { en: 'Transportation & Commute', ru: 'Транспорт и доступность' },
        body: {
          en: 'Free ferries and the North/South metro make Noord feel close to the historic core.',
          ru: 'Бесплатные паромы и метро N/Z делают Норд близким к историческому ядру.',
        },
      },
      {
        title: { en: 'Renowned Schools & Academies', ru: 'Школы и академии' },
        body: {
          en: 'Growing school capacity follows the new residential developments along the IJ.',
          ru: 'Школьная инфраструктура растёт вместе с новыми жилыми проектами у IJ.',
        },
      },
      {
        title: { en: 'Michelin Gastronomy & Cafes', ru: 'Гастрономия и кафе' },
        body: {
          en: 'NDSM and Overhoeks host destination dining with industrial-chic interiors and water views.',
          ru: 'NDSM и Overhoeks — гастрономия с industrial-chic интерьерами и видами на воду.',
        },
      },
      {
        title: { en: 'Parks & Secret Gardens', ru: 'Парки и сады' },
        body: {
          en: 'Waterfront promenades and large parks replace dense canal courtyards with open sky.',
          ru: 'Набережные и крупные парки вместо плотных дворов у каналов — больше воздуха и горизонта.',
        },
      },
    ],
  },
]

export function localizeNeighborhoodGuide(guide: NeighborhoodGuide, locale: Locale) {
  return {
    id: guide.slug,
    slug: guide.slug,
    name: guide.name[locale],
    vibe: guide.vibe[locale],
    summary: guide.summary[locale],
    coverUrl: guide.coverUrl,
    coverAlt: guide.name[locale],
    heroUrl: guide.heroUrl,
    heroAlt: guide.name[locale],
    avgBuy: guide.avgBuy,
    avgRent: guide.avgRent,
    activeCount: guide.activeCount,
    lifestyle: guide.lifestyle,
    headline: guide.headline[locale],
    body: guide.body[locale],
    stats: guide.stats.map((item) => ({
      label: item.label[locale],
      value: item.value[locale],
    })),
    transit: guide.transit.map((item) => ({
      label: item.label[locale],
      icon: item.icon,
    })),
    sections: guide.sections.map((item) => ({
      title: item.title[locale],
      body: item.body[locale],
    })),
  }
}

export function getNeighborhoodGuide(slug: string) {
  return neighborhoodGuides.find((item) => item.slug === slug) || null
}
