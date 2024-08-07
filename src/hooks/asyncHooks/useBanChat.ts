/* 禁言 */
import i18n from 'i18next'

import { addAudienceToMute, recoveryAudienceFromMute } from '@/apis/human'
import { AsyncFetchHooks } from '@/utils/asyncFetch'

import useRequest from '../useRequest'

/* 禁言 */
export const useSetToMute = (asyncOptions: AsyncFetchHooks<any>) =>
  useRequest(addAudienceToMute, { manual: true }, {
    loadingMsg: i18n.t('正在操作'),
    loadingSuccessMsg: i18n.t('操作成功'),
    ...asyncOptions,
  })

/* 解除禁言 */
export const useRecoveryFromMute = (asyncOptions: AsyncFetchHooks<any>) =>
  useRequest(recoveryAudienceFromMute, { manual: true }, {
    loadingMsg: i18n.t('正在操作'),
    loadingSuccessMsg: i18n.t('操作成功'),
    ...asyncOptions,
  })
