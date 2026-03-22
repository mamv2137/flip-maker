import { cookies } from 'next/headers'
import { defaultLocale, LOCALE_COOKIE, type Locale, locales } from './config'

export async function getLocaleFromCookie(): Promise<Locale> {
  const cookieStore = await cookies()
  const val = cookieStore.get(LOCALE_COOKIE)?.value
  return locales.includes(val as Locale) ? (val as Locale) : defaultLocale
}

export function isValidLocale(lang: string): lang is Locale {
  return locales.includes(lang as Locale)
}
