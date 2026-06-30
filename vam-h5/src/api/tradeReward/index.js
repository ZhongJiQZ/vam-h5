import { get } from '@/utils/request'

const toQuery = (obj = {}) =>
  Object.keys(obj)
    .filter((k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== '')
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join('&')

/** 跟单奖励列表 status: 0=待审核 2=已发放 3=已驳回 */
export const getTradeRewardList = (params = {}) =>
  get(`/api/tradeReward/list?${toQuery(params)}`)

/** 跟单奖励触发明细 */
export const getTradeRewardDetails = (id) => get(`/api/tradeReward/${id}/details`)
