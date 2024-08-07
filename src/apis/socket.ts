export enum BizType {
  LIVE_STATUS = 'live_status',
  GIFT = 'gift',
  SYSTEM_MSG = 'system_msg',
  TOTAL_ONLINE_USER = 'total_online_user',
}

export interface ICtrlSocketMsg {
  bizType: BizType
  data: string
  ts: number
  uuid: string
}
