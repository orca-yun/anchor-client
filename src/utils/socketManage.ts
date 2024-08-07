import io, { Socket } from 'socket.io-client'

import { ManagerOptions } from 'socket.io-client/build/esm/manager'
import { SocketOptions } from 'socket.io-client/build/esm/socket'

interface ISocketManageProps {
  channel: string
  url: string
  socketOptions?: Partial<ManagerOptions & SocketOptions>
}

const DEFAULT_OPTIONS = {
  reconnectionDelay: 10000,
  reconnectionDelayMax: 1000 * 30,
  path: '',
  forceNew: true,
  transports: ['websocket'],
}

export default class SocketManage {
  public channel: string = ''
  public socketInstance: Socket | null
  public socketUrl: string
  public socketOptions: ISocketManageProps['socketOptions'] = {}

  constructor(props: ISocketManageProps) {
    const { channel, url, socketOptions } = props
    if (!channel) throw new Error('socketManage need name param!')
    this.channel = channel
    this.socketUrl = url
    this.socketInstance = null
    this.socketOptions = socketOptions || {}
  }

  init(query: Record<string, any>) {
    if (this.socketInstance) return
    this.socketInstance = io(this.socketUrl, {
      ...DEFAULT_OPTIONS,
      ...this.socketOptions,
      query,
    })

    // 服务器拒绝连接
    this.socketInstance.io.on('error', (error) => {
      console.log(error)
    })
  }

  dispose() {
    this.socketInstance?.disconnect()
  }
}
