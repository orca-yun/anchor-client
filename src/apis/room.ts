import orcaRequest from './'
import { CommonRes } from './interface'
import { LiveStatusEnum } from './enums'

export interface IRoomInfo {
  id: number
  orgId: number
  name: string
  sharePwd: string
  livingTime: string
  livingStatus: LiveStatusEnum
  cover: string
  remark: string
  livingType: number
  videoQuality: number
}

// 获取房间信息
export const queryRoomInfo = (): Promise<CommonRes<IRoomInfo>> =>
  orcaRequest.get('/v2/room/meta')

export enum IStreamTypeEnum {
  RTMP = 'rtmp',
  FLV = 'flv',
  M3U8 = 'm3u8',
  WEBRTC = 'webrtc',
}

export type IStream = Record<IStreamTypeEnum, string>

// 拉流地址
export const queryBroadcastStream = (): Promise<CommonRes<IStream>> =>
  orcaRequest.get('/v2/stream/pull/{roomId}')

// 获取推流地址
export interface IPushStream {
  webrtc: string
}
export const queryPushStreamInfo = (): Promise<CommonRes<IPushStream>> =>
  orcaRequest.get('/v2/stream/push/{roomId}')

// 直播状态管理
// 开始直播
export const startLive = () =>
  orcaRequest.post('/v2/live/start/live/{roomId}', {
    needRecord: 0,
  })

// 关直播
export const stopLive = () =>
  orcaRequest.post('/v2/live/stop/live/{roomId}')

