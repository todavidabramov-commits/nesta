export function formatPropertyPrice(
  value: number,
  locale: string,
  listingType: 'buy' | 'rent' = 'buy',
) {
  const formatted = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)

  if (listingType === 'rent') {
    return locale === 'ru' ? `${formatted}/мес` : `${formatted}/mo`
  }
  return formatted
}

export function formatCompactPrice(
  value: number,
  locale: string,
  listingType: 'buy' | 'rent' = 'buy',
) {
  let compact: string
  if (listingType === 'rent') {
    compact = `€${Math.round(value).toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-NL')}`
  } else if (value >= 1_000_000) {
    const m = value / 1_000_000
    compact = `€${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  } else if (value >= 1000) {
    compact = `€${Math.round(value / 1000)}k`
  } else {
    compact = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (listingType === 'rent') {
    return locale === 'ru' ? `${compact}/мес` : `${compact}/mo`
  }
  return compact
}
