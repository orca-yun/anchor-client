import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import i18n from 'i18next'
import { Button, Form, Input, notification } from 'antd'

import authStore from '@/stores/authStore'
import { observer } from 'mobx-react-lite'
// import { clearToken } from '@/constant/key'
import { clearRequestToken } from '@/apis'
import logo from '@/assets/logo/logo-big.png'

import './index.less'

const { Item: FormItem } = Form

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm<{ roomId: number; nickName: string, password: string }>()

  useEffect(() => {
    clearRequestToken()
  }, [])

  const handleSubmit = async() => {
    const data = form.getFieldsValue()
    const loginSuccess = await authStore.login(data as any)
    if (loginSuccess) {
      notification.success({
        message: i18n.t('登录成功~'),
        duration: 3,
      })
      navigate(`/broadcast?roomId=${data.roomId}`, {
        replace: true,
      })
    }
  }

  return (
    <div className='login'>
      <div className='login-left'>
        <div className="company-desc">
          <img src={logo} style={{ width: 300, height: 300 }} alt="" />
          <div className="company-desc__name">虎鲸云</div>
        </div>
      </div>
      <div className='login-right'>
        <div className='please'>
          主播请登录
        </div>
        <Form
          form={form}
          className='login-form'
          onFinish={handleSubmit}
          initialValues={{
            roomId: '',
            nickname: '',
            password: '',
          }}
        >
          <FormItem name="roomId" rules={[{
            required: true,
            message: i18n.t('请输入房间号'),
          }]}>
            <Input className='login-form-item' placeholder={i18n.t('请输入房间号')} />
          </FormItem>
          <Form.Item name='nickname' rules={[
            {
              required: true,
              message: i18n.t('请输入昵称'),
            }
          ]}>
            <Input
              className='login-form-item'
              placeholder={i18n.t('请输入昵称')}
            />
          </Form.Item>
          <Form.Item name='password' rules={[
            {
              required: true,
              message: i18n.t('请输入密码'),
            }
          ]}>
            <Input.Password
              className='login-form-item'
              placeholder={i18n.t('请输入密码')}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              block
              className='login-btn'
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default observer(Login)
