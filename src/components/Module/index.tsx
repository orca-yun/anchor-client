import React from 'react'
import cls from 'classnames'

import './index.less'

interface IModule {
  className?: string
  title?: React.ReactNode
  children?: React.ReactNode
  contentStyle?: any
}

const Module: React.FC<IModule> = (props) => {
  const { className, title, children, contentStyle = {} } = props

  return (
    <div className={cls('module-wrapper', className)}>
      {title && (
        <div className="module-wrapper__header">
          {title}
          {/*{actions && <div className="module-wrapper__header-actions">{actions}</div>}*/}
        </div>
      )}
      <div className="module-wrapper__content" style={contentStyle}>
        {children}
      </div>
    </div>
  )
}

export default Module
