import { extendObservable, makeAutoObservable } from 'mobx'

class Loading {
  constructor() {
    makeAutoObservable(this)
  }

  registerMobxAction(key: string) {
    if (key in this) return
    extendObservable(this, {[key]: false})
  }

  setLoading(key: string, value: boolean) {
    // @ts-ignore
    this[key] = value
  }
}

const loadingStore = new Loading()

// @ts-ignore
export const loadingEffectGetter = (key: string): boolean => loadingStore[key]

export function createLoadingEffect<T = any>(store: any, name?: string): T {
  const target = Object.create(null)
  // @ts-ignore
  // 防止类名生产打包时被webpack混淆
  const fatherClassName = name || store.constructor.name
  // @ts-ignore
  const keys = Reflect.ownKeys(store.constructor.prototype)
  keys.forEach((key) => {
    if (typeof key === 'string' && store[key]?.isMobxAction) {
      loadingStore.registerMobxAction(`${fatherClassName}/${store[key].name}`)
    }
  })

  return new Proxy(target, {
    get(obj, key) {
      if (typeof key === 'string' && store[key]?.isMobxAction) {
        // 劫持mobx action 自动注入loading
        return (...args: any[]) => {
          loadingStore.setLoading(`${fatherClassName}/${key}`, true)
          const res = store[key].bind(store)(...args)
          if (res instanceof Promise) {
            return Promise.resolve(res)
              .then((promiseRes) => Promise.resolve(promiseRes))
              .catch((e) => Promise.reject(e))
              .finally(() => {
                loadingStore.setLoading(`${fatherClassName}/${key}`, false)
              })
          }
          loadingStore.setLoading(`${fatherClassName}/${key}`, false)
          return res
        }
      }
      return store[key]
    },
  }) as T
}

export default loadingStore
