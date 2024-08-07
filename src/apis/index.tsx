import axios from 'axios'

import { NO_REGISTERED_API_ERR_MSG, requestErrorInterceptor } from '@/utils/error'
// 这边引入造成循环依赖了 看起来暂时没问题 @Vite
import { authStore } from '@/stores'

const orcaRequest = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API as string,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
})

export const getSocketUrl = () => {
  const {baseURL = ''} = orcaRequest.defaults
  let protocol = 'ws'
  if (baseURL.includes('https')) {
    protocol = 'wss'
  }
  return `${protocol}://${baseURL.replace(/http(s)?:\/\//, '')}`
}

orcaRequest.interceptors.request.use((config) => {
  const {baseURL} = config
  return {
    ...config,
    cancelToken: new axios.CancelToken((cancel) => {
      if (!baseURL) {
        cancel(NO_REGISTERED_API_ERR_MSG)
      }
    })
  }
})

const ROOM_ID_REGEXP = /\{roomId\}/
// auto fill baseId
orcaRequest.interceptors.request.use((config) => {
  const { url, method } = config
  if (!authStore.roomId || !url) return config
  const payload = {
    url: url.replace(ROOM_ID_REGEXP, `${authStore.roomId}`),
  }
  if (method === 'get') {
    Object.assign(payload, {
      params: {
        ...(config.params || {}),
        roomId: authStore.roomId,
      },
    })
  } else if (config.data && typeof config.data === 'object' && config.headers['Content-Type'] !== 'multipart/form-data') {
    Object.assign(payload, {
      data: {
        ...(config.data || {}),
        roomId: authStore.roomId,
      },
    })
  }
  return {
    ...config,
    ...payload,
  }
})

orcaRequest.interceptors.response.use(
  (res) => requestErrorInterceptor({response: res}),
  (error) => requestErrorInterceptor(error) as any
)

orcaRequest.interceptors.response.use((response) => {
  return Promise.resolve(response.data)
})

let addTokenInterceptorId: number | null = null

export const clearRequestToken = () => {
  if (!addTokenInterceptorId) return
  orcaRequest.interceptors.request.eject(addTokenInterceptorId)
  addTokenInterceptorId = null
}

export const addRequestToken = (token: string) => {
  clearRequestToken()
  addTokenInterceptorId = orcaRequest.interceptors.request.use((config) => {
    if (config.url !== '/v2/cross/login') {
      Object.assign(config.headers, {
        'Authorization': `Bearer ${token}`,
      })
    }
    return config
  })
}

export default orcaRequest
