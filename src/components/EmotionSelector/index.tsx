import React, { useState } from 'react'
import { Popover } from 'antd'

import { WxEmotions } from '@/utils/emotion'

import './index.less'

export const wxEmotion = new WxEmotions()

interface IEmotionSelector {
  children: React.ReactNode
  onSelect: (str: string) => void
}

const EmotionSelector: React.FC<IEmotionSelector> = (props) => {
  const { children, onSelect } = props
  const [open, setOpen] = useState(false)
  const handleSelect = (index: number) => {
    onSelect(wxEmotion.idToText(index))
    setOpen(false)
  }
  const renderContent = () => {
    return (
      <div className="emotion-popover__content">
        {
          wxEmotion.emotionSrcList.map((item, index) => (
            <div
              key={item}
              className="emoji-item"
              onClick={() => { handleSelect(index) }}
            >
              <img src={item} alt="" />
            </div>
          ))
        }
      </div>
    )
  }
  return (
    <Popover
      open={open}
      className="emotion-popover"
      trigger={['click']}
      content={renderContent()}
      onOpenChange={setOpen}
    >
      {children}
    </Popover>
  )
}

export default EmotionSelector
