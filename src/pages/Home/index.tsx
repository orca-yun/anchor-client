import React from 'react'
import { Button, Space } from 'antd'
import { observer } from 'mobx-react-lite'

import ScreenShare from '@/containers/ScreenShare'
import WhiteBoard from '@/containers/WhiteBoard'
import Camera from '@/containers/Camera'
import ChatMessageModule from '@/containers/ChatMessageModule'
import { settingStore, authStore } from '@/stores'
import logo from '@/assets/logo/logo.png'

import { orcaTxLivePusher } from '@/utils/OrcaTxLivePusher'

import './index.less'

const Home = () => {
  const { isLiving } = authStore
  const {
    deviceUseMap: {
      useMicrophone,
      useCamera,
      useWhiteBoard,
      useScreenCapture,
      isPushing,
    },
  } = settingStore

  const getLayoutConfig = () => {
    console.log(orcaTxLivePusher.txVideoEffectManager.getLayout(orcaTxLivePusher.cameraDeviceId as string))
  }

  return (
    <div className="orca-anchor-home-page">
      <div className="orca-anchor-home-page__content">
        <div className="orca-anchor-home-page__content-left">
          {
            !useWhiteBoard && !useScreenCapture && (
              <div className="orca-flex-center-layout empty-tip">
                <i className="logo orca-bg-contain" style={{ backgroundImage: `url(${logo})` }} />
                <span style={{ marginTop: 12 }}>请开始使用白板或者屏幕共享吧</span>
              </div>
            )
          }
          <WhiteBoard show={useWhiteBoard} />
          <ScreenShare show={useScreenCapture} />
        </div>
        <div className="orca-anchor-home-page__content-right">
          {
            !useScreenCapture && (
              <div className="camera-wrapper">
                <Camera useCamera={useCamera} />
              </div>
            )
          }
          <div className="chat-wrapper">
            <ChatMessageModule />
          </div>
        </div>
      </div>
      <div className="orca-anchor-home-page__bottom">
        <Space>
          {
            useMicrophone
              ? (<Button onClick={() => { orcaTxLivePusher.stopMicrophone() }}>闭麦</Button>)
              : (<Button onClick={() => { orcaTxLivePusher.startMicrophone() }}>开麦</Button>)
          }
          {
            useCamera
              ? (<Button onClick={() => { orcaTxLivePusher.stopCamera() }}>关闭摄像头</Button>)
              : (<Button onClick={() => { orcaTxLivePusher.startCamera() }}>打开摄像头</Button>)
          }
          {
            useScreenCapture
              ? (<Button onClick={() => {
                orcaTxLivePusher.stopScreenCapture()
              }}>关闭屏幕共享</Button>)
              : (<Button onClick={() => {
                orcaTxLivePusher.startScreenCapture()
              }}>打开屏幕共享</Button>)
          }
          {
            useWhiteBoard
              ? (<Button onClick={() => {
                settingStore.setDeviceUseMap({ useWhiteBoard: false })
              }}>关闭白板</Button>)
              : (<Button onClick={() => {
                orcaTxLivePusher.stopScreenCapture()
                settingStore.setDeviceUseMap({ useWhiteBoard: true, useScreenCapture: false })
              }}>打开白板</Button>)
          }
        </Space>
        {/*<Button>设置</Button>*/}
        {/* 是否开始推流 不是真正意义上的开关播 */}
        <Space>
          {
            authStore.pushStream.webrtc && (
              isPushing
                ? (<Button danger onClick={() => { orcaTxLivePusher.stopPush() }}>关闭推流</Button>)
                : (<Button
                  disabled={!useScreenCapture && !useCamera}
                  type="primary"
                  onClick={() => { orcaTxLivePusher.startPush(authStore.pushStream.webrtc) }}
                >开始推流</Button>)
            )
          }
          {
            isLiving
              ? (<Button
                danger
                onClick={() => {
                  authStore.stopLive()
                }}
              >关闭直播</Button>)
              : (<Button
                type="primary"
                onClick={() => {
                  authStore.startLive()
                }}
              >开始直播</Button>)
          }
        </Space>
        {/*<Button onClick={() => { getLayoutConfig() }}>获取layout配置</Button>*/}
      </div>
    </div>
  )
}

export default observer(Home)
