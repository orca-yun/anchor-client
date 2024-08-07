import React from 'react'
import { createHashRouter, Navigate } from 'react-router-dom'

import { ModuleRouteMap } from '@/layouts/Header'
import Layout from '@/layouts'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import DrawFeedBack from '@/pages/WhiteBoardFeedback'
import NotFound from '@/pages/NotFound'

export const genRoutes = () => {
  return createHashRouter([
    {
      path: ModuleRouteMap.LOGIN,
      element: (<Login />),
    },
    {
      path: '/',
      element: (<Layout registerPath="/" indexRoute={ModuleRouteMap.HOME} />),
      children: [
        {
          path: ModuleRouteMap.HOME,
          element: (<Home />),
        },
        {
          path: ModuleRouteMap.FEED_BACK,
          element: (<DrawFeedBack />),
        },
        {
          path: '*',
          element: (<Navigate replace to={ModuleRouteMap.HOME} />),
        },
      ],
    },
    { path: "*", element: <NotFound indexRoute="/" /> },
  ])
}
