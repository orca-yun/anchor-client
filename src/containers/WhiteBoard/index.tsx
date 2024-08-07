import React, { useMemo, useState, useRef, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Space, Button, Radio, Tooltip, message, ColorPicker, Slider } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { CloudUploadOutlined, BackwardOutlined, ForwardOutlined } from '@ant-design/icons'
import useIsomorphicLayoutEffectWithTarget from 'ahooks/lib/utils/useIsomorphicLayoutEffectWithTarget'

import { BIcon } from '@/components/BIcon'
import { useSocket } from '@/hooks/useSocket'
import { getToken } from '@/constant/key'
import { authStore, settingStore } from '@/stores'
import { registerFreeDraw, registerRectDraw, registerEraser, registerTextBox } from '@/utils/behaviors'
import MyFabricCanvas from '@/utils/fabric'

import { callCoursewareModal } from './components/CoursewareManageModal'

import './index.less'

const { Group: RadioGroup, Button: RadioButton } = Radio

enum BtnType {
  MOUSE = 'mouse',
  PENCIL = 'pencil',
  RECT = 'RECT',
  Eraser = 'eraser',
}

const WhiteBoard: React.FC<{ show: boolean }> = ({ show }) => {
  const [params] = useSearchParams()
  const roomId = params.get('roomId')
  const query = useMemo(() => {
    if (!authStore.roomMeta) return null
    return {
      token: getToken(authStore.roomId),
      room: authStore.roomId,
    }
  }, [authStore.roomMeta])

  const { socket } = useSocket('draw', ['message'], query)
  const [mode, setMode] = useState<string>('default')
  const [whiteboardSize, setWhiteboardSize] = useState<{ width: number, height: number } | null>(null)
  // const [stack, setStack] = useState({
  //   history: 0,
  //   recovery: 0,
  // })
  const {
    curRenderImg,
    selectedCourseware,
    curImgChain,
    setCurCourseware,
    fabricOptions: {
      pencilOptions,
      rectOptions,
      textBoxOptions,
    },
    setFabricOptions,
  } = settingStore
  const canvasWrapperRef = useRef<any>()
  const canvasRef = useRef<any>()
  const canvasInstance = useRef<MyFabricCanvas>()

  useIsomorphicLayoutEffectWithTarget(() => {
    if (!canvasRef.current || canvasInstance.current) return
    canvasInstance.current = new MyFabricCanvas(canvasRef.current)
    const { canvas } = canvasInstance.current
    // canvasInstance.current.customEvent.on('history-changed', setStack)
    canvas.setBackgroundColor('#FFF', canvas.renderAll.bind(canvas))
    canvasInstance.current.registerDrawMode('default', {
      before: (fabricCanvas) => {
        fabricCanvas.canvas.isDrawingMode = false
      },
      getEvents: () => ({}),
    })
    registerRectDraw(canvasInstance.current)
    registerFreeDraw(canvasInstance.current)
    registerEraser(canvasInstance.current)
    registerTextBox(canvasInstance.current)
  }, [],  canvasRef)

  useEffect(() => {
    if (!canvasInstance.current) return
    if (!curRenderImg) {
      handleClearAll()
      return
    }
    handleChangeImg(curRenderImg)
  }, [curRenderImg])

  useEffect(() => {
    if (!canvasWrapperRef.current) return
    const { width: wrapperWidth, height: wrapperHeight } = canvasWrapperRef.current.getBoundingClientRect()
    const wrapperSizeProportion = wrapperWidth / wrapperHeight
    if (wrapperSizeProportion >= 2) {
      setWhiteboardSize({
        width: wrapperHeight * 2,
        height: wrapperHeight,
      })
    } else {
      setWhiteboardSize({
        width: wrapperWidth,
        height: wrapperWidth / 2,
      })
    }
  }, [])

  useEffect(() => {
    if (socket) {
      canvasInstance.current?.setSocket(socket)
    }
  }, [socket])

  useEffect(() => {
    return () => {
      canvasInstance.current?.clearEffects()
    }
  }, [])

  useEffect(() => {
    canvasInstance.current?.setMode(mode)
  }, [mode])

  const handleChangeImg = (url: string) => {
    handleClearAll(true)
    canvasInstance.current?.addBgImage(url)
    setMode('default')
  }

  const handleWithDraw = () => {
    if (!canvasInstance.current) return
    canvasInstance.current?.customEvent.emit('history-back', {})
  }

  const handleRecover = () => {
    if (!canvasInstance.current) return
    canvasInstance.current?.customEvent.emit('history-recovery', {})
  }

  const handleClearAll = (clearBg?: boolean) => {
    canvasInstance.current?.clearCanvas(clearBg)
  }

  const handleRest = () => {
    canvasInstance.current?.resetZoom(1)
  }

  // const renderColorPanel = () => {
  //   return (
  //
  //   )
  // }

  return (
    <div className="white-board-container" style={{ visibility: show ? 'unset' : 'hidden' }}>
      <div className="white-board-container__content" ref={canvasWrapperRef}>
        {
          whiteboardSize && (
            <div style={{ ...whiteboardSize, boxSizing: 'border-box', overflow: 'hidden' }}>
              <div style={whiteboardSize} className="canvas-area" ref={canvasRef} />
            </div>
          )
        }
      </div>
      <div className="white-board-container__operate">
        <RadioGroup className="action-btn-group" size="large">
          <RadioButton onClick={() => { setMode('default') }}>
            <Tooltip title="鼠标模式">
              <BIcon type="icon-orcamouse01" />
            </Tooltip>
          </RadioButton>
          <ColorPicker
            trigger="hover"
            value={pencilOptions.color}
            onChange={(color) => {
              setFabricOptions({
                pencilOptions: { color: color.toHexString() },
              })
              canvasInstance.current?.setMode('free-draw')
            }}
            panelRender={(panel) => (
              <div className="custom-panel">
                {panel}
                <div className="pencil-width-adjust">
                  <div>画笔宽度调整</div>
                  <Slider
                    step={1}
                    defaultValue={pencilOptions.width}
                    min={1}
                    max={10}
                    onChange={(val) => {
                      setFabricOptions({
                        pencilOptions: { width: val },
                      })
                      canvasInstance.current?.setMode('free-draw')
                    }}
                  />
                </div>
              </div>
            )}
          >
            <RadioButton onClick={() => { setMode('free-draw') }}>
              <BIcon type="icon-orcahuabi" />
            </RadioButton>
          </ColorPicker>
          <ColorPicker
            trigger="hover"
            value={textBoxOptions.fill}
            onChange={(color) => {
              setFabricOptions({
                textBoxOptions: { fill: color.toHexString() },
              })
              canvasInstance.current?.setMode('text-box')
            }}
            panelRender={(panel) => (
              <div className="custom-panel">
                {panel}
                <div className="pencil-width-adjust">
                  <div>字号调整</div>
                  <Slider
                    step={10}
                    defaultValue={textBoxOptions.fontSize}
                    min={10}
                    max={50}
                    onChange={(val) => {
                      setFabricOptions({
                        textBoxOptions: { fontSize: val },
                      })
                      canvasInstance.current?.setMode('text-box')
                    }}
                  />
                </div>
              </div>
            )}
          >
            <RadioButton onClick={() => { setMode('text-box') }}>
              <BIcon type="icon-orcawenzi" />
            </RadioButton>
          </ColorPicker>
          <RadioButton onClick={() => { setMode('rect-draw') }}>
            <Tooltip title="绘制矩形">
              <BIcon type="icon-orcarect01" />
            </Tooltip>
          </RadioButton>
          <RadioButton onClick={() => { setMode('eraser') }}>
            <Tooltip title="橡皮擦模式">
              <BIcon type="icon-orcaxiangpica" />
            </Tooltip>
          </RadioButton>
          <RadioButton onClick={() => { handleClearAll(false) }}>
            <Tooltip title="清空白板">
              <BIcon type="icon-orcaclear01" />
            </Tooltip>
          </RadioButton>
          <RadioButton onClick={handleRest}>
            <Tooltip title="白板复原">
              <BIcon type="icon-orcarecovery01" />
            </Tooltip>
          </RadioButton>
        </RadioGroup>
        {/*<div>*/}
        {/*  <div>功能</div>*/}
        {/*  <Space>*/}
        {/*    <Button onClick={handleChangeImg}>切换课件</Button>*/}
        {/*    /!*<Button disabled={stack.history <= 1} onClick={handleWithDraw}>撤销</Button>*!/*/}
        {/*    /!*<Button disabled={!stack.recovery} onClick={handleRecover}>恢复</Button>*!/*/}
        {/*    /!*<Button onClick={handleTransformToJson}>转json</Button>*!/*/}
        {/*  </Space>*/}
        {/*</div>*/}
        <div>
          <Space>
            {/*<a onClick={() => {*/}
            {/*  window.open(`${location.origin}${location.pathname}#/feedback?roomId=${roomId}`)*/}
            {/*}}>观众模式</a>*/}
            <Button
              size="large"
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={async() => {
                const res = await callCoursewareModal({
                  selectedCourseware,
                })
                if (!res) return
                setCurCourseware(res)
              }}
            >课件管理</Button>
            <Button
              size="large"
              type="primary"
              disabled={!curImgChain.hasPrev}
              onClick={() => { settingStore.switchNextRenderImg(-1) }}
            >
              <BackwardOutlined />
            </Button>
            <Button
              size="large"
              type="primary"
              disabled={!curImgChain.hasNext}
              onClick={() => { settingStore.switchNextRenderImg(1) }}
            >
              <ForwardOutlined />
            </Button>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default observer(WhiteBoard)
