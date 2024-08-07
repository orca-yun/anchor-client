import React, { useMemo, useState, useRef } from 'react'
import { Spin, Input, Tooltip, message as Message } from 'antd'
import { observer } from 'mobx-react-lite'
import i18n from 'i18next'

import Module from '@/components/Module'
import Upload from '@/components/Upload'
import EmotionSelector from '@/components/EmotionSelector'
import { authStore } from '@/stores'
import { getToken } from '@/constant/key'
import { useSocket } from '@/hooks/useSocket'
import { CommandTypeEnum } from '@/apis/audit'
import { sendMsg } from '@/apis/audit'
import useRequest from '@/hooks/useRequest'
import { BizType } from '@/apis/socket'

import ChatList, { IChat } from './ChatList'

import './index.less'

const genInitialReplyInfo = () => ({
  msgType: CommandTypeEnum.Normal,
  value: '',
})

const ChatMessageModule = () => {
  const replyInputRef = useRef<any>()
  // 回复
  const [replyInfo, setReplyInfo] = useState<{
    msgType: CommandTypeEnum
    value: string
    data?: IChat
  }>(genInitialReplyInfo())

  const [{ runAsync: sendMsgAction }] = useRequest(sendMsg, { manual: true }, {
    loadingMsg: i18n.t('正在发送'),
    loadingSuccessMsg: i18n.t('发送成功'),
    onSuccess: () => {
      setReplyInfo(genInitialReplyInfo())
    },
  })

  const query = useMemo(() => {
    return authStore.roomMeta ? {
      token: getToken(authStore.roomId),
      room: authStore.roomId,
    } : null
  }, [authStore.roomMeta])

  const {
    state,
    message,
  } = useSocket('chat', ['message', 'ctrl'], query)

  const prevMessage = useMemo(() => {
    return message.filter((item: any) => {
      const { bizType } = item
      return !bizType || [BizType.GIFT, BizType.SYSTEM_MSG].includes(bizType)
    })
  }, [message])

  const handleSend = () => {
    if (!replyInfo.value) {
      Message.info(i18n.t('发送内容不能为空'))
      return
    }
    const { msgType, data } = replyInfo
    // 回复类型
    if (msgType === CommandTypeEnum.Reply && data) {
      sendMsgAction({
        msgType: CommandTypeEnum.Reply,
        data: data?.data,
        replyData: replyInfo.value,
      })
      return
    }
    sendMsgAction({
      msgType: CommandTypeEnum.Normal,
      data: replyInfo.value,
    })
  }

  const handleSetReplyInfo = (item: IChat) => {
    setReplyInfo({
      value: '',
      msgType: CommandTypeEnum.Reply,
      data: item,
    })
    setTimeout(() => {
      replyInputRef.current && replyInputRef.current.focus()
    })
  }

  const handleSendImg = (url: string) => {
    sendMsgAction({
      msgType: CommandTypeEnum.Img,
      data: url,
    })
  }

  return (
    <Module
      title={i18n.t('互动消息')}
      className="chat-manage-panel"
    >
      <Spin spinning={state !== 1} tip={i18n.t('公频连接中...')}>
        <div className="chat-manage-panel__chats">
          <ChatList
            data={prevMessage as any}
            onReply={handleSetReplyInfo}
          />
        </div>
        <div className="chat-manage-panel__actions">
          <div className="input-wrapper">
            {
              replyInfo.msgType === CommandTypeEnum.Reply && replyInfo.data?.senderName
                ? (
                  <Tooltip
                    open
                    placement="topLeft"
                    title={(
                      <div>
                        <div>{replyInfo.data.senderName} 说：{replyInfo.data.data}</div>
                        <a style={{ marginTop: 8 }} onClick={() => {
                          setReplyInfo(genInitialReplyInfo())
                        }}>{i18n.t('取消回复')}</a>
                      </div>
                    )}
                  >
                    <Input
                      placeholder="和大家一起互动起来吧~~"
                      ref={replyInputRef}
                      value={replyInfo.value}
                      onChange={(e) => {
                        setReplyInfo((v) => ({
                          ...v,
                          value: e.target.value,
                        }))
                      }}
                      onPressEnter={handleSend}
                    />
                  </Tooltip>
                )
                : (
                  <Input
                    placeholder="和大家一起互动起来吧~~"
                    ref={replyInputRef}
                    value={replyInfo.value}
                    onChange={(e) => {
                      setReplyInfo((v) => ({
                        ...v,
                        value: e.target.value,
                      }))
                    }}
                    onPressEnter={handleSend}
                  />
                )
            }
            <EmotionSelector
              onSelect={(str) => {
                setReplyInfo((v) => ({
                  ...v,
                  value: `${v.value}${str}`,
                }))
                replyInputRef.current.focus()
              }}
            >
              <i className="emoji-icon orca-bg-contain" />
            </EmotionSelector>
            <div className="send-btn" onClick={handleSend}>{i18n.t('发送')}</div>
          </div>
          <Upload onUploadSuccess={handleSendImg} />
        </div>
      </Spin>
    </Module>
  )
}

export default observer(ChatMessageModule)
