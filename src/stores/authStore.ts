import { action, observable, makeAutoObservable, computed } from 'mobx'

import { login, type ILoginParams, logout } from '@/apis/login'
import { IRoomInfo, queryRoomInfo, queryPushStreamInfo, IPushStream, startLive, stopLive } from '@/apis/room'
import { LiveStatusEnum } from '@/apis/enums'
import { addRequestToken, clearRequestToken } from '@/apis'
import { asyncFetch } from '@/utils/asyncFetch'
import { clearToken, setToken } from '@/constant/key'

import { Auth } from './models/Auth'
import { createLoadingEffect } from './loading'

class AuthStore {
  constructor() {
    makeAutoObservable(this)
    return createLoadingEffect(this, 'AuthStore')
  }

  @observable
  user?: Auth

  @action
  async login(params: ILoginParams) {
    return await asyncFetch(() => login(params), {
      onSuccess: ({ data }) => {
        addRequestToken(data)
        setToken(params.roomId, data)
      }
    })
  }

  @action
  async logout() {
    await asyncFetch(() => logout(), {
      onSuccess: () => {
        clearToken(this.roomId)
        clearRequestToken()
      }
    })
  }

  @observable roomId: number = 0
  @observable roomMeta: IRoomInfo | null = null

  @computed
  get isLiving() {
    return this.roomMeta?.livingStatus === LiveStatusEnum.ON
  }

  setRoomId(roomId: number) {
    this.roomId = roomId
  }

  @action
  async getRoomInfo() {
    await asyncFetch(queryRoomInfo, {
      onSuccess: ({ data }) => {
        this.setRoomId(data.id)
        this.roomMeta = data
      },
    })
    await this.queryPushStream()
  }

  @observable pushStream: IPushStream = {
    webrtc: '',
  }

  @action
  async queryPushStream() {
    await asyncFetch(queryPushStreamInfo, {
      onSuccess: ({ data }) => {
        this.pushStream = data
      },
    })
  }

  @action
  updateLivingStatus(status: LiveStatusEnum) {
    // @ts-ignore
    this.roomMeta = {
      ...this.roomMeta,
      livingStatus: status,
    }
  }

  totalOnline: number = 0
  setTotalOnline(nums: number) {
    this.totalOnline = nums
  }

  @action
  async startLive() {
    return await asyncFetch(startLive, {
      onSuccess: () => {
        this.updateLivingStatus(LiveStatusEnum.ON)
      },
    })
  }

  @action
  async stopLive() {
    return await asyncFetch(stopLive, {
      loadingMsg: '操作',
      loadingSuccessMsg: '关闭',
      onSuccess: () => {
        this.updateLivingStatus(LiveStatusEnum.ON)
      },
    })
  }
}

export default new AuthStore()
