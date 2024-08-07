import React from 'react'
import { Upload as AUpload, message } from 'antd'

import useRequest from '@/hooks/useRequest'
import { upload } from '@/apis/common'

import './index.less'

const Upload: React.FC<{ onUploadSuccess: (url: string) => void }> = ({ onUploadSuccess }) => {
  const [{ runAsync, loading }] = useRequest(upload, { manual: true }, {
    loadingMsg: '上传中...',
    loadingSuccessMsg: '上传成功!',
    onSuccess: ({ data }) => {
      onUploadSuccess(data)
    },
  })
  const beforeUpload = ({ file }: { file: File }) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片！');
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    runAsync(formData)
  }
  return (
    <AUpload
      className="img-upload"
      name="img"
      accept="image/jpeg,image/png"
      showUploadList={false}
      customRequest={beforeUpload as any}
    >
      <div className="upload-trigger-icon" />
    </AUpload>
  )
}

export default Upload
