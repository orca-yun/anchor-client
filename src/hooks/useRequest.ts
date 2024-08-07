import { useRequest } from 'ahooks'
import type { Options } from 'ahooks/es/useRequest/src/types'

import { asyncFetch } from '@/utils/asyncFetch'
import type { AsyncFetchHooks } from '@/utils/asyncFetch'

const useOrcaRequest = <TData, TParams extends any[]>(
  fn: (...args: TParams) => Promise<TData>,
  useRequestOptions: Options<TData, TParams> = {},
  asyncFetchOptions: AsyncFetchHooks<any>,
) => {
  // @ts-ignore
  const useRequestResult = useRequest(async (...args: TParams) => {
    const { onSuccess } = asyncFetchOptions
    let response = null
    await asyncFetch(() => fn(...args), {
      ...asyncFetchOptions,
      onSuccess: (res) => {
        if (onSuccess) onSuccess(res)
        response = res
      },
    })
    return response
  }, useRequestOptions)
  return [useRequestResult]
}

export default useOrcaRequest
