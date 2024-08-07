import React from 'react'
import dayjs from 'dayjs'
import cls from 'classnames'

import { IMsg, SenderTypeEnum, SenderTypeText } from '@/apis/audit'

import './index.less'

interface IOChatItem {
  data: IMsg
  children: React.ReactNode
  actions?: React.ReactNode
}

const OChatItem: React.FC<IOChatItem> = (props) => {
  const { data, actions, children } = props
  const renderSenderTag = () => {
    const { senderType } = data
    return (
      // @ts-ignore
      <span className={cls('sender-type__tag', `tag-${senderType}`)}>{SenderTypeText[senderType]}</span>
    )
  }
  return (
    <div className="orca-chat-item">
      <div className="orca-chat-item__avatar">
        {
          data.senderHeadIco
            ? <i className="avatar" style={{ backgroundImage: `url(${data.senderHeadIco})` }} />
            : <span className="avatar default-icon">{data.senderName.substring(0, 1)}</span>
        }
      </div>
      <div className="orca-chat-item__user">
        <div className="orca-chat-item__user-info">
          {
            (![SenderTypeEnum.Audience, SenderTypeEnum.Robot].includes(data.senderType)) && renderSenderTag()
          }
          {/* @ts-ignore */}
          <span className="user-name">{data.senderName}</span>
          <span className="msg-create-time">{dayjs(data.ts).format('HH:mm:ss')}</span>
        </div>
        <div className="orca-chat-item__children">
          {children}
        </div>
        {
          actions && (
            <div className="orca-chat-item__operations">
              {actions}
            </div>
          )
        }
      </div>
    </div>
  )
}

export default OChatItem
