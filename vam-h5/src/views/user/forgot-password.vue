<!-- 忘记密码 - GXPEX 暗紫主题 -->
<template>
  <div class="forgot-page">
    <img :src="bgImg" class="forgot-bg" alt="" />

    <div class="forgot-content">
      <button type="button" class="back-btn" @click="$router.back()" aria-label="back">
        <img :src="iconBack" alt="" />
      </button>

      <div class="logo-block">
        <img :src="logoG" class="logo-g" alt="GXPEX" />
      </div>

      <h1 class="welcome">{{ _t18('forget_pwd', ['bitmake']) }}</h1>

      <div class="form form--panel">
        <div class="field">
          <img :src="iconAccount" class="field__icon" alt="" />
          <input
            v-model="formData.email"
            type="text"
            class="field__input"
            :placeholder="_t18('login_emailCode')"
          />
        </div>

        <div class="field field--code">
          <img :src="iconInvite" class="field__icon" alt="" />
          <input
            v-model="formData.code"
            type="text"
            class="field__input"
            :placeholder="_t18('login_please')"
          />
          <span v-if="!flag" class="code-send" @click="send()">{{ _t18('login_send') }}</span>
          <span v-else class="code-count">
            <van-count-down :time="time" format="ss" @finish="finish" />
          </span>
        </div>

        <div class="field">
          <img :src="iconLock" class="field__icon" alt="" />
          <input
            v-model="formData.password"
            :type="showk ? 'text' : 'password'"
            class="field__input"
            :placeholder="_t18('forgot_newPwd')"
          />
          <img
            :src="showk ? iconEye : iconEyeOff"
            class="field__icon field__icon--right"
            alt=""
            @click="showk = !showk"
          />
        </div>

        <div class="field">
          <img :src="iconLock" class="field__icon" alt="" />
          <input
            v-model="formData.password2"
            :type="requireShowk ? 'text' : 'password'"
            class="field__input"
            :placeholder="_t18('forgot_require_newPwd')"
            @input="inputPass"
          />
          <img
            :src="requireShowk ? iconEye : iconEyeOff"
            class="field__icon field__icon--right"
            alt=""
            @click="requireShowk = !requireShowk"
          />
        </div>

        <p class="requirePass" v-if="requirePass">*{{ _t18('register_pwd_diff') }}</p>

        <Footer :type="2" :formDataToForget="formData"></Footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import Footer from './components/signFooter.vue'
import { emailCode } from '@/api/user'
import { showToast } from 'vant'
import { useToast } from '@/hook/useToast'
const { _toast } = useToast()
import { _t18 } from '@/utils/public'
import bgImg from '@/assets/images/gxpex/login/bg.png'
import logoG from '@/assets/images/gxpex/login/gxpenlogo.png'
import iconAccount from '@/assets/images/gxpex/login/icon-account.svg'
import iconLock from '@/assets/images/gxpex/signup/icon-lock.svg'
import iconEye from '@/assets/images/gxpex/signup/icon-eye.svg'
import iconEyeOff from '@/assets/images/gxpex/signup/icon-eye-off.svg'
import iconInvite from '@/assets/images/gxpex/signup/icon-invite.svg'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'

const showk = ref(false)
const requireShowk = ref(false)
const formData = ref({
  type: 2,
  email: '',
  password: '',
  password2: '',
  code: ''
})
const requirePass = ref(false)
const inputPass = () => {
  requirePass.value = formData.value.password2 !== formData.value.password ? true : false
}
const flag = ref(false)
const time = ref(0)
const send = () => {
  if (formData.value.email == '') {
    _toast(`login_please_emailCode`)
    return
  }
  emailCode('FIND_PASSWORD', formData.value.email).then((res) => {
    if (res.code == '200') {
      flag.value = true
      time.value = 60 * 1000
    } else {
      showToast(res.msg)
    }
  })
}
const finish = () => {
  flag.value = false
}
</script>

<style lang="scss" scoped>
$purple-1: #b388ff;
$purple-2: #a041ed;
$purple-3: #872ddc;
$font-raleway: 'Raleway', -apple-system, 'PingFang SC', sans-serif;
$font-pingfang: 'PingFang SC', -apple-system, 'Raleway', sans-serif;

.forgot-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #0a0816;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.forgot-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.forgot-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 28px 24px;
  min-height: 100vh;
  box-sizing: border-box;
}

.back-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  background: rgba(20, 12, 38, 0.55);
  border: 1px solid rgba(160, 65, 237, 0.25);
  border-radius: 50%;
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  &:active { transform: scale(0.94); }
  img {
    width: 16px;
    height: 16px;
    display: block;
    object-fit: contain;
  }
}

.logo-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 6px;
}
.logo-g {
  width: 92px;
  height: 92px;
  display: block;
  border-radius: 18px;
  filter: drop-shadow(0 6px 24px rgba(160, 65, 237, 0.5));
}

.welcome {
  margin: 20px 0 24px;
  font-family: $font-raleway;
  font-size: 26px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.3px;
  line-height: 1.1;
  text-align: center;
}

.form {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
}
.form--panel {
  padding: 22px 18px 18px;
  background: linear-gradient(
    180deg,
    rgba(20, 12, 38, 0.45) 0%,
    rgba(20, 12, 38, 0.15) 100%
  );
  border: 1px solid rgba(160, 65, 237, 0.22);
  border-radius: 22px;
  backdrop-filter: blur(10px);
  box-shadow: 0 6px 30px rgba(160, 65, 237, 0.15);
}

.field {
  position: relative;
  display: flex;
  align-items: center;
  height: 48px;
  margin-bottom: 14px;
  padding: 0 16px;
  background: rgba(20, 12, 38, 0.55);
  border: 1px solid rgba(160, 65, 237, 0.25);
  border-radius: 999px;
  backdrop-filter: blur(6px);

  &--code { padding-right: 6px; }

  &__icon {
    width: 18px;
    height: 18px;
    display: block;
    flex-shrink: 0;
    object-fit: contain;
    opacity: 0.85;

    &--right {
      margin-left: auto;
      cursor: pointer;
      width: 22px;
      height: 22px;
    }
  }

  &__input {
    flex: 1;
    height: 100%;
    margin-left: 12px;
    border: 0;
    outline: 0;
    background: transparent;
    font-family: $font-pingfang;
    font-size: 14px;
    color: #fff;
    caret-color: $purple-1;
    min-width: 0;

    &::placeholder { color: rgba(202, 202, 202, 0.7); }
  }
}

.code-send {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, $purple-1 0%, $purple-2 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(160, 65, 237, 0.4);
  &:active { transform: scale(0.96); }
}

.code-count {
  flex-shrink: 0;
  padding: 6px 14px;
  color: $purple-1;
  font-size: 14px;
  font-weight: 600;
  :deep(.van-count-down) {
    color: inherit;
    font-size: inherit;
  }
}

.requirePass {
  font-size: 12px;
  margin: 4px 6px 12px;
  color: #ff6b8a;
}

/* 覆写 signFooter（type=2 - 忘记密码） */
:deep(.box) {
  padding: 0;
  margin-top: 8px;
}
:deep(.btnBox) {
  margin: 0;
  background: transparent !important;
  border: 0 !important;
  border-radius: 999px;
  overflow: hidden;
}
:deep(.btnBox .btn1),
:deep(.btnBox .btn2) {
  background: linear-gradient(135deg, $purple-1 0%, $purple-2 50%, $purple-3 100%) !important;
  color: #fff !important;
  border: 1.5px solid $purple-1 !important;
  border-radius: 999px !important;
  padding: 14px 0 !important;
  font-family: $font-raleway;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.2px;
  box-shadow:
    0 8px 22px rgba(160, 65, 237, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  &:active { transform: scale(0.98); }
}
:deep(.info) {
  margin-top: 18px;
  text-align: center;
  font-family: $font-pingfang;
  font-size: 12px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.65);

  span {
    color: $purple-1 !important;
    text-decoration: none;
    cursor: pointer;
    &:active { opacity: 0.7; }
  }
}
</style>
