import orcaRequest from './'
import { CommonRes } from './interface'

export interface ILoginParams {
  roomId: number
  nickname: string
  password: string
}

export const login = (loginPayload: ILoginParams): Promise<CommonRes<string>> =>
  orcaRequest.post('/v2/cross/login', loginPayload)

export const logout = () =>
  orcaRequest.post('/v2/cross/logout')
