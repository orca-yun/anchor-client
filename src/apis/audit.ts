import orcaRequest from './'
import { CommonRes } from './interface'

export const enum SenderTypeEnum {
  Anchor,
  Assistant,
  Audience,
  Robot,
}

export const SenderTypeText = {
  [SenderTypeEnum.Anchor]: '主播',
  [SenderTypeEnum.Assistant]: '助理',
  [SenderTypeEnum.Robot]: '机器人',
}

export enum CommandTypeEnum {
  Normal = 'normal',
  Img = 'img',
  Cancel = 'cancel',
  Reply = 'reply',
}

export enum ExamineStatus {
  INIT = 'init',
  APPROVE = 'approve',
  DIS_APPROVE = 'disapprove',
}

export interface IMsg {
  id: number
  ts: number
  uid: string
  nickname: string
  msgType: CommandTypeEnum
  msgUid: string
  senderHeadIco: string
  senderName: string
  senderType: SenderTypeEnum
  senderUid: number| string
  data: string
  quotaData: string
  examineStatus: ExamineStatus
  cts: number
  createTime: string
}

/**
 * 查询未审核的发言
 * */
export const queryUnAuditMsg = (): Promise<CommonRes<IMsg[]>> =>
  orcaRequest.get('/v2/examine/msg/{roomId}', {
    params: {
      size: 300,
    },
  })

/**
 * 查询未审核的发言
 * @params {data} 消息id
 * */
export const auditMsg = (data: { id: number; examineStatus: string }) =>
  orcaRequest.post('/v2/examine/msg/{roomId}', data)

/**
 * 撤回消息
 * @params {msgUid} 消息id
 * */
export const withDrawMsg = (msgUid: string) =>
  orcaRequest.post('/v2/im/rollback/{roomId}', {
    msgUid,
  })

/**
 * 回复/发送消息
 * @params {data} 消息
 * */
export const sendMsg = (data: { data: string; msgType: CommandTypeEnum; replyData?: string }) =>
  orcaRequest.post('/v2/im/send/{roomId}', data)



