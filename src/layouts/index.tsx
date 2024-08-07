import React, {useEffect, useMemo} from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Spin } from 'antd'
import i18n from 'i18next'
import { LoadingOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react-lite'

import { getToken } from '@/constant/key'
import { authStore, loadingEffectGetter } from '@/stores'
import { addRequestToken } from '@/apis'
import { orcaEvent } from '@/utils/event'
import { orcaModal } from '@/Antd'
import { MODAL_ID_MAP, ORCA_MODAL_ID } from '@/Antd/modal'
import { useSocket } from '@/hooks/useSocket'
import { LiveStatusEnum } from '@/apis/enums'

import Header, { ModuleRouteMap } from './Header'

import './index.less'

interface ILayout {
  registerPath: string
  indexRoute: string
}

const Layout: React.FC<ILayout> = ({indexRoute, registerPath}) => {
  const getRoomInfoLoading = loadingEffectGetter('AuthStore/getRoomInfo')
  const {pathname} = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const roomId = params.get('roomId')

  useEffect(() => {
    if (pathname === registerPath) {
      navigate(indexRoute, { replace: true })
      return
    }
  }, [pathname, roomId])

  const query = useMemo(() => {
    if (!authStore.roomMeta) return null
    return {
      token: getToken(authStore.roomId),
      room: authStore.roomId,
    }
  }, [authStore.roomMeta])

  const { message, dispose } = useSocket('chat', ['ctrl'], query)

  useEffect(() => {
    if (!roomId) {
      navigate(ModuleRouteMap.LOGIN, { replace: true })
      return
    }
    const token = getToken(+roomId)
    if (!token) {
      navigate(ModuleRouteMap.LOGIN, { replace: true })
      return
    }
    addRequestToken(token)
    orcaEvent.on('token-invalid', () => {
      orcaModal.error({
        [ORCA_MODAL_ID]: MODAL_ID_MAP.TokenExpired,
        title: i18n.t('登录信息过期，请重新登录'),
        onOk: () => {
          navigate(ModuleRouteMap.LOGIN, { replace: true })
        },
      })
    })
    authStore.getRoomInfo()
    orcaEvent.on('logout', dispose)
    return () => {
      orcaEvent.off('token-invalid')
    }
  }, [])

  useEffect(() => {
    if (!message.length) return
    message.forEach((item: any) => {
      const { bizType, data } = item
      if (bizType === 'live_status' && data) {
        authStore.updateLivingStatus(data === '0' ? LiveStatusEnum.ON : LiveStatusEnum.OFF)
        return
      }
      if (bizType === 'total_online_user') {
        authStore.setTotalOnline(+data)
        return
      }
    })
  }, [message])

  return (
    <div className="orca-anchor-layout">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} />} spinning={getRoomInfoLoading} fullscreen />
      <Header />
      <div className="orca-anchor-layout-content">
        <Outlet />
      </div>
    </div>
  )
}

export default observer(Layout)
