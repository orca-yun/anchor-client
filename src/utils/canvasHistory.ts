import { Canvas, Object } from 'fabric/fabric-impl'

import CustomEvents from '@/utils/event'

export type ICanvasJson = { version: string; objects: Object[] }

class CanvasHistory {
  historyStack: ICanvasJson[] = []
  withDrawStack: ICanvasJson[] = []
  // 历史栈最大只能保存20步
  private maxStep: number = 20
  private historyDebug: boolean = true
  public customEvent: CustomEvents = new CustomEvents()

  emitHistoryStack() {
    this.customEvent.emit('history-changed', {
      history: this.historyStack.length,
      recovery: this.withDrawStack.length,
    })
  }

  getLatestAction() {
    return this.historyStack[this.historyStack.length - 1]
  }

  loadFromHistory(canvas: Canvas, cb?: (...args: any[]) => void) {
    if (this.getLatestAction()) canvas.loadFromJSON(this.getLatestAction(), cb || (() => {}))
  }

  // 操作栈push
  registerStack(jsonData: ICanvasJson) {
    this.historyStack.push(jsonData)
    this.emitHistoryStack()
  }

  // 撤回
  withdrawStack() {
    if (this.historyStack.length <= 1) {
      return
    }
    const jsonData = this.historyStack.pop()
    jsonData && this.withDrawStack.push(jsonData)
    this.emitHistoryStack()
  }

  // 恢复上一步
  recoveryStack() {
    if (!this.withDrawStack.length) return
    const jsonData = this.withDrawStack.pop()
    jsonData && this.historyStack.push(jsonData)
    this.emitHistoryStack()
  }

  clearCanvasHistory() {
    this.historyStack = []
    this.withDrawStack = []
    this.emitHistoryStack()
  }
}

export default CanvasHistory
