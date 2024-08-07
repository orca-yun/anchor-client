import React, { useRef } from 'react'

import useVisibleObserver from '@/hooks/useVisibleObserver'
import { BizType } from '@/apis/socket'

export interface ISystemMsgModel {
  bizType: BizType
  data: string
  ts: number
  uuid: string
}

interface ISystemMsg {
  data: ISystemMsgModel
  onVisibleChange: (item: any, visible: boolean) => void
}

const SystemMsg: React.FC<ISystemMsg> = ({ data, onVisibleChange }) => {
  const itemRef = useRef<any>()
  const [show, height] = useVisibleObserver(itemRef.current, {
    onVisibleChange: (visible) => {
      onVisibleChange(data, visible)
    }
  })

  return (
    <div className="chat-item system-msg-item" ref={itemRef} style={{ height: show ? 'auto' : height }}>
      {
        show && (
          <div>{data.data}</div>
        )
      }
    </div>
  )
}

export default SystemMsg
