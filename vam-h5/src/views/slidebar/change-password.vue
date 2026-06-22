<script setup>
import SetForm from './components/change-password/SetForm.vue'
import EmailForm from './components/change-password/EmailForm.vue'
import AccountForm from './components/change-password/AccountForm.vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { _t18, _back } from '@/utils/public'
import { dispatchCustomEvent } from '@/utils'
import { useToast } from '@/hook/useToast'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'

const { _toast } = useToast()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 修改登录密码的方式 (true 普通，false 邮箱)
const updateLoginPwdMethod = ref(true)
// 是否已有登录密码
const loginPassword = ref(userInfo.value.user?.loginPassword || '')
const changeMethod = () => {
  if (!userInfo.value.user?.email) {
    return _toast('please_bind_email')
  }
  updateLoginPwdMethod.value = !updateLoginPwdMethod.value
}
const goService = () => dispatchCustomEvent('event_serviceChange')
</script>

<template>
  <div class="page-change-pwd">
    <header class="cp-header">
      <button type="button" class="cp-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="cp-header__back-icon" />
      </button>
      <h1 class="cp-header__title">{{ _t18('password_set') }}</h1>
      <button type="button" class="cp-header__action" aria-label="service" @click="goService">
        <img :src="iconService" alt="" class="cp-header__action-icon" />
      </button>
    </header>

    <main class="cp-main">
      <SetForm v-if="!loginPassword && updateLoginPwdMethod" />
      <AccountForm v-if="loginPassword && updateLoginPwdMethod" />
      <EmailForm v-if="loginPassword && !updateLoginPwdMethod" />

      <div class="footer-link" v-if="loginPassword">
        <span class="link" @click="changeMethod">
          {{ updateLoginPwdMethod ? _t18('password_update_email') : _t18('password_update_pwd') }}
        </span>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.page-change-pwd {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏 */
.cp-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.cp-header__back {
  position: absolute;
  left: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.cp-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.cp-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.cp-header__action {
  position: absolute;
  right: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.cp-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

/* Body */
.cp-main {
  padding: 16px 14px 0;
}

.footer-link {
  margin-top: 24px;
  text-align: center;

  .link {
    font-size: 14px;
    color: rgb(196, 124, 255);
    cursor: pointer;
  }
}

/* 表单按钮：紫渐变胶囊 (ButtonBar 渲染 .btn1/.btn2) */
.cp-main :deep(.btnBox .btn1),
.cp-main :deep(.btnBox .btn2) {
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%) !important;
  border: none !important;
  border-radius: 999px !important;
  height: 48px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35) !important;
}
</style>
