import React, { useState, useEffect } from 'react'
import { Modal, Upload as AUpload, Button, message, Empty, Spin } from 'antd'
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import cls from 'classnames'

import { settingStore } from '@/stores'
import useRequest from '@/hooks/useRequest'
import { callModalSync, IModalSharedProps } from '@/utils/callModalSync'
import { uploadCourseware, queryCoursewareList, ICourseware, deleteCourseware } from '@/apis/anchor'

import './CoursewareManageModal.less'

interface ICoursewareManageModal {
  selectedCourseware: ICourseware | null
}

const CoursewareManageModal: React.FC<IModalSharedProps & ICoursewareManageModal> = (props) => {
  const { selectedCourseware, onConfirm, onCancel } = props

  const [selected, setSelected] = useState<number | undefined>(selectedCourseware?.id)
  const [{ data: response, loading: isQuerying, runAsync: query }] = useRequest(queryCoursewareList, {}, {})
  const [{ runAsync: uploadAction, loading }] = useRequest(uploadCourseware, { manual: true }, {
    loadingMsg: '上传',
  })
  const [{ runAsync: deleteAction }] = useRequest(deleteCourseware, { manual: true }, {
    loadingMsg: '删除',
    onSuccess: () => {
      query()
    },
  })

  const data = (response?.data || []).filter((item) => item.images.length > 0)

  useEffect(() => {
    if (!data.length || !settingStore.selectedCourseware) return
    if (!data.find((item) => item.id === settingStore.selectedCourseware?.id)) {
      settingStore.setCurCourseware(null)
      return
    }
  }, [data])

  const beforeUpload = ({ file }: { file: File }) => {
    const isFileValid = file.type === 'application/pdf'
    if (!isFileValid) {
      message.error('只支持上传 PDF 格式！');
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    uploadAction(formData)
  }

  const handleDelete = (item: ICourseware) => {
    Modal.confirm({
      title: '确定删除该课件？',
      onOk: () => {
        deleteAction({
          id: item.id,
        })
      },
    })
  }

  return (
    <Modal
      className="courseware-manage__modal"
      open
      title="选择课件"
      onCancel={onCancel}
      onOk={() => {
        onConfirm(selected ? data.find((item) => item.id === selected) : undefined)
      }}
    >
      <div className="courseware-manage__modal-content">
        <Spin spinning={isQuerying}>
          <div style={{ color: '#555' }}>
            课件上传可能存在延迟，您可以手动
            <a onClick={() => { query() }}>刷新</a>
            课件列表~
          </div>
          <div className="courseware-item__list">
            {
              data.length
                ? (
                  data.map((item) => (
                    <div
                      key={item.id}
                      className={cls('courseware-item', { selected: item.id === selected })}
                      onClick={() => { setSelected(item.id) }}
                    >
                      <div className="img-wrapper">
                        {
                          item.id === selected && (
                            <div className="selected-wrapper">
                              <CheckCircleOutlined />
                            </div>
                          )
                        }
                        <img src={item.images[0]} alt="" />
                      </div>
                      <div className="courseware-name">
                        <div>{item.name}</div>
                        <DeleteOutlined
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item)
                          }}
                        />
                      </div>
                    </div>
                  ))
                )
                : (
                  <Empty description="暂无课件哦" />
                )
            }
          </div>
          <div className="footer">
            <AUpload
              // className="img-upload"
              name="img"
              // accept="image/jpeg,image/png"
              showUploadList={false}
              customRequest={beforeUpload as any}
            >
              <Button size="large" type="primary" loading={loading} disabled={loading}>上传课件</Button>
            </AUpload>
          </div>
        </Spin>
      </div>
    </Modal>
  )
}

export const callCoursewareModal = (props: ICoursewareManageModal) => callModalSync(CoursewareManageModal, props)
