import { fabric } from 'fabric'
import { Canvas as ICanvas, IEvent, Point } from 'fabric/fabric-impl'

import { settingStore } from '@/stores'

import MyFabricCanvas from './fabric'

// 绘制矩形
export const registerRectDraw = (fabricCanvas: MyFabricCanvas) => {
  fabricCanvas.registerDrawMode('rect-draw', {
    map: new Map(),
    prevPointer: null,
    before(fabricCanvas) {
      fabricCanvas.canvas.isDrawingMode = false
      // 将所有object定义为不可选
      fabricCanvas.canvas.getObjects().forEach((item) => {
        this.map.set(item, !!item.get('selectable'))
        item.set({
          selectable: false,
        })
      })
      fabricCanvas.canvas.renderAll()
    },
    after(fabricCanvas) {
      fabricCanvas.canvas.getObjects().forEach((item) => {
        item.set({
          selectable: this.map.has(item) ? this.map.get(item): true,
        })
        this.map.delete(item)
      })
      fabricCanvas.canvas.renderAll()
    },
    getEvents() {
      return {
        'mouse:down': 'mouseDown',
        'mouse:move': 'mouseMove',
        'mouse:up': 'mouseUp',
      }
    },
    mouseDown(this: any, fabricCanvas: MyFabricCanvas, event: IEvent) {
      const activeObject = fabricCanvas.canvas.getActiveObject()
      if (!event.pointer || activeObject) return
      fabricCanvas.setIsDrawing(true)
      const { x, y } = fabricCanvas.canvas.getPointer(event.e)
      this.prevPointer = {
        x,
        y,
      }
      fabricCanvas.drawRect({
        left: x,
        top: y,
        width: 0,
        height: 0,
      })
    },
    mouseMove(this: any, fabricCanvas: MyFabricCanvas, event: IEvent) {
      if (!this.prevPointer || !fabricCanvas.isDrawing || !event.pointer || !fabricCanvas.currentShape) return
      const { x, y } = fabricCanvas.canvas.getPointer(event.e)
      const width = Math.abs(x - this.prevPointer.x)
      const height = Math.abs(y - this.prevPointer.y)
      fabricCanvas.currentShape.set({
        width,
        height,
      })
      // 手动修改可选区域
      fabricCanvas.currentShape.setCoords()
      // canvas重新渲染
      fabricCanvas.canvas.renderAll()
    },
    mouseUp(this: any, fabricCanvas: MyFabricCanvas, event: IEvent) {
      const { x, y } = fabricCanvas.canvas.getPointer(event.e) || { x: 0, y : 0 }
      // 鼠标未移动 删除并rerender
      if (x === this.prevPointer?.x && y === this.prevPointer?.y) {
        if (fabricCanvas.currentShape) fabricCanvas.canvas.remove(fabricCanvas.currentShape)
        fabricCanvas.canvas.renderAll()
      }
      fabricCanvas.setIsDrawing(false)
      fabricCanvas.setCurShape(null)
      this.prevPointer = null
      fabricCanvas.registerStack()
    },
  })
}

// 文本框
export const registerTextBox = (fabricCanvas: MyFabricCanvas) => {
  fabricCanvas.registerDrawMode('text-box', {
    map: new Map(),
    before(fabricCanvas) {
      fabricCanvas.canvas.isDrawingMode = false
      // 将所有object定义为不可选
      fabricCanvas.canvas.getObjects().forEach((item) => {
        this.map.set(item, !!item.get('selectable'))
        item.set({
          selectable: false,
        })
      })
      fabricCanvas.canvas.renderAll()
    },
    after(fabricCanvas) {
      fabricCanvas.canvas.getObjects().forEach((item) => {
        item.set({
          selectable: this.map.has(item) ? this.map.get(item): true,
        })
        this.map.delete(item)
      })
      fabricCanvas.canvas.renderAll()
    },
    getEvents() {
      return {
        'mouse:down': 'mouseDown',
        'mouse:up': 'mouseUp',
      }
    },
    mouseDown(this: any, fabricCanvas: MyFabricCanvas, event: IEvent) {
      let hasRemoved = false
      // 移除没有文字的textBox
      fabricCanvas.canvas.getObjects().forEach((item) => {
        if (item.type !== 'textbox') return
        // @ts-ignore
        if (!item.text) {
          hasRemoved = true
          fabricCanvas.canvas.remove(item)
        }
      })
      if (hasRemoved) fabricCanvas.canvas.renderAll()
      fabricCanvas.setIsDrawing(true)
      const activeObject = fabricCanvas.canvas.getActiveObject()
      if (!event.pointer || activeObject) return
      const { x, y } = fabricCanvas.canvas.getPointer(event.e)
      fabricCanvas.drawTextBox({
        left: x,
        top: y,
        width: 100,
      })
    },
    mouseUp(this: any, fabricCanvas: MyFabricCanvas) {
      fabricCanvas.setIsDrawing(false)
    },
  })
}

// 自由绘制
export const registerFreeDraw = (fabricCanvas: MyFabricCanvas) => {
  fabricCanvas.registerDrawMode('free-draw', {
    before: ({ canvas }) => {
      fabricCanvas.canvas.isDrawingMode = true
      canvas.freeDrawingBrush.color = settingStore.fabricOptions.pencilOptions.color
      canvas.freeDrawingBrush.width = settingStore.fabricOptions.pencilOptions.width // 设置画笔粗细
      canvas.freeDrawingCursor = 'pointer auto'
      // canvas.freeDrawingBrush.shadow = new fabric.Shadow({ // 设置画笔投影
      //   blur: 10,
      //   offsetX: 10,
      //   offsetY: 10,
      //   affectStroke: true,
      //   color: '#30e3ca'
      // })
    },
    getEvents() {
      return {
        'mouse:up': 'mouseUp',
      }
    },
    mouseUp(this: any, fabricCanvas: MyFabricCanvas, event: IEvent) {
      fabricCanvas.registerStack()
    },
  })
}

// 橡皮擦
export const registerEraser = (fabricCanvas: MyFabricCanvas) => {
  let prevBrush: any = null
  fabricCanvas.registerDrawMode('eraser', {
    map: new Map(),
    before(fabricCanvas) {
      fabricCanvas.canvas.isDrawingMode = true
      fabricCanvas.canvas.getObjects().forEach((item) => {
        this.map.set(item, !!item.get('selectable'))
        item.set({
          selectable: false,
        })
      })
      fabricCanvas.canvas.renderAll()
      // 设置橡皮擦
      prevBrush = fabricCanvas.canvas.freeDrawingBrush
      fabricCanvas.canvas.freeDrawingBrush = fabricCanvas.eraser
      fabricCanvas.canvas.freeDrawingBrush.width = 20
      fabricCanvas.canvas.freeDrawingBrush.color = '#FFF'
    },
    after(fabricCanvas) {
      fabricCanvas.canvas.isDrawingMode = false
      fabricCanvas.canvas.freeDrawingBrush = prevBrush
      fabricCanvas.canvas.getObjects().forEach((item) => {
        item.set({
          selectable: this.map.has(item) ? this.map.get(item): true,
        })
        this.map.delete(item)
      })
      fabricCanvas.canvas.renderAll()
    },
    getEvents() {
      return {}
    },
  })
}
