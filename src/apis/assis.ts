import orcaRequest from './'
import { CommonRes } from './interface'

export interface IAssistantModel {
  uid: number
  nickname: string
  roomId: number
}

/**
 * 在线助理列表
 * */
export const queryAssistantOnline = (): Promise<CommonRes<IAssistantModel[]>> =>
  orcaRequest.get('/v2/interact/online/assi/{roomId}')


