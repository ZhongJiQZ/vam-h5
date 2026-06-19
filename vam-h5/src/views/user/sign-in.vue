<!-- 登录页 - GXPEX 设计稿（3、登录） -->
<template>
  <div class="login-page">
    <img :src="bgImg" class="login-bg" alt="" />

    <div class="login-content">
      <!-- Logo (G + GXPEX 一体图) -->
      <div class="logo-block">
        <img :src="logoG" class="logo-g" alt="GXPEX" />
      </div>

      <!-- Welcome To -->
      <h1 class="welcome">Welcome To</h1>

      <!-- 表单（含玻璃面板） -->
      <div class="form form--panel">
        <div class="field">
          <img :src="iconAccount" class="field__icon" alt="" />
          <input
            v-model="form.username"
            type="text"
            class="field__input"
            placeholder="Account"
            autocomplete="username"
          />
        </div>

        <div class="field">
          <img :src="iconPassword" class="field__icon" alt="" />
          <input
            v-model="form.password"
            :type="showPwd ? 'text' : 'password'"
            class="field__input"
            placeholder="Password"
            autocomplete="current-password"
          />
          <img
            :src="iconEye"
            class="field__icon field__icon--right"
            :class="{ 'is-on': showPwd }"
            alt=""
            @click="showPwd = !showPwd"
          />
        </div>

        <!-- 图形验证码（如后端要求） -->
        <div v-if="mainStore.getISCode" class="field field--captcha">
          <input
            v-model="form.code"
            type="text"
            class="field__input field__input--captcha"
            placeholder="Code"
          />
          <img :src="codeUrl" class="captcha-img" @click="refreshCode" alt="" />
        </div>

        <div class="forgot" @click="$router.push('/forgot-password')">Forgot Password?</div>

        <button class="btn btn--primary" :disabled="loading" @click="doLogin">
          <span>Sign Up</span>
        </button>

        <button class="btn btn--secondary" @click="doWalletLogin">
          <span>Connect Wallet</span>
        </button>
      </div>

      <div class="bottom-link">
        <span class="bottom-link__muted">Forgot Password?</span>
        <span class="bottom-link__accent" @click="$router.push('/sign-up')">Sign Up Now</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '@/store/index.js'
import { useUserStore } from '@/store/user/index'
import { useToast } from '@/hook/useToast'
import { signIn, signUp } from '@/api/user'
import { check as checkETH, connect as connectETH } from '@/plugin/chain/eth'
import { check as checkTRON } from '@/plugin/chain/tron'
import { showToast } from 'vant'
import bgImg from '@/assets/images/gxpex/login/bg.png'
import logoG from '@/assets/images/gxpex/login/gxpenlogo.png'
import iconAccount from '@/assets/images/gxpex/login/icon-account.svg'
import iconPassword from '@/assets/images/gxpex/login/icon-password.svg'
import iconEye from '@/assets/images/gxpex/login/icon-eye.svg'

const router = useRouter()
const mainStore = useMainStore()
const userStore = useUserStore()
const { _toast } = useToast()

const form = ref({ username: '', password: '', code: '' })
const showPwd = ref(false)
const loading = ref(false)

// 图形验证码
const timestamp = ref(+new Date())
const codeUrl = computed(
  () => `${mainStore.verificationCodeUrl}?codeType=LOGIN&timestamp=${timestamp.value}`
)
const refreshCode = () => {
  timestamp.value = +new Date()
}

const pickLoginToken = (res) => {
  const data = res?.data
  if (!data) return ''
  if (typeof data === 'string') return data.trim()
  return String(data.satoken || data.token || data.saToken || '').trim()
}

const finishLogin = async (token) => {
  userStore.setToken(token)
  userStore.setIsSign(true)
  const profile = await userStore.getUserInfo({ silent: true })
  if (!profile) {
    _toast('error')
    return false
  }
  _toast('login_success')
  await router.replace('/')
  return true
}

const doLogin = async () => {
  if (loading.value) return
  if (!form.value.username) return _toast('please_user')
  if (!form.value.password) return _toast('please_pwd')
  if (mainStore.getISCode && !form.value.code) return _toast('please_code')

  loading.value = true
  try {
    const res = await signIn({
      signType: 3,
      loginName: form.value.username,
      loginPassword: form.value.password,
      code: form.value.code
    })
    const token = pickLoginToken(res)
    if ((res.code == '200' || res.code == 200) && token) {
      await finishLogin(token)
    } else {
      _toast(res.msg || 'error')
      refreshCode()
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

// 钱包登录（沿用原 signFooter 逻辑）
const connectTronForLogin = async () => {
  let result = { code: 200 }
  const isChecked = await checkTRON()
  if (isChecked) {
    try {
      const tronAccounts = await window.tronWeb.request({ method: 'tron_requestAccounts' })
      let addr = null
      if (Array.isArray(tronAccounts) && tronAccounts.length) {
        addr = tronAccounts[0]
      } else if (tronAccounts && tronAccounts.code == 200) {
        addr = tronAccounts[0] || window.tronWeb?.defaultAddress?.base58
      }
      if (addr) result.data = { type: 'TRON', address: addr }
      else {
        result.code = 500
        result.msg = tronAccounts?.message || 'Please install the TronLink extension.'
      }
    } catch (error) {
      result.code = 500
      result.msg = error.message
    }
  } else {
    result.code = 500
    result.msg = 'Please install the TronLink extension.'
  }
  return result
}

const doWalletLogin = async () => {
  const isTron = await checkTRON()
  const isEth = await checkETH()
  if (!isEth && !isTron) {
    _toast('login_wallet_need_env')
    return
  }
  let res = null
  if (isEth) res = await connectETH()
  else res = await connectTronForLogin()
  if (!res || res.code !== 200) {
    res?.msg && showToast(res.msg)
    return
  }
  try {
    const r = await signUp({
      signType: 0,
      address: res.data.address,
      walletType: res.data.type
    })
    const token = pickLoginToken(r)
    if ((r.code == '200' || r.code == 200) && token) {
      await finishLogin(token)
    } else {
      _toast(r.msg || 'error')
    }
  } catch (e) {
    console.log(e)
  }
}
</script>

<style lang="scss" scoped>
$purple-1: #b388ff;
$purple-2: #a041ed;
$purple-3: #872ddc;
$font-raleway: 'Raleway', -apple-system, 'PingFang SC', sans-serif;
$font-pingfang: 'PingFang SC', -apple-system, 'Raleway', sans-serif;

.login-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #0a0816;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.login-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.login-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 28px 32px;
  min-height: 100vh;
  box-sizing: border-box;
}

/* Logo */
.logo-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 6px;
}
.logo-g {
  width: 110px;
  height: 110px;
  display: block;
  border-radius: 22px;
  filter: drop-shadow(0 6px 28px rgba(160, 65, 237, 0.5));
}

.welcome {
  margin: 28px 0 36px;
  font-family: $font-raleway;
  font-size: 30px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.3px;
  line-height: 1.1;
  text-align: center;
}

/* 表单 */
.form {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
}
.form--panel {
  padding: 24px 20px 22px;
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
  height: 52px;
  margin-bottom: 18px;
  padding: 0 18px;
  background: rgba(20, 12, 38, 0.55);
  border: 1px solid rgba(160, 65, 237, 0.25);
  border-radius: 999px;
  backdrop-filter: blur(6px);

  &--captcha {
    padding-right: 6px;
  }

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
      &.is-on { opacity: 1; }
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

    &::placeholder {
      color: rgba(202, 202, 202, 0.7);
    }

    &--captcha {
      flex: 1;
    }
  }
}

.captcha-img {
  height: 42px;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.forgot {
  margin: -4px 4px 22px;
  font-family: $font-pingfang;
  font-size: 13px;
  font-weight: 500;
  color: $purple-1;
  align-self: flex-start;
  cursor: pointer;
  &:active { opacity: 0.7; }
}

/* 按钮 */
.btn {
  display: block;
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 999px;
  font-family: $font-raleway;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: #fff;
  cursor: pointer;
  user-select: none;
  margin-bottom: 16px;

  &--primary {
    background: linear-gradient(135deg, $purple-1 0%, $purple-2 50%, $purple-3 100%);
    box-shadow:
      0 8px 22px rgba(160, 65, 237, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    &:active { transform: scale(0.98); }
    &:disabled { opacity: 0.65; cursor: not-allowed; }
  }
  &--secondary {
    background: rgba(20, 12, 38, 0.4);
    border: 1px solid rgba(160, 65, 237, 0.45);
    backdrop-filter: blur(6px);
    &:active { background: rgba(160, 65, 237, 0.18); }
  }
}

.bottom-link {
  margin-top: auto;
  padding-top: 32px;
  font-family: $font-pingfang;
  font-size: 13px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 6px;

  &__muted {
    color: rgba(255, 255, 255, 0.55);
  }
  &__accent {
    color: $purple-1;
    cursor: pointer;
    &:active { opacity: 0.7; }
  }
}
</style>
