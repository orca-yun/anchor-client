import React, { useEffect, useRef, useState } from 'react'

import { orcaTxLivePusher } from '@/utils/OrcaTxLivePusher'

import './index.less'

const ScreenShare: React.FC<{ show: boolean }> = ({ show }) => {
  const wrapperRef = useRef<any>()
  const [wrapperSize, setWrapperSize] = useState({
    width: '100%',
    height: '100%',
  })

  useEffect(() => {
    orcaTxLivePusher.registerRenderView('local_screen_capture_video')
    if (wrapperRef.current) {
      const { width, height } = wrapperRef.current.getBoundingClientRect()
      setWrapperSize({
        width,
        height,
      })
    }
  }, [])

  return (
    <div className="screen-capture-container" ref={wrapperRef} style={{ visibility: show ? 'unset' : 'hidden' }}>
      <div id="local_screen_capture_video" style={wrapperSize} />
    </div>
  )
}

export default ScreenShare
