/**
 * 与 ImageLoad 组件一致的图片 URL 解析，用于预加载与缓存命中。
 */

export function resolveImageLoadUrl(filePath, platform = []) {
  if (!filePath) return ''
  let tempPath = ''
  let tempTheme = ''
  if (!String(filePath).includes('/')) {
    tempTheme = `${__theme}/`
  }
  const isCustomized = platform.includes(__config._APP_ENV)

  if (String(filePath).includes('http')) {
    if (
      ['dev', 'dev_dark', 'spark', 'gatedefi', 'hfm2', 'robinhood2'].includes(__config._APP_ENV) &&
      filePath.includes('aliyuncs.com')
    ) {
      tempPath = `${filePath.replace(
        'https://echo-res.oss-cn-hongkong.aliyuncs.com',
        __config._STATIC_API
      )}?v=${_APP_VERSION}`
    } else {
      tempPath = `${filePath}?v=${_APP_VERSION}`
    }
  } else {
    if (isCustomized) {
      tempPath = `/resource/images/${tempTheme}${__config._APP_ENV}/${filePath}?v=${_APP_VERSION}`
    } else {
      tempPath = `/resource/images/${tempTheme}${filePath}?v=${_APP_VERSION}`
    }
  }
  return tempPath
}

const preloaded = new Set()

/**
 * 使用 Image + link preload 预热图片（浏览器缓存）
 */
export function preloadImages(urls, { linkPreloadCount = 8 } = {}) {
  if (typeof window === 'undefined') return
  const unique = [...new Set((urls || []).filter(Boolean))]
  unique.forEach((url) => {
    if (preloaded.has(url)) return
    preloaded.add(url)
    const img = new Image()
    img.decoding = 'async'
    img.src = url
  })
  unique.slice(0, linkPreloadCount).forEach((url) => {
    const id = `preload-img-${url}`
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}

const HOME_BANNER_CACHE_KEY = 'vam_home_banner_urls'

export function collectHomeCriticalImageUrls(settingConfig = {}) {
  const paths = []
  const push = (filePath) => {
    if (filePath) paths.push(filePath)
  }

  const logo = settingConfig.LOGO_SETTING || {}
  push(logo.logo)
  push(logo.logoD)

  ;(settingConfig.MIDDLE_MENU_SETTING || []).forEach((item) => {
    if (item?.isOpen !== false && item?.imgUrl) push(item.imgUrl)
  })
  ;(settingConfig.BOTTOM_MENU_SETTING || []).forEach((item) => {
    if (item?.imgUrl) push(item.imgUrl)
  })

  return paths.map((p) => resolveImageLoadUrl(p)).filter(Boolean)
}

/** 首页轮播/活动区背景图 URL（与 header 筛选逻辑一致） */
export function collectHomeBannerImageUrls(bannerList = []) {
  return (bannerList || [])
    .filter((item) => item?.status != '1' && item?.imgUrl)
    .map((item) => resolveImageLoadUrl(item.imgUrl))
    .filter(Boolean)
}

export function cacheHomeBannerImageUrls(urls) {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(HOME_BANNER_CACHE_KEY, JSON.stringify((urls || []).slice(0, 5)))
  } catch {
    /* ignore */
  }
}

/** 用上次会话缓存的轮播图 URL 尽早预加载 */
export function preloadCachedHomeBannerImages() {
  if (typeof sessionStorage === 'undefined') return
  try {
    const raw = sessionStorage.getItem(HOME_BANNER_CACHE_KEY)
    if (!raw) return
    const urls = JSON.parse(raw)
    if (Array.isArray(urls) && urls.length) {
      preloadImages(urls, { linkPreloadCount: 2 })
    }
  } catch {
    /* ignore */
  }
}

export function preloadHomeBannerList(bannerList) {
  const urls = collectHomeBannerImageUrls(bannerList)
  if (urls.length) {
    cacheHomeBannerImageUrls(urls)
    preloadImages(urls, { linkPreloadCount: 2 })
  }
}

export function preloadHomeCriticalImages(settingConfig) {
  preloadImages(collectHomeCriticalImageUrls(settingConfig), { linkPreloadCount: 8 })
  preloadCachedHomeBannerImages()
}
