import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'

// English only: Telugu was removed at the owner's request (2026-09-18). Text stays in en.json, so
// another language can be added back later by adding a resource file and a switcher.
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

document.title = i18n.t('meta.title')

export default i18n
