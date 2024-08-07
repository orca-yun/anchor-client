import orcaRequest from './'
import { CommonRes } from './interface'

export interface IRobot {
  id: number
  orgId: number
  code: string
  nickname: string
  headIco: string
}

/**
 * 机器人列表
 * */
export const queryRobots = (): Promise<CommonRes<IRobot[]>> =>
  orcaRequest.get('/v2/interact/robot')

/**
 * 机器人发送消息
 * */

export const sendMsg = (data: { robotId: number; data: string }) =>
  orcaRequest.post('/v2/im/send/robot/{roomId}', data)

/**
 * 机器人送礼物
 * */
export const sendGift = (data: { id: number; robotId: number }) =>
  orcaRequest.post('/v2/market/gift/{roomId}/robot/send', data)


