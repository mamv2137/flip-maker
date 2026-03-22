import es from './es'
import en from './en'
import type { Locale } from '../config'

export type Dictionary = typeof es

const dictionaries: Record<Locale, Dictionary> = { es, en }
export default dictionaries
