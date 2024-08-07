/* 营销管理 */

import orcaRequest from './'
import { CommonRes } from './interface'

/**
* 推荐商品
 * @params {recommendCommodityId} 商品ID
* */
export const recommendCommodity = (recommendCommodityId: number) =>
  orcaRequest.post('/v2/market/goods/{roomId}/recommend', {
    id: recommendCommodityId,
  })

export enum ICommoditySellStatusEnum {
  ON_SHELVES = 1,
  OFF_SHELVES,
  SOLD_OUT,
}

export const CommoditySellStatusText = {
  [ICommoditySellStatusEnum.ON_SHELVES]: '上架中',
  [ICommoditySellStatusEnum.OFF_SHELVES]: '已下架',
  [ICommoditySellStatusEnum.SOLD_OUT]: '已售罄',
}

export const CommoditySellStatusSetText = {
  [ICommoditySellStatusEnum.ON_SHELVES]: '上架',
  [ICommoditySellStatusEnum.OFF_SHELVES]: '下架',
  [ICommoditySellStatusEnum.SOLD_OUT]: '售罄',
}

/**
 * 设置商品上下架售罄状态
 * @params {recommendCommodityId} 商品ID
 * */
export const setCommoditySellStatus = (data: { sellStatus: ICommoditySellStatusEnum; id: number }) =>
  orcaRequest.post(`/v2/market/goods/{roomId}/action`, data)

export interface ICommodity {
  id: number
  orgId: number
  roomId: number
  goodsLibId: number
  name: string
  img: string
  originalPrice: number
  price: number
  payType: number
  miniPage: string
  jumpPage: string
  sellStatus: ICommoditySellStatusEnum
}

/**
 * 获取房间商品列表
 * */
export const queryRoomCommodityList = (): Promise<CommonRes<ICommodity[]>> =>
  orcaRequest.get('/v2/market/goods/{roomId}')

export enum IGiftStatusEnum {
  ON_SHELVES = 1,
  OFF_SHELVES,
}

export const GiftStatusText = {
  [ICommoditySellStatusEnum.ON_SHELVES]: '上架中',
  [ICommoditySellStatusEnum.OFF_SHELVES]: '已下架',
}

export const GiftStatusSetText = {
  [ICommoditySellStatusEnum.ON_SHELVES]: '上架',
  [ICommoditySellStatusEnum.OFF_SHELVES]: '下架',
}

export interface IGift {
  id: number
  orgId: number
  roomId: number
  giftLibId: number
  name: string
  img: string
  price: number
  status: IGiftStatusEnum
}

/**
 * 获取房间礼物列表
 * */
export const queryRoomGiftList = (): Promise<CommonRes<IGift[]>> =>
  orcaRequest.get('/v2/market/gift/{roomId}')

/**
 * 获取房间礼物列表
 * @params {giftId} 礼物ID
 * */
export const setGiftStatus = (data: { id: number;  status: IGiftStatusEnum }) =>
  orcaRequest.post('/v2/market/gift/{roomId}/action', data)

/**
 * 机器人发送礼物
 * */
export const sendGiftFromRobot = (data: { id: number; robotId: number }) =>
  orcaRequest.post('/v2/market/gift/{roomId}/robot/send', data)
