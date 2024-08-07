// @ts-nocheck
import React, { useEffect } from 'react'
import ReactDOM, { createPortal } from 'react-dom'
import { unstable_useBlocker } from 'react-router-dom'
import i18n from 'i18next'

import { BeforeLeaveModal } from '@/components/BeforeLeaveModal'

export function usePrompt(when = true, callback: () => Promise<boolean>) {
  const blocker = unstable_useBlocker(when)

  useEffect(() => {
    if (when) window.onbeforeunload = () => '确定要离开吗？'

    return () => {
      window.onbeforeunload = null
    }
  }, [when])

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const anchor = document.createElement('div')

      const closePrompt = (state: boolean) => {
        if (anchor) ReactDOM.unmountComponentAtNode(anchor)
        if (!state) {
          document.body.removeChild(anchor)
          blocker.reset()
        } else {
          document.body.removeChild(anchor)
          blocker.proceed()
        }
      }

      document.body.appendChild(anchor)
      ReactDOM.render((
        <BeforeLeaveModal
          title={i18n.t('当前路网尚未保存！')}
          onLeave={() => {
            closePrompt(true)
          }}
          onStay={() => {
            closePrompt(false)
          }}
          onDoBeforeLeave={async () => {
            const res = await callback()
            closePrompt(res)
          }}
        />
      ), anchor)
    }
  }, [blocker])
}
