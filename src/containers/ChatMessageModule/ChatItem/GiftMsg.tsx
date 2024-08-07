import React, { useRef, useMemo } from 'react'

import useVisibleObserver from '@/hooks/useVisibleObserver'
import OChatItem from '@/components/ChatItem'
import { IGift } from '@/apis/marketing'

import { ISystemMsgModel } from './SystemMsg'

interface IGiftMsg {
  data: ISystemMsgModel & {
    giftItem: IGift
  }
  onVisibleChange: (item: any, visible: boolean) => void
}

const GiftMsg: React.FC<IGiftMsg> = ({ data, onVisibleChange }) => {
  const itemRef = useRef<any>()
  const [show, height] = useVisibleObserver(itemRef.current, {
    onVisibleChange: (visible) => {
      onVisibleChange(data, visible)
    }
  })

  const parsedData = useMemo(() => JSON.parse(data.data), [data.data])

  return (
    <div className="chat-item gift-msg-item" ref={itemRef} style={{ height: show ? 'auto' : height }}>
      {
        show && (
          <OChatItem
            data={parsedData}
          >
            <div className="gift-msg-item__msg">
              <span>送出了</span>
              <i className="gift-icon" style={{ backgroundImage: `url(${parsedData.giftItem.img})` }} />
            </div>
          </OChatItem>
        )
      }
    </div>
  )
}

export default GiftMsg
