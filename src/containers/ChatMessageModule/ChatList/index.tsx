import React, { useEffect, useRef, useState } from 'react'
import _ from 'lodash'

import useRequest from '@/hooks/useRequest'
import { IMsg, CommandTypeEnum, withDrawMsg } from '@/apis/audit'
import { useSetToBL } from '@/hooks/asyncHooks/useBL'
import { useSetToMute } from '@/hooks/asyncHooks/useBanChat'
import { OperationOptions } from '@/constant/locale'
import { BizType } from '@/apis/socket'

import ChatItem from '../ChatItem'
import GiftMsg from '../ChatItem/GiftMsg'
import SystemMsg from '../ChatItem/SystemMsg'

import './index.less'

const MAX_LIMIT = 200

export type IChat = IMsg & { bizType?: BizType }

interface IChatList {
  data: IChat[]
  onReply: (item: IChat) => void
}

const ChatList: React.FC<IChatList> = (props) => {
  const { data, onReply } = props
  const withDrawInfo = useRef<IChat | null>()
  const listRef = useRef<any>()
  const isAtBottom = useRef(true)
  const messagesEndRef = useRef<any>()
  // 聊天池子
  const [msgPool, setMsgPool] = useState<IChat[]>([])
  // 未读消息
  const [unRead, setUnRead] = useState<IChat[]>([])

  const removeMsg = (index: number) => {
    if (index < 0) return
    setMsgPool((v) => v.filter((item, i) => i !== index))
  }

  const [{ runAsync: widthDrawAction }] = useRequest(withDrawMsg, { manual: true }, {
    ...OperationOptions,
    onSuccess: () => {
      if (!withDrawInfo.current) return
      removeMsg(msgPool.findIndex((item) => item.msgUid === withDrawInfo.current?.msgUid))
      withDrawInfo.current = null
    },
  })
  const [{ runAsync: setToBL }] = useSetToBL({})
  const [{ runAsync: setToMute }] = useSetToMute({})

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        listRef.current.scrollTop = listRef.current.scrollHeight
        // messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
      }, 50)
    }
  }

  useEffect(() => {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.target === messagesEndRef.current) {
          if (entry.isIntersecting) setUnRead([])
          isAtBottom.current = entry.isIntersecting
        }
      })
    }, {
      threshold: 0.2,
      root: listRef.current,
    })
    if (messagesEndRef.current) io.observe(messagesEndRef.current)

    return () => {
      if (messagesEndRef.current) io.disconnect()
    }
  }, [])

  const add = (items: IChat[], cancelItems: IChat[]) => {
    const cancelMap = _.keyBy(cancelItems, 'msgUid')
    setMsgPool((v) => {
      let nextV = v
        .slice()
        .filter((item) => !cancelMap[item.msgUid])
      while(nextV.length >= MAX_LIMIT) {
        nextV.shift()
      }
      return nextV.concat(...items)
    })
  }

  useEffect(() => {
    if (!data.length) return

    const cancelMsg: IChat[] = []
    const normal: IChat[] = []
    data.forEach((item) => {
      if (item.msgType === CommandTypeEnum.Cancel) {
        cancelMsg.push(item)
      } else {
        normal.push(item)
      }
    })
    add(normal, cancelMsg)
    /**
     * TODO:
     * 1. 鼠标hover到某个操作项上 不自动滚动
     * 2. 如果最新一条是助理本人发的 自动浮动到底部
     * */
    if (isAtBottom.current) {
      scrollToBottom()
    } else {
      // 加入未读消息池
      setUnRead((v) => v.concat(...normal))
    }
  }, [data])

  const handleCancel = (item: IChat) => {
    withDrawInfo.current = item
    widthDrawAction(item.msgUid)
  }

  const handleBanChat = (item: IChat) => {
    setToMute({
      uid: item.senderUid,
      nickname: item.senderName,
    })
  }

  const handleSetToBl = (item: IChat) => {
    setToBL({
      uid: item.senderUid,
      nickname: item.senderName,
    })
  }

  const handleVisibleChange = (item: IChat, visible: boolean) => {
    if (isAtBottom.current || !visible) return
    setUnRead((v) => v.filter((record) => record !== item))
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-container__main" ref={listRef}>
        {
          msgPool.map((item) => {
            // @ts-ignore
            if (item.bizType === BizType.SYSTEM_MSG) return (<SystemMsg key={item.uuid} data={item} onVisibleChange={handleVisibleChange} />)
            // @ts-ignore
            if (item.bizType === BizType.GIFT) return (<GiftMsg key={item.uuid} data={item} onVisibleChange={handleVisibleChange} />)
            return (
              <ChatItem
                key={item.msgUid}
                data={item}
                onVisibleChange={handleVisibleChange}
                onCancel={handleCancel}
                onReply={onReply}
                onBanChat={handleBanChat}
                onSetBL={handleSetToBl}
              />
            )
          })
        }
        <div ref={messagesEndRef} style={{ height: '1px', opacity: 0 }} />
      </div>
      {
        !!unRead.length && (
          <div className="un-read-msg__tips" onClick={() => { scrollToBottom() }}>{unRead.length}条未读消息</div>
        )
      }
    </div>
  )
}

export default ChatList
