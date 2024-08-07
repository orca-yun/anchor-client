// https://cloud.tencent.com/document/product/266/63004
interface TCPlayerOptions {
  autoplay?: boolean
  controls?: boolean
  poster?: string
  controlBar?: {
    playToggle?: boolean
    progressControl?: boolean
    volumePanel?: boolean
    currentTimeDisplay?: boolean
    durationDisplay?: boolean
    timeDivider?: boolean
    playbackRateMenuButton?: boolean
    fullscreenToggle?: boolean
    qualitySwitcherMenuButton?: boolean
  }
  listener?: (msg: string) => void
  // ABR场景 hls自适应码率（根据网络）
  sources?: {
    src: string
    type?: string
  }[]
  webrtcConfig?: {
    // 是否渲染多清晰度的开关，默认开启，可选
    enableAbr: boolean,
    // 模板名对应的label名，可选
    abrLabels: Record<string, string>,
  }
  licenseUrl?: string
  // 清晰度 https://cloud.tencent.com/document/product/881/100140
  multiResolution?: {
    sources?: Record<string, { src: string }[]>
    // 配置每个清晰度标签
    labels?: Record<string, string>
    // 配置各清晰度在播放器组件上的顺序
    showOrder?: string[]
    // 配置默认选中的清晰度
    defaultRes?: string
  },
}

declare module 'tcplayer.js' {
  export type TCPlayerIInstance = {
    src: (url: string) => void
    dispose: () => void
  }
  export default function TCPlayer(elementId: string, options: TCPlayerOptions): TCPlayerIInstance
}


