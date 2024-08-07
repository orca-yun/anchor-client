import React from 'react'
import ReactDom from 'react-dom'

export interface IModalSharedProps<T = any> {
  onConfirm: (val?: T) => void
  onCancel: () => void
}

export type OmitModalSharedProps<T> = Omit<T, 'onConfirm' | 'onCancel'>

export const callModalSync = <CPData = any, REData = any>(
  component: React.FC<CPData>,
  comProps: Omit<CPData, 'onConfirm' | 'onCancel'>,
): Promise<boolean | REData> => {
  const anchor = document.createElement('div')

  const unMount = () => {
    ReactDom.unmountComponentAtNode(anchor)
    document.body.removeChild(anchor)
  }

  return new Promise((resolve) => {
    ReactDom.render(
      // @ts-ignore
      React.createElement(component, {
        ...comProps,
        onConfirm: (confirmData?: REData) => {
          resolve(confirmData || true)
          unMount()
        },
        onCancel: () => {
          resolve(false)
          unMount()
        },
      }),
      anchor,
    )
    document.body.appendChild(anchor)
  })
}
