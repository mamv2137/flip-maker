import type { Locale } from './config'
import dictionaries, { type Dictionary } from './dictionaries'

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export type { Dictionary }
