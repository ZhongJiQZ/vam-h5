<script setup>
import { DIFF_ISFREEZE } from '@/config/index'
import { useMainStore } from '@/store/index.js'
import { useUserStore } from '@/store/user/index.js'
import { socketDict } from '@/config/dict'
import Loading from '@/components/common/Loading/index.vue'
import ActivityPopup from '@/components/Defi/ActivityPopup.vue'
import { getShowDefiActivityNoticeApi } from './api/defi'
import ServicePopup from '@/components/CustomerService/ServicePopup.vue'
// import FreezePopup from '@/components/Freeze/FreezePopup.vue'
import { useToast } from './hook/useToast'
import { _t18, _toView } from '@/utils/public'
import { openCustomerService, syncSaleSmartlyLogin, injectSaleSmartlyPlatformScript } from '@/utils/salesmartly'
import { useRouter } from 'vue-router'
import { initWebSocket } from '@/plugin/socket'
import { showDialog } from 'vant'
import { buildTabbarRouteNameList, shouldShowTabbar } from '@/utils/tabbar'
import PubSub from 'pubsub-js'

// import { useFreeze } from '@/hook/useFreeze'

// const isFreeze = useFreeze()
// console.log('isFreeze', isFreeze)
const router = useRouter()

/**
 * 客服弹窗
 */
const showServicePopup = ref(false)

/**
 * defi 空投弹窗
 */
const showDefiActivityPopup = ref(false)

/**
 * 活动详情
 */
const activityInfo = ref({})

/**
 * 申购订阅Key
 */
const ownCoinKey = ref('')

/**
 * 申购通知
 */
const ownCoinKeyNotification = () => {
  ownCoinKey.value = PubSub.subscribe(socketDict.OWNCOIN, (key, data) => {
    showDialog({
      title: data.amountLimit, // 额度
      message: data.msg
    }).then(() => {
      // 点击确认进入认购页
    })
  })
}
ownCoinKeyNotification()

/**
 * 用户状态改变Key
 */
const userStatusKey = ref('')
/**
 * 用户状态改变通知
 */
const userStatusNotification = () => {
  userStatusKey.value = PubSub.subscribe(socketDict.USER_STATUS, (key, data) => {
    userStore.token && userStore.getUserInfo()
  })
}
userStatusNotification()

/**
 * 获取活动通知
 */
const getShowDefiActivityNotice = async () => {
  const res = await getShowDefiActivityNoticeApi(userStore.userInfo.user.userId)
  if (res.code == 200 && res.data.length) {
    res.data = res.data[0]
    res.data.days = Math.ceil((res.data.endTimeS - res.data.beginTimeS) / (24 * 60 * 60 * 1000))
    activityInfo.value = res.data
    showDefiActivityPopup.value = true
  }
}
const userStore = useUserStore()
const mainStroe = useMainStore()
const isLoading = ref(false)
const route = useRoute()
const tabbarPathNameList = computed(() => [
  ...buildTabbarRouteNameList(mainStroe.getTabbarList),
  'OrderCenter',
  'AssetRecord',
  'FinancialDetails'
])
const showTabbar = computed(() => shouldShowTabbar(route, mainStroe.getTabbarList))

const { _toast } = useToast()
/**
 * 多语言 监听回调事件
 */
const event_toastChange = (e) => {
  let name = e.detail.name
  let platform = e.detail.platform || []
  name && _toast(name, platform)
}

/**
 * 冻结弹窗 isFreeze= '2'
 */
const showIsFreezePopup = ref(false)

/**
 * 用户信息改变监听回调事件
 */
const event_userInfoChange = (e) => {
  // defi 活动通知
  getShowDefiActivityNotice()
  // 检测是否冻结
  if (!DIFF_ISFREEZE.includes(__config._APP_ENV)) {
    showIsFreezePopup.value = e.detail.user.status == 1
  }

  // 消息通知订阅
  initWebSocket(e.detail?.user.userId)
  // SaleSmartly 预同步用户（跳转客服前客服侧可识别）
  syncSaleSmartlyLogin(userStore.userInfo)
}

// 冻结弹窗
const event_freezePopup = () => {
  showIsFreezePopup.value = true
}

/**
 * 确认冻结弹窗
 */
const confirmFreezeDialog = () => {
  if (['rxce'].includes(__config._APP_ENV)) {
    // rxce冻结账户:联系客服，退出登录
    event_serviceChange()
    userStore.signOut()
    // setTimeout(() => location.reload(), 10)
  } else if (DIFF_ISFREEZE.includes(__config._APP_ENV)) {
    event_serviceChange()
  } else {
    // 冻结账户:联系客服，退出登录,返回登录页
    showIsFreezePopup.value = false
    _toView('/sign-in')
    userStore.signOut()
    // setTimeout(() => location.reload(), 10)
  }
}
/**
 * 客服点击监听
 */
const event_serviceChange = () => {
  const list = mainStroe.getCustomerServiceList
  if (!list.length) return
  if (list.length === 1) {
    const item = list[0]
    if (item?.callback) {
      item.callback()
      return
    }
    openCustomerService({
      userInfo: userStore.userInfo,
      preferWidget: true,
      appEnv: __config._APP_ENV
    })
  } else {
    showServicePopup.value = true
  }
}
onMounted(() => {
  injectSaleSmartlyPlatformScript(__config._APP_ENV)
  userStore.token && userStore.getUserInfo()

  document.addEventListener('event_toastChange', event_toastChange)
  document.addEventListener('event_serviceChange', event_serviceChange)
  document.addEventListener('event_userInfoChange', event_userInfoChange)
  document.addEventListener('event_freezePopup', event_freezePopup)
})
onUnmounted(() => {
  document.removeEventListener('event_toastChange', event_toastChange)
  document.removeEventListener('event_serviceChange', event_serviceChange)
  document.removeEventListener('event_freezePopup', event_freezePopup)

  ownCoinKey && PubSub.unsubscribe(ownCoinKey)
  userStatusKey && PubSub.unsubscribe(userStatusKey)
})
</script>

<template>
  <div>
    <loading v-if="isLoading" :loading="isLoading"></loading>
    <router-view v-slot="{ Component, route }">
      <transition name="fade">
        <div :key="route.name">
          <keep-alive :include="[...tabbarPathNameList]">
            <component :is="Component" :key="route.path"></component>
          </keep-alive>
        </div>
      </transition>
    </router-view>
  </div>
  <Tabbar v-if="showTabbar"></Tabbar>
  <!-- 幸运活动 -->
  <ActivityPopup v-model:value="showDefiActivityPopup" :data="activityInfo"></ActivityPopup>
  <!-- 客服弹窗 -->
  <ServicePopup
    v-model:value="showServicePopup"
    :data="mainStroe.getCustomerServiceList"
  ></ServicePopup>
  <!-- 冻结弹窗 -->
  <van-dialog
    v-model:show="showIsFreezePopup"
    :title="_t18('notify')"
    :message="_t18('account_frozen')"
    theme="round-button"
    confirmButtonColor="#17ac74"
    :confirmButtonText="_t18('btnConfirm')"
    @confirm="confirmFreezeDialog"
  >
  </van-dialog>
</template>

<style lang="scss">
// .fade-enter-active {
//   animation: fadeIn 0.1s ease-in;
// }

// .fade-leave-active {
//   animation: fadeOut 0.01s ease-in;
// }
/*
.fade-enter {
  animation: fadeIn 0.3s ease-in;
}

.fade-leave-to {
  animation: fadeOut 0.3s ease-out;
} */

/* 绿涨 */
.rise {
  color: var(--ex-rfd-rise) !important;

  &.rfd-sign::before {
    content: '+';
    padding-right: 2px;
    display: inline-block;
  }

  &.rfd-bg {
    background-color: var(--ex-rfd-rise-bg) !important;
    /* color: var(--ex-white) !important; */
  }
}

/* 红跌 */
.fall {
  color: var(--ex-rfd-fall) !important;

  &.rfd-sign::before {
    content: '-';
    padding-right: 2px;
    display: inline-block;
  }

  &.rfd-bg {
    background-color: var(--ex-rfd-fall-bg) !important;
    /* color: var(--ex-white) !important; */
  }
}

.draw {
  color: var(--ex-rfd-draw) !important;

  &.rfd-bg {
    background-color: var(--ex-rfd-draw-bg) !important;
  }
}

.sidebar {
  background: var(--ex-default-background-color) !important;
}
.van-dialog__header,
.van-dialog__content {
  background: #fff;
}
</style>
