import React, { useRef, useEffect, useState } from 'react'
import { Space } from 'antd'

import { IMsg, CommandTypeEnum, SenderTypeEnum } from '@/apis/audit'
import { wxEmotion } from '@/components/EmotionSelector'
import OChatItem from '@/components/ChatItem'

import './index.less'

export interface IChatItem {
  data: IMsg
  onCancel: (item: IChatItem['data']) => void,
  onReply: (item: IChatItem['data']) => void
  onBanChat: (item: IChatItem['data']) => void
  onSetBL: (item: IChatItem['data']) => void
  onVisibleChange: (item: IChatItem['data'], visible: boolean) => void
}

const ChatItem: React.FC<IChatItem> = (props) => {
  const { data, onCancel, onReply, onBanChat, onSetBL, onVisibleChange } = props
  const itemRef = useRef<any>()
  const [height, setHeight] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (!itemRef.current) return
    setHeight(itemRef.current.getBoundingClientRect().height)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === itemRef.current) {
          setShow(entry.isIntersecting)
          onVisibleChange(data, entry.isIntersecting)
        }
      })
    }, {
      threshold: 0.2,
      root: itemRef.current.parentNode,
    })

    io.observe(itemRef.current)

    return () => {
      io.disconnect()
    }
  }, [])

  return (
    <div className="chat-item" ref={itemRef} style={{ height: show ? 'auto' : height }}>
      {
        show && (
          <OChatItem
            data={data}
            // actions={(
            //   <Space>
            //     <a onClick={() => { onCancel(data) }}>撤回</a>
            //     {
            //       data.senderType === SenderTypeEnum.Audience && (
            //         <>
            //           <a onClick={() => { onSetBL(data) }}>拉黑</a>
            //           <a onClick={() => { onBanChat(data) }}>禁言</a>
            //         </>
            //       )
            //     }
            //     {
            //       data.msgType !== CommandTypeEnum.Img && (<a onClick={() => { onReply(data) }}>回复</a>)
            //     }
            //   </Space>
            // )}
          >
            <>
              <div
                {...(data.msgType === CommandTypeEnum.Img ? {} : {
                  dangerouslySetInnerHTML: {
                    '__html': wxEmotion.parse(data.data),
                  }
                })}
                className="chat-item__msg"
              >
                {
                  data.msgType === CommandTypeEnum.Img
                    ? (
                      <div className="img-box" onClick={() => { window.open(data.data, '__blank') }}>
                        <img className="msg-image" src={data.data} alt="" />
                      </div>
                    )
                    : null
                }
              </div>
              {data.quotaData && (
                <div className="quota-data" dangerouslySetInnerHTML={{ '__html': wxEmotion.parse(data.quotaData) }} />
              )}
            </>
          </OChatItem>
        )
      }
    </div>
  )
}

export default ChatItem
