import { message } from 'antd'
import axios from 'axios'
import i18n from 'i18next'

import { orcaEvent } from '@/utils/event'

// status code
export const SUCCESS_CODE_LOWER_BOUND = 200
export const SUCCESS_CODE_HIGHER_BOUND = 300

// request code
// success code
export const SERVER_SUCCESS_CODE_NEW = 0
// fail code
export const SERVER_FAIL_CODE = 1
// unAuthorize redirect code, fallback with jumpUrl
export const SERVER_REDIRECT_CODE = 2

export const UNAUTHORIZED_ERROR = 401
export const SERVER_SUCCESS_CODE = 200

export enum RequestErrors {
  NETWORK_ERROR = 'NETWORK_ERROR',
  FETCH = 'FETCH',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  REGISTERED_API = 'REGISTERED_API'
}

export class NETWORK_ERROR extends Error {
  constructor(response?: any, msg: string = i18n.t('网络异常，请重试')) {
    super(response?.msg || msg)
    this.name = RequestErrors.NETWORK_ERROR
  }
}

/* status >= 500 服务器异常 */
export class ServerError extends Error {
  constructor(response?: any, msg: string = i18n.t('获取数据失败，请重试')) {
    super(response?.msg || msg)
    this.name = RequestErrors.SERVER
  }
}

/* 服务器超时 */
export class TimeoutError extends Error {
  constructor(msg: string = i18n.t('服务超时')) {
    super(msg)
    this.name = RequestErrors.TIMEOUT
  }
}

export class UnAuthorizedError extends Error {
  constructor(msg: string = i18n.t('认证失败，请重新登录')) {
    super(msg)
    this.name = RequestErrors.UNAUTHORIZED
  }
}

export class FetchError extends Error {
  constructor(response?: any, msg: string = i18n.t('请求出错，请重试')) {
    // 特殊处理一下接口404的错误信息
    const message = response && (response.data.msg || `${response.url}: ${response.status}`)
    super(message || msg)
    this.name = RequestErrors.FETCH
  }
}

export const NO_REGISTERED_API_ERR_MSG = 'no registered api error'

export class NoRegisteredApiError extends Error {
  constructor(msg: string = i18n.t('请求被取消')) {
    super(msg)
    this.name = RequestErrors.REGISTERED_API
  }
}

const rejectCustomizeError = (error: Error, response?: Response) =>
  Promise.reject({error, response})

export const requestErrorInterceptor = async (res: any) => {
  if (res instanceof axios.CanceledError && res?.message === NO_REGISTERED_API_ERR_MSG) {
    return rejectCustomizeError(new NoRegisteredApiError())
  }
  const response = res.response
  if (!response) {
    return rejectCustomizeError(new NETWORK_ERROR())
  }
  const {headers, status} = response
  // 接口404
  if (response.status === 404) return rejectCustomizeError(new FetchError({
    ...response,
    url: response.request.responseURL
  }))
  if (!headers.get('Content-Type')?.includes('application/json')) return response
  // @ts-ignore
  const resp: any = response.data
  // 鉴权失败
  if (status === UNAUTHORIZED_ERROR || resp.code === UNAUTHORIZED_ERROR || resp.code === 403) {
    // TODO: 通知RN 进行登录
    return rejectCustomizeError(new UnAuthorizedError())
  }
  // 客户端报错
  if (response.status < SUCCESS_CODE_LOWER_BOUND || response.status > SUCCESS_CODE_HIGHER_BOUND)
    return rejectCustomizeError(new FetchError(response))

  // 兼容老接口的业务code === 200
  if (resp.code === SERVER_SUCCESS_CODE_NEW || resp.code === SERVER_SUCCESS_CODE) return response
  return rejectCustomizeError(new ServerError(resp), resp)
}

export const parseMessage = (e: any) => {
  if (e instanceof Error) {
    return e.message
  }
  const {error} = e
  if (error instanceof NoRegisteredApiError) return error.message
  if (error instanceof ServerError) return error.message
  if (error instanceof UnAuthorizedError) {
    orcaEvent.emit('token-invalid', {})
    // return error.message
    // no defaultErrorToast
    return null
  }
  if (error instanceof FetchError) return error.message
  if (error instanceof NETWORK_ERROR) return error.message
  return '系统错误，请重试'
}

export const parseError = (e: any) => {
  const msg = parseMessage(e)
  if (msg) message.error(msg)
}
