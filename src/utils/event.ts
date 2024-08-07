export default class CustomEvents {
  eventMap: Record<string, ((...args: any[]) => void)[]>

  constructor() {
    this.eventMap = {}
  }

  on(type: string, listener: (...args: any[]) => void) {
    this.eventMap[type] = (this.eventMap[type] || []).concat(listener)
  }

  emit(type: string, params: Record<string, any> | any) {
    if (!this.eventMap[type]) return
    this.eventMap[type].forEach((listener) => {
      listener(params)
    })
  }

  off(type: string, listener?: (...args: any[]) => void) {
    if (!this.eventMap[type]) return
    // 清除全部
    if (!listener) {
      this.eventMap[type] = []
      return
    }
    // @ts-ignore
    this.eventMap[type] = this.eventMap[type].filter((fn) => fn !== listener && fn.origin !== listener)
  }

  once(type: string, listener: (...args: any[]) => void) {
    const handler = (data: Record<string, any>) => {
      listener(data)
      this.off(type, handler)
    }
    // @ts-ignore
    handler.origin = listener
    this.on(type, handler)
  }

  syncWait<T>(type: string, params: Record<string, any> | string): Promise<T> {
    return new Promise((resolve) => {
      this.once(`${type}:callback`, (res) => {
        resolve(res)
      })
      this.emit(type, params)
    })
  }

  clear() {
    this.eventMap = {}
  }
}

export const orcaEvent = new CustomEvents()
