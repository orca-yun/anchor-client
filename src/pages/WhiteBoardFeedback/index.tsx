import React, { useRef, useEffect, useMemo } from 'react'
import { fabric } from 'fabric'
import { StaticCanvas } from 'fabric/fabric-impl'
import { observer } from 'mobx-react-lite'

import MyFabricCanvas from '@/utils/fabric'
import { safeJsonParser } from '@/utils/safeJsonParser'
import { useSocket } from '@/hooks/useSocket'
import { authStore } from '@/stores'
import { getToken } from '@/constant/key'

const Slave = () => {
  const canvasRef = useRef<any>()
  const fabricCanvasInstance = useRef<StaticCanvas>()

  const query = useMemo(() => {
    if (!authStore.roomMeta) return null
    return {
      token: getToken(authStore.roomId),
      room: authStore.roomId,
    }
  }, [authStore.roomMeta])

  const { message, socket } = useSocket('draw', ['message'], query, 0)

  const draw = (data: any) => {
    const canvas = fabricCanvasInstance.current
    if (!canvas) return
    const { originSize, transforms } = data
    canvas?.loadFromJSON(data, () => {
      if (originSize && originSize.width && originSize.height) {
        const newScreenWidth = canvas?.getWidth()
        const originalWidth = originSize.width
        const newZoom = newScreenWidth / originalWidth
        const [s1, x1, y1, s2, x2, y2] = transforms
        // 调整画布的视口变换
        canvas.setViewportTransform([s1 * newZoom, x1, y1, s2 * newZoom, x2 * newZoom, y2 * newZoom]) // 重新渲染画布
        canvas.renderAll()
      }
    })
  }

  useEffect(() => {
    if (!canvasRef.current || fabricCanvasInstance.current) return
    fabricCanvasInstance.current = new fabric.StaticCanvas(MyFabricCanvas.createCanvas(canvasRef.current), {
      isDrawingMode: false,
      selection: false,
      includeDefaultValues: false,
    })
    const canvas = fabricCanvasInstance.current
    canvas.setBackgroundColor('#FFF', canvas.renderAll.bind(canvas))
  }, [])

  useEffect(() => {
    if (!message.length) return
    message.forEach((item: any) => {
      const { data } = item
      const fabricData = safeJsonParser(data, {})
      draw(fabricData)
    })
  }, [message])

  return (<div className="slave-page">
    <div style={{ width: 400, height: 200 }} className="canvas-area" ref={canvasRef} />
  </div>)
}

export default observer(Slave)
