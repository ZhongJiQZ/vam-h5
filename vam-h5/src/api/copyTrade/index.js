import { post } from '@/utils/request'

/** 跟单前置配置 */
export const getCopyTradeConfig = () => post('/api/copyTrade/config')

/** 可跟单策略列表 */
export const getCopyTradeStrategyList = () => post('/api/copyTrade/strategyList')

/** 发起跟单 */
export const submitCopyTrade = (data) => post('/api/copyTrade/submit', data)

/** 退出跟单 */
export const exitCopyTrade = (data) => post('/api/copyTrade/exit', data)

/** 追加投资 */
export const appendCopyTrade = (data) => post('/api/copyTrade/append', data)

/** 跟单记录列表 status: 0=跟单中 1=已退出 */
export const getCopyTradeList = (params) => {
  const q = new URLSearchParams()
  if (params?.pageNum != null) q.set('pageNum', params.pageNum)
  if (params?.pageSize != null) q.set('pageSize', params.pageSize)
  if (params?.status != null && params.status !== '') q.set('status', params.status)
  const query = q.toString()
  return post(`/api/copyTrade/list${query ? `?${query}` : ''}`)
}

/** 跟单详情 */
export const getCopyTradeDetail = (id) => post(`/api/copyTrade/detail/${id}`)

/** 机构列表（跟单首页） */
export const getCopyTradeInstitutionList = (data) =>
  post('/api/copyTrade/institutionList', data || {})

/** 订阅机构（密钥验证） institutionId + secretKey */
export const subscribeCopyTradeInstitution = (data) =>
  post('/api/copyTrade/institutionSubscribe', data, { skipBizErrorToast: true })
