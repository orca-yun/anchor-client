import { orcaEvent } from './event'
import SocketManage from './socketManage'

export enum SocketConnectEnum {
  UnInit = -1,
  UnConnect = 0,
  Connected = 1,
}

class OrcaSocket {
  public orcaEvent = orcaEvent
  public sockets: Record<string, SocketManage>
  public states: Record<string, boolean>
  constructor(socketManages: SocketManage[]) {
    this.sockets = socketManages.reduce((a, b) => ({
      ...a,
      [b.channel]: b,
    }), {})
    this.states = socketManages.reduce((a, b) => ({
      ...a,
      [b.channel]: SocketConnectEnum.UnInit,
    }), {})
  }

  updateSocketState(channel: string, connected: boolean) {
    this.orcaEvent.emit(`${channel}:state:change`, Number(connected))
  }

  init(channel: string, query: any) {
    const socket = this.sockets[channel]?.socketInstance
    if (!socket) {
      this.sockets[channel]?.init(query)
      this.initEvents(channel)
      return
    }
    this.updateSocketState(channel, socket.connected)
  }

  private initEvents(channel: string) {
    const socket = this.sockets[channel]?.socketInstance
    if (!socket) return
    socket.on('connect', () => {
      this.updateSocketState(channel, socket.connected)
    })
    socket.on('connect_error', () => {
      this.updateSocketState(channel, socket.connected)
    })
    socket.on('disconnect', () => {
      this.updateSocketState(channel, socket.connected)
    })
  }

  dispose(channel: string) {
    this.sockets[channel]?.dispose()
  }
}

export default new OrcaSocket([
  new SocketManage({
    channel: 'chat',
    url: `${import.meta.env.VITE_APP_SOCKET_API as string}/im`,
  }),
  new SocketManage({
    channel: 'draw',
    url: `${import.meta.env.VITE_APP_DRAW_SOCKET_API as string}/draw`,
  }),
])
