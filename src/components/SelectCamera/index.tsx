import React from 'react'
import { Modal, Button, Row, Col } from 'antd'

import { callModalSync, IModalSharedProps } from '@/utils/callModalSync'

import './index.less'

interface ISelectCameraModal {
  devices: TXMediaDeviceInfo[]
}

const SelectCameraModal: React.FC<ISelectCameraModal & IModalSharedProps> = (props) => {
  const { devices, onCancel, onConfirm } = props
  return (
    <Modal
      open
      title="请选择摄像头设备"
      onCancel={onCancel}
      footer={null}
    >
      <div className="camera-selector-wrapper">
        {
          devices.map((item, index) => (
            <Row
              gutter={16}
              key={item.deviceId}
              onClick={() => {
                onConfirm(item.deviceId)
              }}
              className="orca-flex-center-layout"
            >
              <Col span={3}>设备{index + 1}</Col>
              <Col span={17}>{item.deviceName}</Col>
              <Col span={4}>
                <Button type="primary" style={{ width: '100%' }}>选择</Button>
              </Col>
            </Row>
          ))
        }
      </div>
    </Modal>
  )
}

export const callSelectCameraModal = (props: ISelectCameraModal) => callModalSync(SelectCameraModal, props)
