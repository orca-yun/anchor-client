/* 黑名单 */
import i18n from 'i18next'

import { addAudienceToBL, recoveryAudienceFromBL } from '@/apis/human'
import { AsyncFetchHooks } from '@/utils/asyncFetch'

import useRequest from '../useRequest'

/* 拉黑 */
export const useSetToBL = (asyncOptions: AsyncFetchHooks<any>) =>
  useRequest(addAudienceToBL, { manual: true }, {
    loadingMsg: i18n.t('正在操作'),
    loadingSuccessMsg: i18n.t('操作成功'),
    ...asyncOptions,
  })

/* 解除拉黑 */
export const useRecoveryFromBL = (asyncOptions: AsyncFetchHooks<any>) =>
  useRequest(recoveryAudienceFromBL, { manual: true }, {
    loadingMsg: i18n.t('正在操作'),
    loadingSuccessMsg: i18n.t('操作成功'),
    ...asyncOptions,
  })
