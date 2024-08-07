import React from 'react'
import { Spin } from 'antd'

import EmptyHint from '../Empty'
import type { IEmptyHint } from '../Empty'

interface IDataToggleModule {
  loading?: boolean
  children: React.ReactNode
  empty: boolean
  emptyWrapperHeight?: number
  emptyHintProps: IEmptyHint
}

const DataToggleModule: React.FC<IDataToggleModule> = (props) => {
  const { loading, empty, children, emptyHintProps, emptyWrapperHeight = 100 } = props
  return (
    <Spin spinning={loading}>
      {empty ? (
        <div className="orca-flex-center-layout" style={{ height: emptyWrapperHeight }}>
          <EmptyHint {...emptyHintProps} />
        </div>
      ) : (
        children
      )}
    </Spin>
  )
}

export default DataToggleModule
