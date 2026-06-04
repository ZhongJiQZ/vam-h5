// 用户模块
import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/user'
import { storageDict } from '@/config/dict'
import { dispatchCustomEvent } from '@/utils'
import { useAccountStore } from '../account'
import { useMainStore } from '../index'
import router from '@/router'
import { clearSaleSmartlyLogin } from '@/utils/salesmartly'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      /**
       * token
       */
      token: '',
      /**
       * 是否登录
       */
      isSign: false,
      /**
       * 用户信息
       */
      userInfo: reactive({}),
      /**
       * 资产列表
       */
      asset: reactive([])
    }
  },
  actions: {
    /**
     * 设置 token
     * @param {*} token
     */
    setToken(token) {
      this.token = token || ''
      localStorage.setItem(storageDict.TOKEN, this.token)
    },
    /**
     * 设置 登录状态
     * @param {*} isSign
     */
    setIsSign(isSign) {
      this.isSign = Boolean(isSign)
    },
    /** 根据 token 同步登录态（持久化恢复后与路由守卫保持一致） */
    syncSignFromToken() {
      const token =
        this.token || (typeof localStorage !== 'undefined' ? localStorage.getItem(storageDict.TOKEN) : '')
      this.isSign = Boolean(token)
      if (token && !this.token) {
        this.token = token
      }
    },
    /**
     * 退出登录
     */
    signOut() {
      try {
        clearSaleSmartlyLogin()
        let testPlatform = localStorage.getItem(storageDict.TEST_PLATFORM)
        localStorage.clear()
        sessionStorage.clear()
        if (testPlatform) {
          localStorage.setItem(storageDict.TEST_PLATFORM, testPlatform)
        }
        this.$reset()
        const accountStore = useAccountStore()
        accountStore && accountStore.$reset()
        const mainStore = useMainStore()
        if (mainStore) {
          // 切换账号时清空上一账号的充值地址缓存，避免新账号误用旧缓存导致不再拉取地址
          mainStore.userRechageMap = {}
        }
        router.replace('/sign-in')
        
      } catch (error) {}
    },

    /**
     * 获取用户信息
     * @param {{ silent?: boolean }} [opts] silent 为 true 时不派发 event_userInfoChange（避免打开侧栏等静默刷新触发首页站内信弹窗）
     */
    async getUserInfo(opts) {
      const silent = Boolean(opts && typeof opts === 'object' && opts.silent)
      if (!this.token) {
        this.syncSignFromToken()
      }
      if (!this.token) {
        return null
      }
      const res = await getUserInfo()
      if (res.code != 200 && res.code != '200') {
        // 仅退出登录态，避免 clear 后 isSign/token 不一致导致「提示成功却无法跳转」
        this.signOut()
        return null
      }
      Object.assign(this.userInfo, res.data || {})
      Object.assign(this.asset, this.userInfo.asset || [])
      this.setIsSign(true)
      if (!silent) {
        dispatchCustomEvent('event_userInfoChange', this.userInfo)
      }
      localStorage.setItem(storageDict.USER_INFO, JSON.stringify(this.userInfo))
      const mainStore = useMainStore()
      mainStore.getUserRechageNew()
      return this.userInfo
    }
  },
  // 开启数据持久化
  persist: true

  // // 持久化存储插件其他配置
  // persist: {
  //   // 修改存储中使用的键名称，默认为当前 Store的 id
  //   key: '',
  //   // 修改为 sessionStorage，默认为 localStorage
  //   storage: sessionStorage,
  //   // 部分持久化状态的点符号路径数组，[]意味着没有状态被持久化(默认为undefined，持久化整个状态)
  //   paths: []
  // }
})
