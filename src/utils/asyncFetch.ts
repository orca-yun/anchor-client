import { message } from 'antd'

import { parseMessage } from '@/utils/error'

export interface AsyncFetchHooks<T> {
  loadingMsg?: string
  loadingSuccessMsg?: string
  onRequest?: () => void
  onSuccess?: (response: T) => void
  onError?: (errMessage: any, e: any) => void
  onFinish?: () => void
}

export const asyncFetch = async <T>(
  callApi: () => Promise<T>,
  hooks: AsyncFetchHooks<T> = {},
): Promise<boolean> => {
  // message.destroy()
  const {
    loadingMsg,
    loadingSuccessMsg,
    onRequest,
    onSuccess,
    onError = (errMsg: string) => {
      message.error(errMsg)
    },
    onFinish,
  } = hooks
  let messageLoadingDestroyer = null
  try {
    if (loadingMsg) messageLoadingDestroyer = message.loading(loadingMsg)
    onRequest && onRequest()
    const response = await callApi()
    onSuccess && onSuccess(response)
    loadingSuccessMsg && message.success(loadingSuccessMsg)
    return true
  } catch (e: any) {
    const parsedErrorMsg = parseMessage(e)
    if (parsedErrorMsg && onError) {
      onError(parseMessage(e), e)
    }
  } finally {
    messageLoadingDestroyer && messageLoadingDestroyer()
    onFinish && onFinish()
  }
  return false
}
