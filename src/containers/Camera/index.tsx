import React, { useEffect, useRef } from 'react'
import { Button } from 'antd'

import { orcaTxLivePusher } from '@/utils/OrcaTxLivePusher'

import './index.less'

const Camera: React.FC<{ useCamera: boolean }> = ({ useCamera }) => {
  const videoRef = useRef<any>()

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.setAttribute('playsinline', true)
      videoRef.current.setAttribute('x5-playsinline', true)
    }
  }, [])

  const play = async() => {
    if (!videoRef.current || !orcaTxLivePusher.cameraDeviceId) return
    const stream = orcaTxLivePusher.txLivePusher.getMediaStream(orcaTxLivePusher.cameraDeviceId as string)
    // @ts-ignore
    videoRef.current.srcObject = stream
  }

  useEffect(() => {
    if (useCamera) {
      play()
    }
  }, [useCamera])

  const handleOpenCamera = () => {
    orcaTxLivePusher.startCamera()
  }

  return (
    <div className="camera-container">
      <video
        id="local_video"
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
          margin: '0 auto',
          visibility: useCamera ? 'unset' : 'hidden',
        }}
        autoPlay
        preload="auto"
      />
      {
        !useCamera && (
          <div className="actions-mask orca-flex-center-layout">
            <Button onClick={() => { handleOpenCamera() }}>开启视频</Button>
          </div>
        )
      }
    </div>
  )
}

export default Camera
