import axios from 'axios'
import { useUserStore } from '@/store/user/index.js'
import { showToast } from 'vant'
import { storageDict } from '@/config/dict'
import { DEFAULT_LANGUAGE } from '@/config'
import router from '@/router'

let _axios = null
let _tokenInvalidHandling = false

const isTokenInvalidResponse = (data = {}) => {
  const code = data?.code
  const msg = String(data?.msg || '').toLowerCase()
  const byCode = code === 401 || code === '401' || code === 403 || code === '403'
  const byMsg =
    msg.includes('invalid token') ||
    msg.includes('token invalid') ||
    msg.includes('token已失效') ||
    msg.includes('token失效') ||
    msg.includes('登录失效')
  return byCode || byMsg
}

const handleTokenInvalid = () => {
  if (_tokenInvalidHandling) return
  _tokenInvalidHandling = true
  try {
    const userStore = useUserStore()
    userStore.signOut()
    router.replace('/sign-in')
  } finally {
    setTimeout(() => {
      _tokenInvalidHandling = false
    }, 1000)
  }
}
/**
 * 初始化
 */
export const baseURL = __config._BASE_API
// export const initAxios = () => {
if (!_axios) {
  _axios = axios.create({
    // 默认请求连接
    baseURL: baseURL,
    // 请求头
    headers: {
      'Content-Type': 'application/json'
    },
    // 超时时间（ms）
    timeout: 10 * 1000
  })
}
// }
// 请求拦截器
_axios.interceptors.request.use((config) => {
  // token 判断
  let userStore = useUserStore()
  let token = userStore.token
  if (token) {
    config.headers['authorization'] = token
    config.headers['satoken'] = token
  }
  const savedLanguage = localStorage.getItem(storageDict.LANGUAGE)
  const language = savedLanguage || DEFAULT_LANGUAGE
  config.headers['language'] = language
  config.headers['lang'] = language

  return config
})

// 响应拦截器
_axios.interceptors.response.use((response) => {
  if (response.status === 200) {
    if (isTokenInvalidResponse(response.data)) {
      handleTokenInvalid()
      return Promise.reject(response)
    }
    // 成功码须显式判断：用 code > 0 会把业务错误码 500 当成成功
    const c = response.data?.code
    const ok = c === 200 || c === '200'
    const isUContractSubmit = response?.config?.url?.includes('/api/contract/order/submit')
    const isPriceConfirmRequired = isUContractSubmit && (c === 601 || c === '601')
    if (response.data && (ok || isPriceConfirmRequired)) {
      return Promise.resolve(response.data)
    } else {
      showToast(response.data.msg || 'System error')
      return Promise.reject(response)
    }
  } else {
    showToast('Network anomaly')
    return Promise.resolve(response)
  }
})

/**
 * post 请求
 */
export const post = (url, params) => _axios.post(url, params)

/**
 * get 请求
 */
export const get = (url, params) => _axios.get(url, params)
