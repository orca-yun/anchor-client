import { message } from 'antd'

import { settingStore } from '@/stores'
import { callSelectCameraModal } from '@/components/SelectCamera'

class OrcaTxLivePusher {
  public txLivePusher = new TXLivePusher()
  private renderViewId: string | null = null
  public cameraDeviceId: string | null = null
  private txDeviceManager: IDeviceManage = this.txLivePusher.getDeviceManager()
  public txVideoEffectManager: IVideoEffectManager = this.txLivePusher.getVideoEffectManager()
  private renderViewSize = { width: 0, height: 0 }

  constructor() {
    this.init()
  }

  stop() {
    this.txLivePusher.stopPush()
    this.txLivePusher.stopCamera()
    this.txLivePusher.stopMicrophone()
    this.txLivePusher.stopScreenCapture()
    this.txLivePusher.destroy()
  }

  // 混流只能渲染在一个video里 需要在组件侧注册
  registerRenderView(element: string) {
    this.renderViewId = element
    this.txLivePusher.setRenderView(element)
    const dom = document.querySelector(`#${element}`)
    if (!dom) return
    const { width, height } = dom.getBoundingClientRect()
    this.renderViewSize = {
      width,
      height,
    }
    this.txVideoEffectManager.setMixingConfig({
      videoWidth: width,
      videoHeight: height,
    })
  }

  // 获取推流地址
  init() {
    // TODO: 结合UI进行参数设置
    this.txLivePusher.setVideoQuality('1080p')
    // 设置音频质量
    this.txLivePusher.setAudioQuality('high')
    // 自定义设置帧率
    this.txLivePusher.setProperty('setVideoFPS', 25)
    // 开启混流
    this.txVideoEffectManager.enableMixing(true)
    this.txLivePusher.setObserver({
      onError: (code, msg) => {
        message.error(`推流异常: ${code} ${msg}`)
      },
      onWarning: (code) => {
        switch(code) {
          case -1007:
            message.info('屏幕共享已中断')
            settingStore.setDeviceUseMap({ useScreenCapture: false })
            break;
          case -1005:
            message.info('摄像头已中断，请检查')
            settingStore.setDeviceUseMap({ useCamera: false })
            break;
          case -1006:
            message.info('麦克风设备已中断，请检查')
            settingStore.setDeviceUseMap({ useMicrophone: false })
            break;
        }
      },
    })
  }

  getMediaStream() {

  }

  async selectCameraDevice(devices: TXMediaDeviceInfo[]) {
    return callSelectCameraModal({
      devices,
    })
  }

  setCameraStreamToTop(streamId: string, options: Omit<TXLayoutConfig, 'streamId'>) {
    this.txVideoEffectManager.setLayout({
      streamId,
      ...options,
    })
  }

  setCameraStreamLayout(biggest = true) {
    if (!this.cameraDeviceId) return
    if (biggest) {
      this.setCameraStreamToTop(this.cameraDeviceId, {
        x: this.renderViewSize.width / 2,
        y: this.renderViewSize.height / 2,
        width: this.renderViewSize.width,
        height: this.renderViewSize.height,
        zOrder: 999,
      })
      return
    }
    this.setCameraStreamToTop(this.cameraDeviceId, {
      x: this.renderViewSize.width - 150,
      y: this.renderViewSize.height - 85,
      width: 300,
      height: 240,
      zOrder: 999,
    })
  }

  // 开启摄像头
  async startCamera() {
    if (this.cameraDeviceId) return false
    try {
      const devices = await this.txDeviceManager.getDevicesList('video')
      console.log('检测到摄像头设备', devices)
      // 只有一个摄像头设备直接使用
      if (!devices.length) {
        message.warning('未检测到摄像头设备')
        return false
      }
      let deviceId = null
      // @ts-ignore
      if (devices.length > 1) {
        const res = await this.selectCameraDevice(devices)
        if (!res) {
          message.warning('已取消打开摄像头')
          return
        }
        deviceId = res
      } else {
        deviceId = devices[0].deviceId
      }
      this.cameraDeviceId = await this.txLivePusher.startCamera(deviceId)
      if (settingStore.deviceUseMap.useScreenCapture) {
        this.setCameraStreamLayout(false)
      } else {
        this.setCameraStreamLayout(true)
      }
      settingStore.setDeviceUseMap({ useCamera: true })
      return this.cameraDeviceId
    } catch (e) {
      message.error('访问摄像头失败，请检查设备')
      return false
    }
  }

  // 关闭摄像头
  stopCamera() {
    this.cameraDeviceId = null
    this.txLivePusher.stopCamera()
    settingStore.setDeviceUseMap({ useCamera: false })
  }

  async selectMicrophoneDevice() {

  }

  // 开麦
  async startMicrophone() {
    // const devices = await this.txDeviceManager.getDevicesList('audio')
    // // 只有一个摄像头设备直接使用
    // if (!devices.length) {
    //   message.info('未检测到麦克风设备')
    //   return
    // }
    // if (devices.length > 1) return this.selectCameraDevice()
    try {
      this.cameraDeviceId = await this.txLivePusher.startMicrophone()
      settingStore.setDeviceUseMap({ useMicrophone: true })
    } catch (e) {
      message.info('访问麦克风失败，请检查设备')
    }
  }

  // 闭麦
  stopMicrophone() {
    this.txLivePusher.stopMicrophone()
    settingStore.setDeviceUseMap({ useMicrophone: false })
  }

  // 开启屏幕共享
  async startScreenCapture() {
    try {
      const screenCaptureStreamId = await this.txLivePusher.startScreenCapture()
      this.setCameraStreamToTop(screenCaptureStreamId, {
        x: this.renderViewSize.width / 2,
        y: this.renderViewSize.height / 2,
        width: this.renderViewSize.width,
        height: this.renderViewSize.height,
        zOrder: 1,
      })
      if (settingStore.deviceUseMap.useCamera && this.cameraDeviceId) {
        this.setCameraStreamLayout(false)
      }
      settingStore.setDeviceUseMap({ useWhiteBoard: false, useScreenCapture: true })
    } catch (e: any) {
      if (e.message && (e.message.indexOf('Permission denied') > -1)) {
        message.info('请开启权限')
      }
    }
  }

  // 关闭屏幕共享
  stopScreenCapture() {
    this.txLivePusher.stopScreenCapture()
    settingStore.setDeviceUseMap({ useScreenCapture: false })
    if (settingStore.deviceUseMap.useCamera && this.cameraDeviceId) {
      // 将摄像头的流最大化
      this.setCameraStreamLayout(true)
    }
  }

  // 开始推流
  async startPush(url: string) {
    try {
      await this.txLivePusher.startPush(url)
      settingStore.setDeviceUseMap({ isPushing: true })
      message.success('推流成功~')
    } catch (e: any) {
      message.error(e.message)
    }
  }

  // 结束推流
  stopPush() {
    this.txLivePusher.stopPush()
    settingStore.setDeviceUseMap({ isPushing: false })
  }
}

export const orcaTxLivePusher = new OrcaTxLivePusher()
