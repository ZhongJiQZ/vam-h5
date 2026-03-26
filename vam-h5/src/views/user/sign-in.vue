<!-- 登录 -->
<template>
  <div class="sign-in-page">
    <header class="sign-in-header">
      <img :src="logoPng" class="logo" alt="" />
      <img
        :src="langPng"
        class="lang-icon"
        alt=""
        @click="$router.push('/language-selection')"
      />
    </header>

    <div class="sign-in-card">
      <button type="button" class="card-close" @click="$router.push('/')" aria-label="close">
        <img :src="closePng" alt="" />
      </button>

      <h1 class="card-title">
        {{ _t18('login_title') }} {{ _getConfig('_APP_META_TITLE') }}
      </h1>

      <div class="loginMethod">
        <van-tabs
          v-model:active="active"
          shrink
          color="transparent"
          title-active-color="#111"
          title-inactive-color="#666"
          class="login-tabs"
        >
          <van-tab v-for="(item, index) in tabList" :key="index" :title="item.title">
            <component :is="currentComponent"></component>
          </van-tab>
        </van-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { _t18, _getConfig } from '@/utils/public'
import AccountLogin from './components/sign-in/AccountLogin.vue'
import EmailLogin from './components/sign-in/EmailLogin.vue'
import MobileLogin from './components/sign-in/MobileLogin.vue'
import { useMainStore } from '@/store/index.js'
import logoPng from '@/assets/images/login/logo.png'
import langPng from '@/assets/images/login/lang.png'
import closePng from '@/assets/images/login/close.png'

/**
 * 登录注册方式
 * [{ id: 1, title: '账号登录', type: 1 },{ id: 2, title: '邮箱登录', type: 2 },{ id: 3, title: '手机登录', type: 3 }]
 */
const mainStore = useMainStore()
const tabList = computed(() => {
  let list = []
  if (mainStore.getLoginMethodList.ordinaryIsOpen || ['aams'].includes(__config._APP_ENV)) {
    let obj = {}
    obj['id'] = 1
    obj['title'] = _t18('login_account', ['bitmake', 'aams'])
    obj['type'] = '1'
    obj['componentName'] = AccountLogin
    list.push(obj)
  }
  if (mainStore.getLoginMethodList.emailIsOpen && !['aams'].includes(__config._APP_ENV)) {
    let obj = {}
    obj['id'] = 2
    obj['title'] = _t18('login_email')
    obj['type'] = '2'
    obj['componentName'] = EmailLogin
    list.push(obj)
  }
  if (mainStore.getLoginMethodList.phoneIsOpen) {
    let obj = {}
    obj['id'] = 3
    obj['title'] = _t18('login_mobile')
    obj['type'] = '3'
    obj['componentName'] = MobileLogin
    list.push(obj)
  }
  if (['coinsexpto'].includes(__config._APP_ENV)) {
    list = list.reverse()
  }
  return list
})
const currentComponent = computed(() => {
  return tabList.value[active.value].componentName
})
const active = ref(0)
</script>

<style lang="scss" scoped>
$veloxam-dark: #0c1017;
$veloxam-green: #17ac74;

.sign-in-page {
  min-height: 100vh;
  background: $veloxam-dark;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.sign-in-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 28px;
  flex-shrink: 0;

  .logo {
    height: 42px;
    width: auto;
    max-width: min(200px, 55vw);
    object-fit: contain;
    display: block;
  }

  .lang-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    cursor: pointer;
  }
}

.sign-in-card {
  position: relative;
  flex: 1;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 28px 20px 24px;
  margin-top: auto;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
}

.card-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  padding: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
}

.card-title {
  margin: 0 40px 20px 0;
  font-size: 22px;
  font-weight: 700;
  color: #111;
  line-height: 1.35;
}

.loginMethod {
  padding: 0;

  :deep(.van-tab__text) {
    font-size: 15px;
  }

  :deep(.van-tabs__wrap) {
    height: auto;
  }

  :deep(.van-tabs__nav) {
    background: #eceff1 !important;
    border-radius: 12px;
    padding: 4px !important;
    margin: 0 0 8px;
  }

  :deep(.van-tabs__line) {
    display: none;
  }

  :deep(.van-tab) {
    flex: 1;
    border-radius: 10px;
    padding: 10px 8px !important;
    color: #666 !important;
    line-height: 1.2;
  }

  :deep(.van-tab--active) {
    color: #111 !important;
    font-weight: 600;
    background: #fff !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  :deep(.van-tabs__content) {
    padding-top: 8px;
  }

  :deep(.van-count-down) {
    font-size: 14px;
    color: $veloxam-green;
    padding: 0;
  }

  /* 表单：圆角输入、标签灰字 */
  :deep(.formData > p) {
    margin: 18px 0 8px;
    color: #6b7280;
    font-size: 14px;
  }

  :deep(.formData > div) {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px 12px;
    background: #fafafa;
  }

  :deep(.formData input) {
    border-radius: 0;
    background: transparent !important;
  }

  :deep(.formData > div > p) {
    background: $veloxam-green !important;
    border-radius: 8px !important;
    padding: 6px 12px !important;
    color: #fff !important;
    font-size: 13px;
    white-space: nowrap;
  }

  :deep(.forgotPwd) {
    text-align: left;
    color: $veloxam-green !important;
    font-size: 14px;
    margin-top: 14px;
    text-decoration: none;
  }

  /* 主按钮：深色胶囊 */
  :deep(.btnBox > div) {
    border-radius: 999px !important;
    padding: 15px 0 !important;
    background: $veloxam-dark !important;
    color: #fff !important;
    border: none !important;
    font-size: 16px;
    font-weight: 600;
    margin-top: 28px;
  }

  :deep(.box) {
    padding: 0 0 32px;
  }

  :deep(.account) {
    padding: 24px 0 0;
    text-align: center;
    font-size: 15px;
    color: #374151;

    span {
      color: $veloxam-green !important;
      text-decoration: none !important;
      font-weight: 500;
    }
  }
}
</style>
