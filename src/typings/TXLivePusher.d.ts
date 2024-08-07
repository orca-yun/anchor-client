type DeviceType = 'video' | 'audio'

interface TXMediaDeviceInfo {
  deviceId: string
  deviceName: string
  type: DeviceType
}

interface IDeviceManage {
  // 获取设备列表
  getDevicesList: (type?: DeviceType) => Promise<TXMediaDeviceInfo[]>
}

interface TXLivePusherObserver {
  onError?: (code: number, message: string, extraInfo: object) => void
  onWarning?: (code: number, message: string, extraInfo: object) => void
  onCaptureFirstAudioFrame?: () => void
  onCaptureFirstVideoFrame?: () => void
  onPushStatusUpdate?: () => void
  onStatisticsUpdate?: () => void
}

interface TXMixingConfig {
  videoWidth?: number
  videoHeight?: number
  videoFramerate?: number
  backgroundColor?: number
}

interface TXLayoutConfig {
  streamId?: string
  x?: number
  y?: number
  width?: number
  height?: number
  zOrder?: number
}

interface IVideoEffectManager {
  // 开启混流
  enableMixing: (enabled: boolean) => void
  setMixingConfig: (config: TXMixingConfig) => void
  setLayout: (config: TXLayoutConfig | TXLayoutConfig[]) => void
  getLayout: (streamId: string) => TXLayoutConfig | null
}

declare class TXLivePusher {
  constructor()

  setRenderView: (element: string) => void
  startPush: (pushUrl: string) => Promise<void>
  stopPush(): void

  setVideoQuality(quality: string): void
  setAudioQuality: (quality: string) => void

  // 自定义设置帧率
  setProperty: (property: string, val: string | number | boolean) => void

  getDeviceManager: () => IDeviceManage

  // 获取流
  getMediaStream: (streamId?: string) => MediaStream

  // 打开摄像头
  startCamera: (deviceId?: string) => Promise<string>
  // 关闭摄像头
  stopCamera: (streamId?: string) => void
  // 打开麦克风
  startMicrophone: (deviceId?: string) => Promise<string>
  // 闭麦
  stopMicrophone: (streamId?: string) => void
  // 屏幕采集
  startScreenCapture: (audio?: boolean) => Promise<string>
  // 关闭屏幕采集
  stopScreenCapture: (streamId?: string) => void

  // 混流相关
  getVideoEffectManager: () => IVideoEffectManager

  // 事件相关
  setObserver: (observer: TXLivePusherObserver) => void

  // 销毁
  destroy: () => void
}
