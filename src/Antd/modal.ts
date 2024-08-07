import { Modal } from 'antd'
import { ModalFuncProps } from 'antd/es/modal/interface'
import { ModalFunc } from 'antd/es/modal/confirm'

const modalTypes = [
  'info',
  'error',
  'success',
  'confirm',
] as const

type IModalTypes = typeof modalTypes[number]

export const ORCA_MODAL_ID = '__orca_modal_id__'

export const MODAL_ID_MAP = {
  TokenExpired: 'TokenExpired',
}

const modalMap = new Map()

type IOrcaModalProps = ModalFuncProps & { [ORCA_MODAL_ID]: number | string }

// @ts-ignore
const orcaModal: Record<IModalTypes, (props: IOrcaModalProps) => typeof ModalFunc> = modalTypes.reduce((a, type) => {
  return {
    ...a,
    [type]: (options: IOrcaModalProps) => {
      const { [ORCA_MODAL_ID]: modalId, onOk, onCancel, ...rest } = options
      if (!modalId) return Modal[type as NonNullable<ModalFuncProps['type']>](options)
      if (modalMap.has(modalId)) return
      modalMap.set(modalId, true)
      return Modal[type as NonNullable<ModalFuncProps['type']>]({
        onOk: (...args: any[]) => {
          modalMap.delete(modalId)
          if (onOk) return onOk(...args)
        },
        onCancel: (...args: any[]) => {
          modalMap.delete(modalId)
          if (onCancel) return onCancel(...args)
        },
        ...rest,
      })
    },
  }
}, {})

export default orcaModal
