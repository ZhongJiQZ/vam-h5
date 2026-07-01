let checking = false

function getVersionUrl() {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return `${normalizedBase}version.json?t=${Date.now()}`
}

/**
 * 拉取服务端 version.json，与当前 _APP_VERSION 对比，不一致则刷新页面
 */
export async function checkAppVersion() {
  if (checking || import.meta.env.DEV) return
  if (typeof window === 'undefined' || !window._APP_VERSION) return

  checking = true
  try {
    const res = await fetch(getVersionUrl(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    })
    if (!res.ok) return

    const data = await res.json()
    if (data?.version && data.version !== window._APP_VERSION) {
      const url = new URL(window.location.href)
      url.searchParams.set('_v', data.version)
      window.location.replace(url.toString())
    }
  } catch {
    // 网络异常时忽略，避免影响正常使用
  } finally {
    checking = false
  }
}

/**
 * 启动版本检测：页面可见时 + 定时轮询
 */
export function initVersionCheck() {
  if (import.meta.env.DEV) return

  checkAppVersion()

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkAppVersion()
    }
  })

  setInterval(checkAppVersion, 5 * 60 * 1000)
}
