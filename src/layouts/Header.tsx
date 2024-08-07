import React from 'react'
import { Tag, Modal } from 'antd'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'

import { LiveStatusEnum } from '@/apis/enums'
import { authStore } from '@/stores'
import { logout } from '@/apis/login'
import logo from '@/assets/logo/logo.png'
import useOrcaRequest from '@/hooks/useRequest'
import { clearToken } from '@/constant/key'
import { clearRequestToken } from '@/apis'
import { orcaEvent } from '@/utils/event'

import './index.less'

export const ModuleRouteMap = {
  LOGIN: '/login',
  HOME: '/broadcast',
  FEED_BACK: '/feedback',
}

const HEADER = () => {
  const nav = useNavigate()
  const { roomMeta, totalOnline } = authStore

  const [{ runAsync: logoutAction }] = useOrcaRequest(logout, { manual: true }, {
    onSuccess: () => {
      clearToken(authStore.roomId)
      clearRequestToken()
      nav('login', {
        replace: true,
      })
    },
  })

  const renderBroadcastStatusTag = () => {
    switch(roomMeta?.livingStatus) {
      case LiveStatusEnum.ON:
        return (
          <Tag key="on" color="#409EFF" style={{ marginLeft: 4 }}>直播中</Tag>
        )
      default:
        return (
          <Tag key="un-start" style={{ marginLeft: 4 }}>未开始</Tag>
        )
    }
  }

  const handleLogout = () => {
    Modal.confirm({
      title: '确定要登出吗？',
      okText: '确定',
      cancelText: '留下',
      onOk: () => {
        orcaEvent.emit('logout', {})
        setTimeout(() => {
          logoutAction()
        }, 200)
      },
    })
  }

  return (
    <div className="orca-anchor-layout-header">
      <div className='header-left'>
        <img
          className='logo'
          style={{ width: 40, height: 40 }}
          src={logo}
          onClick={() => {
            nav('/')
          }}
        />
        <div className="name">虎鲸云</div>
      </div>
      <div className="header-content">
        <span style={{ fontWeight: 500, marginRight: 18, fontSize: 18, color: '#333333' }}>{authStore.roomMeta?.name}</span>
        {renderBroadcastStatusTag()}
        <span style={{ color: '#555', display: 'flex', alignItems: 'center' }}>
          <i className="online-mans__icon" />
          {totalOnline}人
        </span>
        <a className="logout-btn" onClick={() => { handleLogout() }}>退出登录</a>
      </div>
    </div>
  )
}

export default observer(HEADER)
