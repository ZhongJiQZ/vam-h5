export const getOrigin = () => {
    if (typeof window === 'undefined') return ''
    const loc = window.location
    if (!loc) return ''
  
    // 1) 标准浏览器有 origin
    if (loc.origin) return loc.origin
  
    // 2) 兼容旧 WebView：自己拼
    if (loc.protocol && loc.host) return `${loc.protocol}//${loc.host}`
  
    return ''
  }
  