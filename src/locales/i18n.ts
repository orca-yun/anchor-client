import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import EnTrans from './languages/en/translation'
import ZhTrans from './languages/zh/translation'

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  // want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
  //   .use(XHRBackend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init(
    {
      resources: {
        en: {
          translation: EnTrans,
        },
        zh: {
          translation: ZhTrans,
        },
      },
      fallbackLng: 'zh',
      // debug: true,
      detection: {
        order: ['localStorage', 'navigator'],
        lookupQuerystring: 'lang',
        lookupCookie: 'i18next',
        lookupLocalStorage: 'i18nextLng',
        caches: ['localStorage', 'cookie'],
      },
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      react: {
        useSuspense: false,
      },
    },
    (err: any, t: any) => {
      /**
       * 配置其他需要国际化配置的插件语言环境
       */
      ;(window as any).__PMS_LANGIAGE__ = i18n.language
      document.title = t('虎鲸云-主播端')
    },
  )

i18n.on('languageChanged', (lng) => {
  ;(window as any).__PMS_LANGIAGE__ = lng
  document.title = i18n.t('虎鲸云-主播端')
})
