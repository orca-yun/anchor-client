import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'

import themeConfig from './theme.config'
import { genRoutes } from './routes'

const router = genRoutes()

function App() {
  return (
    <ConfigProvider
      theme={themeConfig}
      locale={zhCN}
    >
      <AntdApp>
        <RouterProvider router={router}/>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
