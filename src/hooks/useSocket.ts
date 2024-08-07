import { useEffect, useState, useCallback, useRef } from 'react'

import orcaSocket from '@/utils/orcaSocket'

export const useSocket = (channel: string, msgTypes: string[], query: any, timeout = 200) => {
  const [state, setState] = useState(-1)
  const [message, setMessage] = useState<any>([])
  const cachedData = useRef<any[]>([])
  const timer = useRef<NodeJS.Timeout>()

  const onClose = useCallback(() => {
    orcaSocket.dispose(channel)
  }, [])

  const add = useCallback((e: any) => {
    cachedData.current = cachedData.current.concat(e)
    if (!timer.current) {
      timer.current = setInterval(() => {
        setMessage(cachedData.current.slice())
        cachedData.current = []
        clearInterval(timer.current)
        // @ts-ignore
        timer.current = null
      }, timeout)
    }
  }, [])

  useEffect(() => {
    if (!channel || !query) return
    orcaSocket.init(channel, query)
    const socket = orcaSocket.sockets[channel]?.socketInstance
    if (socket) {
      msgTypes.forEach((msg) => {
        socket.on(msg, add)
      })
    }
    orcaSocket.orcaEvent.on(`${channel}:state:change`, setState)
    return () => {
      if (socket) {
        msgTypes.forEach((msg) => {
          socket.off(msg, add)
        })
      }
      orcaSocket.orcaEvent.off(`${channel}:state:change`, setState)
    }
  }, [channel, query])

  useEffect(() => {
    return () => {
      channel && orcaSocket.dispose(channel)
    }
  }, [])

  return {
    state,
    message,
    onClose,
    socket: orcaSocket.sockets[channel]?.socketInstance,
    dispose: () => orcaSocket.dispose(channel),
  }
}
