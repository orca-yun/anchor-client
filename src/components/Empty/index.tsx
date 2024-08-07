import React from 'react'
import cls from 'classnames'
// @ts-ignore
import { ReactComponent as EmptySVG } from '@/svgIcons/empty.svg'

import './EmptyHint.less'

export interface IEmptyHint {
  icon?: React.ReactNode
  wrapperStyle?: any
  emptyIconFontSize?: number
  wrapperClassName?: string
  desc?: React.ReactNode
  descStyle?: React.CSSProperties
}

const EmptyHint: React.FC<IEmptyHint> = (props) => {
  const {icon, wrapperStyle, emptyIconFontSize, wrapperClassName, desc, descStyle = {}} = props
  const iconStyle = {}
  if (emptyIconFontSize) {
    Object.assign(iconStyle, {
      width: `${emptyIconFontSize}px`,
      height: `${emptyIconFontSize}px`,
    })
  }
  return (
    <div className={cls('empty-hint-wrapper', wrapperClassName)} style={wrapperStyle || {}}>
      <div className="empty-hint-wrapper__content">
        {
          icon
            ?
            icon
            :
            <EmptySVG style={iconStyle} />
        }

        <div className="empty-hint-wrapper__desc" style={descStyle}>
          {desc}
        </div>
      </div>
    </div>
  )
}

export default EmptyHint
