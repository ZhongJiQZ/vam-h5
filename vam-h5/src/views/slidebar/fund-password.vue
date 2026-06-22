<script setup>
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import SetForm from './components/fund-password/SetForm.vue'
import ChangeForm from './components/fund-password/ChangeForm.vue'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'
import { ref } from 'vue'
import { _t18, _back } from '@/utils/public'
import { dispatchCustomEvent } from '@/utils'
import { useToast } from '@/hook/useToast'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'
import iconLock from '@/assets/images/gxpex/security/icon-lock.png'

const { _toast } = useToast()
const userStore = useUserStore()
userStore.getUserInfo()
const { userInfo } = storeToRefs(userStore)

const notPwd = ref(userInfo.value.detail?.userTardPwd)
const success = ref(true)
const changePwd = () => {
  notPwd.value = true
  success.value = false
  userStore.getUserInfo()
}
const setPwd = (v) => {
  success.value = v
  notPwd.value = v
  userStore.getUserInfo()
}
const toCustorm = () => {
  _toast('custorm_service')
}
const goService = () => dispatchCustomEvent('event_serviceChange')
</script>
<template>
  <div class="page-fund-pwd">
    <header class="fp-header">
      <button type="button" class="fp-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="fp-header__back-icon" />
      </button>
      <h1 class="fp-header__title">{{
        notPwd ? _t18('Change_security_password') : _t18('sidebar_tardPwd', ['bitmake'])
      }}</h1>
      <button type="button" class="fp-header__action" aria-label="service" @click="goService">
        <img :src="iconService" alt="" class="fp-header__action-icon" />
      </button>
    </header>

    <main class="fp-main">
      <SetForm v-if="!notPwd && success" @setPwd="setPwd" />
      <ChangeForm v-if="notPwd && !success" @setPwd="setPwd" />

      <!-- 已设置成功态 — 中间紫色大锁图 -->
      <div v-if="notPwd && success" class="fp-success">
        <img :src="iconLock" alt="" class="fp-success__icon" />
        <p class="fp-success__text">{{ _t18('Fund_password_has_set') }}</p>
        <div class="btnBox" @click="changePwd">
          <ButtonBar :btnValue="_t18('Change_security_password')" />
        </div>
        <div class="forgot" @click="toCustorm">{{ _t18('forgot_security_code') }}?</div>
      </div>
    </main>
  </div>
</template>
<style lang="scss" scoped>
.page-fund-pwd {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏 */
.fp-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.fp-header__back {
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

.fp-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.fp-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.fp-header__action {
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

.fp-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

/* Body */
.fp-main {
  padding: 16px 14px 0;
}

/* 表单按钮：紫渐变胶囊 (ButtonBar 渲染 .btn1/.btn2) */
.fp-main :deep(.btnBox .btn1),
.fp-main :deep(.btnBox .btn2) {
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

/* 已设置成功态 */
.fp-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 24px 0 0;

  &__icon {
    display: block;
    width: 140px;
    height: 140px;
    object-fit: contain;
    margin: 24px 0 28px;
    filter: drop-shadow(0 8px 24px rgba(160, 65, 237, 0.35));
  }

  &__text {
    margin: 0 0 36px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.75);
    text-align: center;
  }

  .btnBox {
    width: 100%;
    font-size: 14px;
  }

  .forgot {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    color: rgb(196, 124, 255);
    cursor: pointer;
  }
}
</style>
