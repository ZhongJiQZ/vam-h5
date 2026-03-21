/*
  系统相关api
*/
import { post, get, baseURL } from '@/utils/request'
 
 /**
 * 获取我的投资订单列表
 */
// export const getPersonalOrderList = (data) => post('/api/order/list', data)

/**
 * 我的投资数据
 */
// export const getPersonalIncome = () => post('/api/financial/personalIncome')

/**
 * 资金划转接口
 */
// export const transferFunds = (data) => post('/api/asset/transferFunds', data)

/**
 * 闪兑接口
 */
// export const currencyExchange = (data) => post('/api/texchange/currencyExchange', data)

/**
 * 获取货币之间汇率
 */
// export const getCurrencyRate = (data) => post('/api/texchange/getCurrencyPrice', data)

/**
 * 确定提现
 * 你原来是 /submit?${params}（字符串），这里保持一致
 */
// export const withdrawSubmit = (params) => post(`/api/withdraw/submit?${params}`)

/**
 * 确定充值
 */
// export const rechargeSubmit = (data) => post('/api/recharge/submit', data)

/**
 * 获取充值/提现/质押/投资记录列表
 * key:
 *  - mingOrder
 *  - order
 *  - recharge
 *  - withdraw
 */
// export const getRecordList = (data, key) => post(`/api/${key}/list`, data)


/** 对象转 query string（过滤 undefined / null / ''） */
const toQuery = (obj = {}) =>
  Object.keys(obj)
    .filter((k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== '')
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join('&')

/** POST + query 统一封装 */
const postQuery = (url, data) => {
  const qs = toQuery(data)
  return post(`${url}${qs ? `?${qs}` : ''}`)
}

/**
 * 获取我的投资订单列表
 * POST /api/order/list?pageNum=1&pageSize=10...
 */
export const getPersonalOrderList = (data) => postQuery('/api/order/list', data)

/**
 * 我的投资数据（无参）
 */
export const getPersonalIncome = () => post('/api/financial/personalIncome')

/**
 * 资金划转接口（改成 query）
 */
export const transferFunds = (data) => postQuery('/api/asset/transferFunds', data)

/**
 * 闪兑接口（改成 query）
 */
export const currencyExchange = (data) => postQuery('/api/texchange/currencyExchange', data)

/**
 * 获取货币之间汇率（改成 query）
 */
export const getCurrencyRate = (data) => postQuery('/api/texchange/getCurrencyPrice', data)

/**
 * 确定提现
 * 兼容两种传法：
 * 1) 传 string: "a=1&b=2"
 * 2) 传 object: { a:1, b:2 }
 */
export const withdrawSubmit = (params) => {
  if (typeof params === 'string') {
    return post(`/api/withdraw/submit${params ? `?${params}` : ''}`)
  }
  return postQuery('/api/withdraw/submit', params)
}

/**
 * 确定充值（改成 query）
 */
export const rechargeSubmit = (data) => postQuery('/api/recharge/submit', data)

/**
 * 获取充值/提现/质押/投资记录列表（改成 query）
 * key:
 *  - mingOrder
 *  - order
 *  - recharge
 *  - withdraw
 */
export const getRecordList = (data, key) => postQuery(`/api/${key}/list`, data)
