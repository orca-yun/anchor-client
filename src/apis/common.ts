import orcaRequest from './'
import { CommonRes } from './interface'

/**
 * 上传文件
 * */
export const upload = (data: FormData): Promise<CommonRes<string>> =>
  orcaRequest.post('/v2/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
