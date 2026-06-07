import { post, get } from '@/utils/request'

/** 跟单前置配置 */
export const getCopyTradeConfig = () => post('/api/copyTrade/config')

/** 可跟单策略列表（可选 institutionId） */
export const getCopyTradeStrategyList = (data) => post('/api/copyTrade/strategyList', data || {})

/** 机构下上架策略列表 */
export const getCopyTradeInstitutionStrategyList = (data) =>
  post('/api/copyTrade/institutionStrategyList', data)

/** 策略详情（加入策略页） */
export const getCopyTradeStrategyDetail = (data) => post('/api/copyTrade/strategyDetail', data)

/** 协议文档 agreement | risk */
export const getCopyTradeDocuments = (data) => post('/api/copyTrade/documents', data)

/** 发起跟单（已订阅机构可不传 secretKey） */
export const submitCopyTrade = (data) => post('/api/copyTrade/submit', data)

/** 退出跟单 */
export const exitCopyTrade = (data) => post('/api/copyTrade/exit', data)

/** 追加投资 */
export const appendCopyTrade = (data) => post('/api/copyTrade/append', data)

/** 跟单记录列表 status: 0=跟单中 1=已退出；可选 institutionId */
export const getCopyTradeList = (params = {}) => post('/api/copyTrade/list', params)

/** 跟单详情 status: 0=进行中 1=已结束 */
export const getCopyTradeDetail = (id, status = 0) =>
  get(`/api/copyTrade/detail/${id}?status=${Number(status)}`)

/** 机构列表（跟单首页） */
export const getCopyTradeInstitutionList = (data) =>
  post('/api/copyTrade/institutionList', data || {})

/** 机构介绍详情 */
export const getCopyTradeInstitutionDetail = (data) =>
  post('/api/copyTrade/institutionDetail', data)

/** 订阅机构（密钥验证） */
export const subscribeCopyTradeInstitution = (data) =>
  post('/api/copyTrade/institutionSubscribe', data, { skipBizErrorToast: true })

/** 机构带单表现（全量） */
export const getCopyTradeInstitutionPerformance = (data) =>
  post('/api/copyTrade/institutionPerformance', data)

/** 机构每日收益图 */
export const getCopyTradeInstitutionDailyChart = (data) =>
  post('/api/copyTrade/institutionDailyChart', data)

/** 机构每周收益图 */
export const getCopyTradeInstitutionWeeklyChart = (data) =>
  post('/api/copyTrade/institutionWeeklyChart', data)

/** 我的跟单表现（全量） */
export const getCopyTradeMyPerformance = (data) => post('/api/copyTrade/myPerformance', data)

/** 我的每日收益图 */
export const getCopyTradeMyDailyChart = (data) => post('/api/copyTrade/myDailyChart', data)

/** 我的每周收益图 */
export const getCopyTradeMyWeeklyChart = (data) => post('/api/copyTrade/myWeeklyChart', data)

/** 机构币种偏好 */
export const getCopyTradeInstitutionCoinPreference = (data) =>
  post('/api/copyTrade/institutionCoinPreference', data)

/** 我的币种偏好 */
export const getCopyTradeMyCoinPreference = (data) =>
  post('/api/copyTrade/myCoinPreference', data)
