<!-- 绑定邮箱 -->
<template>
  <div class="page-email-auth">
    <header class="ea-header">
      <button type="button" class="ea-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="ea-header__back-icon" />
      </button>
      <h1 class="ea-header__title">{{ _t18('sidebar_certified') }}</h1>
      <button type="button" class="ea-header__action" aria-label="service" @click="goService">
        <img :src="iconService" alt="" class="ea-header__action-icon" />
      </button>
    </header>

    <main class="ea-main">
      <div v-if="!bind" class="bind-not">
        <div class="field-block">
          <div class="field-label">{{ _t18('login_emailCode') }}</div>
          <div class="field-input">
            <span class="field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </span>
            <input
              v-model="formData.email"
              type="email"
              inputmode="email"
              autocomplete="email"
              class="field-control"
              :placeholder="_t18('login_emailCode')"
            />
          </div>
        </div>

        <div class="field-block">
          <div class="field-label">{{ _t18('verification_code') }}</div>
          <div class="field-input field-input--code">
            <span class="field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              v-model="formData.code"
              type="text"
              inputmode="numeric"
              class="field-control"
              :placeholder="_t18('recharge_input')"
            />
            <div class="code-side">
              <div v-if="flag" class="code-wait">
                <van-count-down :time="time" format="ss" @finish="finish" />
              </div>
              <button v-else type="button" class="send-btn" @click="handleSend">
                {{ _t18('login_send') }}
              </button>
            </div>
          </div>
        </div>

        <div class="btnBox" @click="handleEmailBind">
          <ButtonBar :btnValue="_t18('btnConfirm', ['bitmake'])" />
        </div>
      </div>

      <div v-else class="bind-yes">
        <div class="bind-yes__top">
          <span class="bind-yes__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
              <circle cx="19" cy="6" r="4" fill="currentColor" stroke="none" opacity="0.85" />
              <path d="M17.5 6L18.5 7L20.5 5" stroke="#0a0610" stroke-width="1.6" />
            </svg>
          </span>
          <div class="bind-yes__title">{{ _t18('email_bind_success') }}</div>
          <div class="bind-yes__email">{{ _t18('email_your') }}：{{ email }}</div>
        </div>

        <div class="change-email" @click="bind = false">{{ _t18('email_update') }}</div>
        <div class="back-home" @click="router.push('/')">{{ _t18('backhome') }}</div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import { emailCode, emailBind } from '@/api/user'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'
import { _t18, _back } from '@/utils/public'
import { dispatchCustomEvent } from '@/utils'
import { useToast } from '@/hook/useToast'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'

const { _toast } = useToast()
const router = useRouter()
const userStore = useUserStore()
userStore.getUserInfo()

const { userInfo } = storeToRefs(userStore)
const email = ref(userInfo.value.user?.email)
const bind = ref(!!email.value)

const formData = ref({
  email: '',
  code: ''
})

const time = ref(0)
const flag = ref(false)

const handleSend = () => {
  if (formData.value.email == '') {
    _toast('login_please_emailCode')
    return
  }
  flag.value = true
  time.value = 60 * 1000
  emailCode('BIND', formData.value.email).then((res) => {
    if (res.code != '200') {
      flag.value = false
      showToast(res.msg)
    }
  })
}

const finish = () => {
  flag.value = false
}

const handleEmailBind = () => {
  if (formData.value.email == '') {
    _toast('login_please_emailCode')
    return
  }
  if (formData.value.code == '') {
    _toast('verification_code')
    return
  }
  emailBind(formData.value.email, formData.value.code).then((res) => {
    if (res.code == '200') {
      _toast('email_bind_success')
      email.value = formData.value.email
      bind.value = true
    } else {
      showToast(res.msg)
    }
  })
}

const goService = () => dispatchCustomEvent('event_serviceChange')
</script>

<style lang="scss" scoped>
.page-email-auth {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏 */
.ea-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.ea-header__back {
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

.ea-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.ea-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.ea-header__action {
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

.ea-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

/* Body */
.ea-main {
  padding: 16px 14px 0;
}

/* 表单 */
.field-block {
  margin-bottom: 18px;
}

.field-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 8px;
  padding-left: 4px;
  line-height: 1.3;
}

.field-input {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 50px;
  padding: 0 16px;
  border-radius: 25px;
  background: rgb(34, 34, 34);
  border: 1px solid rgba(160, 65, 237, 0.45);
  box-shadow: 0 0 0 1px rgba(160, 65, 237, 0.12), 0 0 14px rgba(160, 65, 237, 0.18);
  box-sizing: border-box;
}

.field-input--code {
  padding-right: 6px;
}

.field-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: rgb(196, 124, 255);
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.field-control {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #fff;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
}

.code-side {
  flex-shrink: 0;
}

.send-btn {
  height: 32px;
  min-width: 80px;
  padding: 0 16px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  box-shadow: 0 4px 10px rgba(127, 43, 218, 0.32);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.code-wait {
  min-width: 80px;
  text-align: center;
  font-size: 13px;
  color: rgb(196, 124, 255);
  padding: 0 8px;
}

.page-email-auth :deep(.code-wait .van-count-down) {
  font-size: 13px;
  color: rgb(196, 124, 255);
  line-height: 1;
}

.btnBox {
  margin-top: 36px;
}

.ea-main :deep(.btnBox .btn1),
.ea-main :deep(.btnBox .btn2) {
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

/* 已绑成功态 */
.bind-yes {
  padding-top: 20px;

  &__top {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    color: rgb(196, 124, 255);
    filter: drop-shadow(0 8px 24px rgba(160, 65, 237, 0.35));
    margin: 12px 0 28px;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &__title {
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 12px;
  }

  &__email {
    text-align: center;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
  }

  .change-email {
    margin: 40px 0 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    color: #fff;
    background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
    box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35);
    font-size: 15px;
    font-weight: 500;
    border-radius: 999px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .back-home {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    font-weight: 500;
    border-radius: 999px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
