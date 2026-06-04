/**
 * SaleSmartly 客服插件 JSSDK
 * @see https://help-en.salesmartly.com/docs/salesmartly-chat-plugin-jssdk-developer-documentation/
 */

/** 项目专属插件脚本（后台生成的接入代码） */
export const SALE_SMARTLY_PLUGIN_SRC =
  'https://plugin-code.salesmartly.com/js/project_674021_695120_1775457049.js'

/** SaleSmartly 后台自定义字段 key（项目设置 → 自定义字段 → userId） */
export const SALE_SMARTLY_CUSTOM_FIELD_USER_ID = 'userId'

const SCRIPT_ID = 'ss-salesmartly-project'

let scriptInjectPromise = null

/** 隐藏插件默认悬浮图标（须在插件脚本加载前调用） */
export function initSaleSmartlyHideIcon() {
  if (typeof window === 'undefined') return
  window.__ssc = window.__ssc || {}
  window.__ssc.setting = { ...(window.__ssc.setting || {}), hideIcon: true }
}

initSaleSmartlyHideIcon()

export function isSaleSmartlyAvailable() {
  return typeof window !== 'undefined' && typeof window.ssq === 'function'
}

function bootstrapSsqQueue() {
  if (typeof window === 'undefined' || window.ssq) return
  const n = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
  }
  n.push = n
  n.loaded = true
  n.queue = []
  window.ssq = n
}

/** 预加载平台 customer.min.js（内容与项目脚本一致） */
export function injectSaleSmartlyPlatformScript(appEnv) {
  initSaleSmartlyHideIcon()
  if (typeof document === 'undefined') return
  const env = appEnv || (typeof __config !== 'undefined' ? __config._APP_ENV : 'vam')
  const existed = document.querySelector(`script[data-ss-platform="${env}"]`)
  if (existed) return
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.dataset.ssPlatform = env
  script.src = `/platform/${env}/customer.min.js?${Date.now()}`
  document.body.appendChild(script)
}

function waitForSsq(maxWaitMs = 12000, intervalMs = 200) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const tick = () => {
      if (isSaleSmartlyAvailable()) {
        resolve()
        return
      }
      if (Date.now() - start >= maxWaitMs) {
        reject(new Error('ssq init timeout'))
        return
      }
      setTimeout(tick, intervalMs)
    }
    tick()
  })
}

/** 等待 SaleSmartly 插件 onReady */
export function waitSaleSmartlyReady(timeoutMs = 12000) {
  return waitForSsq(timeoutMs).then(
    () =>
      new Promise((resolve, reject) => {
        let done = false
        const timer = setTimeout(() => {
          if (done) return
          done = true
          resolve()
        }, timeoutMs)
        try {
          window.ssq.push('onReady', () => {
            if (done) return
            done = true
            clearTimeout(timer)
            resolve()
          })
        } catch (e) {
          clearTimeout(timer)
          resolve()
        }
      })
  )
}

/** 加载项目插件脚本 */
export function ensureSaleSmartlyPlugin() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('no window'))
  }

  initSaleSmartlyHideIcon()
  bootstrapSsqQueue()

  if (document.getElementById(SCRIPT_ID)) {
    return waitSaleSmartlyReady()
  }

  if (!scriptInjectPromise) {
    scriptInjectPromise = new Promise((resolve, reject) => {
      const js = document.createElement('script')
      js.id = SCRIPT_ID
      js.async = true
      js.src = SALE_SMARTLY_PLUGIN_SRC
      js.onload = () => waitSaleSmartlyReady().then(resolve).catch(resolve)
      js.onerror = () => {
        scriptInjectPromise = null
        reject(new Error('SaleSmartly plugin script load failed'))
      }
      ;(document.head || document.body).appendChild(js)
    })
  }
  return scriptInjectPromise
}

/** 构建 setLoginInfo 参数（user_id 必填；业务 userId 写入 custom_fields_ext，最长 300 字符） */
export function getSaleSmartlyLoginInfo(userInfo = {}) {
  const user = userInfo?.user || userInfo || {}
  let userId = user.userId != null && user.userId !== '' ? String(user.userId) : ''
  if (!userId) {
    userId = `guest_${Date.now()}`
  }
  const userIdStr = userId.slice(0, 300)
  const userName =
    user.loginName || user.userName || user.nickName || userId || 'guest'
  const payload = {
    user_id: userIdStr,
    user_name: String(userName).slice(0, 300),
    description: userIdStr,
    custom_fields_ext: {
      [SALE_SMARTLY_CUSTOM_FIELD_USER_ID]: userIdStr
    }
  }
  if (user.email) payload.email = String(user.email)
  if (user.phone) payload.phone = String(user.phone)
  return payload
}

/** 同步登录信息到 SaleSmartly（客服后台可见） */
export function syncSaleSmartlyLogin(userInfo) {
  if (!isSaleSmartlyAvailable()) return false
  window.ssq.push('setLoginInfo', getSaleSmartlyLoginInfo(userInfo))
  return true
}

/** 退出登录时清理 SaleSmartly 用户信息 */
export function clearSaleSmartlyLogin() {
  if (!isSaleSmartlyAvailable()) return
  window.ssq.push('clearUser')
}

/** 打开 SaleSmartly 聊天窗口 */
export function openSaleSmartlyChat() {
  if (!isSaleSmartlyAvailable()) return false
  window.ssq.push('chatOpen')
  return true
}

/**
 * 打开客服：加载项目插件 → setLoginInfo(user_id + custom_fields_ext) → chatOpen（不跳转外链）
 */
export async function openCustomerService({ userInfo, preferWidget = true, appEnv } = {}) {
  if (!preferWidget) return

  try {
    injectSaleSmartlyPlatformScript(appEnv)
    await ensureSaleSmartlyPlugin()
    syncSaleSmartlyLogin(userInfo)
    openSaleSmartlyChat()
  } catch (e) {
    console.warn('[SaleSmartly] plugin open failed', e)
  }
}
