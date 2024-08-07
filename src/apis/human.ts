import orcaRequest from './'
import { CommonRes } from './interface'

export interface IAudience {
  uid: string | number
  nickname: string
  roomId: number
}

/**
 * 获取在线学员
 * @params {audience} 用户信息
 * */
export const queryAudienceList = (): Promise<CommonRes<IAudience[]>> =>
  orcaRequest.get('/v2/interact/online/share/{roomId}', {
    params: {
      page: 1,
      pageSize: 1000,
      sort: '',
    },
  })

/**
 * 获取禁言列表
 * */
export const queryMuteList = (): Promise<CommonRes<IAudience[]>> =>
  orcaRequest.get('/v2/interact/mute/{roomId}')

/**
 * 解除用户禁言
 * @params {audience} 用户信息
 * */
export const recoveryAudienceFromMute = (audience: Omit<IAudience, 'roomId'>) =>
  orcaRequest.post('/v2/interact/mute/{roomId}/move', audience)

/**
 * 禁言
 * @params {audience} 用户信息
 * */
export const addAudienceToMute = (audience: Omit<IAudience, 'roomId'>) =>
  orcaRequest.post('/v2/interact/mute/{roomId}/join', audience)

// 禁言状态枚举
export enum IMuteOperateEnum {
  ON = 'on',
  OFF = 'off',
}

/**
 * 获取全体禁言状态
 * */
export const queryAllMuteStatus = (): Promise<CommonRes<IMuteOperateEnum>> =>
  orcaRequest.get('/v2/interact/all/mute/{roomId}')

/**
 * 全体禁言
 * @params {operate} 禁言状态
 * */
export const muteAllAudience = (operate: IMuteOperateEnum) =>
  orcaRequest.post(`/v2/interact/all/mute/{roomId}/${operate}`)

/**
 * 获取黑名单列表
 * */
export const queryBLList = (): Promise<CommonRes<IAudience[]>> =>
  orcaRequest.get('/v2/interact/black/{roomId}')

/**
 * 移出黑名单
 * @params {audience} 用户信息
 * */
export const recoveryAudienceFromBL = (audience: Omit<IAudience, 'roomId'>) =>
  orcaRequest.post('/v2/interact/black/{roomId}/move', audience)

/**
 * 拉黑用户
 * @params {audience} 用户信息
 * */
export const addAudienceToBL = (audience: Omit<IAudience, 'roomId'>) =>
  orcaRequest.post('/v2/interact/black/{roomId}/join', audience)

