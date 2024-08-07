import { makeObservable, observable, action, computed } from 'mobx'
import _ from 'lodash'

import { ICourseware } from '@/apis/anchor'

type IDeviceUseMap = {
  useMicrophone: boolean
  useCamera: boolean
  useWhiteBoard: boolean
  useScreenCapture: boolean
  isPushing: boolean
}

const bgImageLoadedMap = new Map()

type IFabricOptions = {
  pencilOptions: {
    width: number
    color: string
  },
  rectOptions: {
    stroke: string
    strokeWidth: number
    fill: string
  },
  textBoxOptions: {
    fontSize: number
    fill: string
  },
}

class SettingStore {
  constructor() {
    makeObservable(this)
  }

  @observable deviceUseMap: IDeviceUseMap = {
    // 是否正在启用麦克风
    useMicrophone: false,
    // 是否开启了摄像头
    useCamera: false,
    // 是否启用白板
    useWhiteBoard: true,
    // 是否启用屏幕采集
    useScreenCapture: false,
    // 是否正在推流
    isPushing: false,
  }

  @action
  setDeviceUseMap(payload: Partial<IDeviceUseMap>) {
    this.deviceUseMap = {
      ...this.deviceUseMap,
      ...payload,
    }
  }

  loadImage(url: string) {
    if (bgImageLoadedMap.get(url)) return
    const img = new Image()
    img.src = url
    img.addEventListener('load', () => {
      bgImageLoadedMap.set(url, true)
    })
    img.addEventListener('error', () => {
      bgImageLoadedMap.set(url, false)
    })
  }

  @observable selectedCourseware: ICourseware | null = null
  @observable curRenderImg: string | null = null

  @action.bound
  setCurCourseware(item: ICourseware | null) {
    this.selectedCourseware = item
    if (!item) {
      this.setCurRenderImg(null)
      return
    }
    this.setCurRenderImg(item.images[0])
    item.images.forEach((imageUrl) => {
      this.loadImage(imageUrl)
    })
  }

  @action.bound
  setCurRenderImg(img: string | null) {
    this.curRenderImg = img
  }

  @computed
  get curImgChain() {
    if (!this.curRenderImg || !this.selectedCourseware?.images?.length) {
      return {
        hasPrev: false,
        hasNext: false,
      }
    }
    const index = this.selectedCourseware?.images.findIndex((item) => item === this.curRenderImg)
    return {
      hasPrev: index > 0,
      hasNext: index < this.selectedCourseware?.images.length - 1,
    }
  }

  @action.bound
  switchNextRenderImg(step: number) {
    if (!this.selectedCourseware?.images?.length) return
    const index = this.selectedCourseware?.images.findIndex((item) => item === this.curRenderImg)
    const nextIndex = index + step
    if (nextIndex >= 0 && nextIndex <= this.selectedCourseware?.images.length - 1) {
      this.setCurRenderImg(this.selectedCourseware?.images[nextIndex])
    }
  }

  @observable.shallow fabricOptions: IFabricOptions = {
    pencilOptions: {
      width: 6,
      color: '#DC143C',
    },
    rectOptions: {
      stroke: '#DC143C',
      strokeWidth: 2,
      fill: 'transparent',
    },
    textBoxOptions: {
      fontSize: 30,
      fill: 'black',
    },
  }

  @action.bound
  setFabricOptions(options: any) {
    this.fabricOptions = _.merge(this.fabricOptions, options)
  }
}

export default new SettingStore()
