import React from 'react'
import ReactDOM from 'react-dom/client'

import '@/locales/i18n'

import App from './App'

import '@/styles/reset.less'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,
)
