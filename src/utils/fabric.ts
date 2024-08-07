import { fabric } from 'fabric'
import 'fabric/src/mixins/eraser_brush.mixin'
import { Socket } from 'socket.io-client'
import _ from 'lodash'
import { makeObservable } from 'mobx'
import {
  Canvas as ICanvas,
  Object as IObject,
  ILineOptions,
  IImageOptions,
  IRectOptions,
  ICircleOptions,
  ITextOptions,
  IEllipseOptions,
  IEvent,
  ICanvasOptions,
  ITriangleOptions,
  Circle,
  Ellipse,
  Line,
  EventName,
  Point, ITextboxOptions,
} from 'fabric/fabric-impl'

import { settingStore } from '@/stores'
import CanvasHistory, { ICanvasJson } from './canvasHistory'
import CustomEvents from './event'

interface ShapeOptions {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  opacity?: number;
}

type IReturnGetEvents<T> = Record<EventName, T>

interface IRegisterBehavior {
  before?: (fabricCanvas: MyFabricCanvas) => void
  after?: (fabricCanvas: MyFabricCanvas) => void
  getEvents: () => Partial<IReturnGetEvents<string>>
  [propName: string]: any
}

class MyFabricCanvas extends CanvasHistory {
  public canvas: ICanvas
  public eraser: any
  // 当前操作的图形
  public currentShape: IObject | null = null
  public isDrawing: boolean = false
  private options: ShapeOptions = settingStore.fabricOptions.rectOptions
  private bgImg: any
  public resetZoom: (zoom?: number) => void
  private socket: Socket | null = null
  private effects: (() => void)[] = []

  constructor(canvasElementWrapper: HTMLCanvasElement) {
    super()
    const canvas = MyFabricCanvas.createCanvas(canvasElementWrapper)
    this.canvas = new fabric.Canvas(canvas, {
      isDrawingMode: false,
      selection: false,
      includeDefaultValues: false,
    })
    // @ts-ignore
    this.eraser = new fabric.EraserBrush(this.canvas)
    this.resetZoom = (zoom?: number) => {
      if (this.bgImg) {
        const { left, top } = this.bgImg
        this.canvas.setViewportTransform([1, 0, 0, 1, -left, -top])
      } else {
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
      }
      this.canvas.zoomToPoint({ x: this.canvas.getWidth() / 2, y: this.canvas.getHeight() / 2 }, zoom || this.canvas.getZoom())
      this.canvas.renderAll()
    }
    this.initEvent()
  }

  initEvent() {
    // 历史栈
    this.canvas.on('mouse:up', () => {
      // 阻止背景被选中 防止误删
      if (this.canvas.getActiveObject() === this.bgImg) {
        this.canvas.discardActiveObject()
        this.canvas.requestRenderAll()
      }
    })
    this.customEvent.on('history-back', () => {
      this.withdrawStack()
      this.loadFromHistory(this.canvas)
    })
    this.customEvent.on('history-recovery', () => {
      this.recoveryStack()
      this.loadFromHistory(this.canvas)
    })
    // 缩放
    this.canvas.on('mouse:wheel', (opt) => {
      opt.e.stopPropagation()
      opt.e.preventDefault()
      const delta = opt.e.deltaY
      let zoom = this.canvas.getZoom()
      zoom *= 0.99 ** delta
      if (zoom > 10) zoom = 10
      if (zoom < 0.5) zoom = 0.5

      // 以鼠标所在位置为原点缩放
      this.canvas.zoomToPoint(
        { // 关键点
          x: opt.e.offsetX,
          y: opt.e.offsetY
        },
        zoom,
      )
    })
    this.canvas.on('after:render', this.storeData)
    let origin: any = null
    // 背景图移动 绘制的图形也跟着移动
    this.canvas.on('mouse:down:before', (event) => {
      const movedObject = event.target
      if (movedObject && movedObject === this.bgImg) {
        origin = {
          left: movedObject?.left || 0,
          top: movedObject?.top || 0,
        }
      }
    })
    this.canvas.on('object:modified', (event) => {
      const movedObject = event.target
      if (movedObject && movedObject === this.bgImg) {
        const changedLeft = (movedObject?.left || 0) - origin.left
        const changedTop = (movedObject?.top || 0) - origin.top
        this.canvas.getObjects().forEach((obj) => {
          if (obj && obj !== this.bgImg) {
            obj.set({
              left: (obj?.left || 0) + changedLeft,
              top: (obj?.top || 0) + changedTop
            })
          }
        })
        // this.canvas.discardActiveObject()
        origin = null
        // this.canvas.requestRenderAll()
      }
    })
    const backSpaceHandler = (event: KeyboardEvent) => {
      // @ts-ignore
      if (event.target?.tagName && (event.target?.tagName.includes('TEXTAREA') || event.target?.tagName.includes('INPUT'))) return
      if (event.key === 'Backspace') {
        const selectedObject = this.canvas.getActiveObject()
        if (selectedObject && selectedObject === this.bgImg) return
        this.canvas.remove(selectedObject as IObject)
        this.canvas.discardActiveObject()
        this.canvas.renderAll()
      }
    }
    document.addEventListener('keydown', backSpaceHandler)
    this.effects.push(() => {
      document.removeEventListener('keydown', backSpaceHandler)
    })
    this.effects.push(() => {
      this.canvas.dispose()
    })
    this.effects.push(() => {
      this.customEvent.clear()
    })
    const clickOutsideHandler = (e: any) => {
      // @ts-ignore
      if (e.target && (e.target?.parentNode === this.canvas?.wrapperEl)) return
      this.canvas.discardActiveObject()
      this.canvas.renderAll()
    }
    document.addEventListener('click', clickOutsideHandler)
    this.effects.push(() => {
      document.removeEventListener('click', clickOutsideHandler)
    })
  }

  registerStack() {
    super.registerStack(this.canvas.toJSON())
  }

  setSocket(socket: Socket) {
    this.socket = socket
  }

  composeCanvasSize(data: any) {
    return {
      // 后端生成
      // uuid: 'b8513515-3cb2-40f6-b009-0a36ec5e1c9e',
      // ts: Date.now(),
      data: JSON.stringify({
        ...data,
        originSize: {
          width: this.canvas.getWidth(),
          height: this.canvas.getHeight(),
        },
        orcaZoom: this.canvas.getZoom(),
        transforms: this.canvas.viewportTransform,
      }),
    }
  }

  loadJsonData(jsonData: ICanvasJson) {
    // 自动触发上报
    this.canvas.loadFromJSON(jsonData, () => {})
  }

  storeData = _.throttle(() => {
    const data = this.canvas.toJSON()
    this.socket?.emit('message', this.composeCanvasSize(data))
  }, 100)

  setIsDrawing(isDrawing: boolean) {
    this.isDrawing = isDrawing
  }

  setCurShape(shape: IObject | null) {
    this.currentShape = shape
  }

  static createCanvas(canvasElementWrapper: HTMLCanvasElement) {
    const { width, height } = canvasElementWrapper.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvasElementWrapper.appendChild(canvas)
    return canvas
  }

  getViewportOffset(widthZoom = false) {
    if (!this.bgImg) return { offsetX: 0, offsetY: 0 }
    const imageTopLeft = this.bgImg.getPointByOrigin('left', 'top')
    const { tl } = this.canvas.calcViewportBoundaries()

    const offsetX = imageTopLeft.x - tl.x
    const offsetY = imageTopLeft.y - tl.y

    return {
      offsetX: widthZoom ? offsetX / this.canvas.getZoom() : offsetX,
      offsetY: widthZoom ? offsetY / this.canvas.getZoom() : offsetY,
    }
  }

  // 添加背景图
  addBgImage(url: string) {
    this.clearCanvasHistory()
    fabric.Image.fromURL(url, (img) => {
      const canvasImage = img.set({
        // 一定要保留两个小数 canvas.toJson会自动保留两位 再重新加载或者撤销scale会变化
        scaleX: +(this.canvas.getWidth() / img.getScaledWidth()).toFixed(2),
        scaleY: +(this.canvas.getWidth() / img.getScaledWidth()).toFixed(2),
        // scaleY: +(this.canvas.getHeight() / img.getScaledHeight()).toFixed(2),
        // selectable: false,
        lockMovementX: false, // 锁定水平移动
        lockMovementY: false, // 锁定垂直移动
        hoverCursor: 'default',
        moveCursor: 'default',
        // @ts-ignore
        erasable: false,
      })
      this.bgImg = canvasImage
      this.canvas.add(canvasImage)
      // 不能使用背景图 新的数据到用户端会闪烁
      // this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas))
      this.registerStack()
    })
  }

  // 绘制矩形
  drawRect(options: IRectOptions): void {
    const rect = new fabric.Rect({
      ...this.options,
      ...settingStore.fabricOptions.rectOptions,
      ...options,
    })
    this.canvas.add(rect)
    this.currentShape = rect
    this.canvas.defaultCursor = 'crosshair'
  }

  // 绘制文本框
  drawTextBox(options: ITextboxOptions): void {
    const textBox = new fabric.Textbox('双击输入文本', {
      borderColor: 'black',
      hasControls: true, // 允许编辑
      ...settingStore.fabricOptions.textBoxOptions,
      ...options,
    })
    this.canvas.add(textBox)
    this.setCurShape(textBox)
  }

  clearEffects() {
    while(this.effects.length) {
      const fn = this.effects.shift()
      // 不绑定this 注册时尽量使用箭头函数
      fn && fn()
    }
  }

  clearCanvas(clearImg = true) {
    this.canvas.getObjects().forEach((obj) => {
      if (clearImg || obj !== this.bgImg) this.canvas.remove(obj)
    })
    if (clearImg) {
      this.bgImg = null
      this.resetZoom()
    }
  }

  public curMode: string = 'default'
  private modeMap: Record<string, IRegisterBehavior> = {}
  private registerEventMap: Record<string, Partial<IReturnGetEvents<(e: IEvent) => void>>> = {}

  // 模式注册
  registerDrawMode(mode: string, obj: IRegisterBehavior) {
    const { getEvents } = obj
    if (!getEvents) {
      console.error('缺少getEvents')
      return
    }
    this.modeMap[mode] = obj
  }

  removeEffects() {
    const { after, ...rest } = this.modeMap[this.curMode] || {}
    after && after.call(rest, this)
    const map = this.registerEventMap[this.curMode] || {}
    Object.keys(map).forEach((realCanvasEventName) => {
      const fn = map[realCanvasEventName as EventName]
      if (fn && typeof fn === 'function') this.canvas.off(realCanvasEventName, fn)
    })
  }

  setMode(mode: string) {
    this.removeEffects() // 清除上个mode的事件注册
    this.curMode = mode
    // 注册当前mode事件
    if (!this.modeMap[mode]) return
    const { before, after, getEvents, ...rest } = this.modeMap[mode]
    before && before.call(rest, this)
    const events = getEvents()
    Object.keys(events).forEach((realCanvasEventName) => {
      let fn = rest[events[realCanvasEventName as EventName] as any]
      if (fn && typeof fn === 'function') {
        if (!this.registerEventMap[mode]) this.registerEventMap[mode] = {}
        fn = fn.bind(rest, this)
        this.registerEventMap[mode][realCanvasEventName as EventName] = fn
        this.canvas.on(realCanvasEventName, fn)
      }
    })
  }
}

export default MyFabricCanvas
