import orcaRequest from './'
import { CommonRes } from './interface'

/*
* 开播
* */
export const startLive = () =>
  orcaRequest.post('/v3/start')

/*
* 开播
* */
export const finishLive = () =>
  orcaRequest.post('/v3/start')

/**
 * 上传课件
 * */
export const uploadCourseware = (data: FormData) =>
  orcaRequest.post('/v2/courseware/{roomId}/convert', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

/**
 * 课件列表
 * */
export interface ICourseware {
  id: number
  orgId: number
  roomId: number
  name: string
  status: number
  images: string[]
}

export const queryCoursewareList = (): Promise<CommonRes<ICourseware[]>> =>
  orcaRequest.get('/v2/courseware/{roomId}')

// 删除课件
export const deleteCourseware = (params: any) =>
  orcaRequest.delete(`/v2/courseware/{roomId}`, {
    params,
  })
