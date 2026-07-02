<!-- 注册页 - GXPEX 设计稿（4、注册） -->
<template>
  <div class="signup-page">
    <img :src="bgImg" class="signup-bg" alt="" />

    <div class="signup-content">
      <button type="button" class="lang-btn" @click="$router.push('/language-selection')" aria-label="language">
        <img :src="langIcon" alt="" />
      </button>

      <div class="logo-block">
        <img :src="logoG" class="logo-g" alt="GXPEX" />
      </div>

      <h1 class="welcome">{{ _t18('register_title') }}</h1>

      <div class="form form--panel">
        <div v-if="showTabs" class="register-tabs">
          <button
            type="button"
            class="register-tabs__item"
            :class="{ 'register-tabs__item--active': registerType === 'account' }"
            @click="registerType = 'account'"
          >
            {{ _t18('register_account') }}
          </button>
          <button
            type="button"
            class="register-tabs__item"
            :class="{ 'register-tabs__item--active': registerType === 'email' }"
            @click="registerType = 'email'"
          >
            {{ _t18('register_email') }}
          </button>
        </div>

        <template v-if="registerType === 'account'">
          <div class="field">
            <img :src="iconAccount" class="field__icon" alt="" />
            <input
              v-model="form.username"
              type="text"
              class="field__input"
              :placeholder="_t18('register_account')"
              autocomplete="username"
              @input="onUsernameInput"
            />
          </div>
        </template>

        <template v-else>
          <div class="field">
            <img :src="iconAccount" class="field__icon" alt="" />
            <input
              v-model="form.email"
              type="email"
              class="field__input"
              :placeholder="_t18('login_emailCode')"
              autocomplete="email"
            />
          </div>
        </template>

        <div class="field field--phone">
          <button type="button" class="area-code" @click="showAreaCode = true">
            +{{ form.areaCode }}
          </button>
          <input
            v-model="form.mobile"
            type="tel"
            inputmode="numeric"
            class="field__input field__input--phone"
            :placeholder="mobilePlaceholder"
            :maxlength="mobileMaxLength"
            @input="onMobileInput"
          />
        </div>

        <div class="field">
          <img :src="iconLock" class="field__icon" alt="" />
          <input
            v-model="form.password"
            :type="showPwd ? 'text' : 'password'"
            class="field__input"
            :placeholder="_t18('login_pwd')"
            autocomplete="new-password"
            @input="onPasswordInput"
          />
          <img
            :src="showPwd ? iconEye : iconEyeOff"
            class="field__icon field__icon--right"
            alt=""
            @click="showPwd = !showPwd"
          />
        </div>

        <div class="field">
          <img :src="iconLock" class="field__icon" alt="" />
          <input
            v-model="form.password2"
            :type="showPwd2 ? 'text' : 'password'"
            class="field__input"
            :placeholder="_t18('register_pwd_require')"
            autocomplete="new-password"
            @input="onPassword2Input"
          />
          <img
            :src="showPwd2 ? iconEye : iconEyeOff"
            class="field__icon field__icon--right"
            alt=""
            @click="showPwd2 = !showPwd2"
          />
        </div>

        <div class="field">
          <img :src="iconInvite" class="field__icon" alt="" />
          <input
            v-model="form.invitCode"
            type="text"
            class="field__input"
            :placeholder="_t18('register_invitation')"
            @input="onInvitInput"
          />
        </div>

        <div v-if="registerType === 'account' && mainStore.getISCode" class="field field--captcha">
          <input
            v-model="form.code"
            type="text"
            class="field__input field__input--captcha"
            :placeholder="_t18('login_code')"
          />
          <img :src="codeUrl" class="captcha-img" @click="refreshCode" alt="" />
        </div>

        <div v-else-if="registerType === 'email'" class="field field--captcha">
          <input
            v-model="form.code"
            type="text"
            class="field__input field__input--captcha"
            :placeholder="_t18('login_code')"
          />
          <button
            type="button"
            class="send-code-btn"
            :disabled="emailCodeSending"
            @click="sendEmailCode"
          >
            <van-count-down
              v-if="emailCodeSending"
              :time="emailCodeCountdown"
              format="ss"
              @finish="onEmailCodeFinish"
            />
            <span v-else>{{ _t18('login_send') }}</span>
          </button>
        </div>

        <button class="btn btn--primary" :disabled="loading" @click="doRegister">
          <span>{{ _t18('register') }}</span>
        </button>

        <button class="btn btn--secondary" @click="$router.push('/sign-in')">
          <span>{{ _t18('register_haveAccount') }} {{ _t18('register_toLogin') }}</span>
        </button>
      </div>

      <div class="agree">
        <div class="agree__line">
          <span
            class="agree__radio"
            :class="{ 'agree__radio--on': agreed }"
            @click="agreed = !agreed"
          >
            <img v-if="!agreed" :src="iconRadio" alt="" />
          </span>
          <span>{{ _t18('register_agree') }}</span>
        </div>
        <div class="agree__line">
          <span class="agree__link" @click="$router.push('/termsOfuse')">《{{ _t18('register_howToUse') }}》</span>
          <span class="agree__and">{{ _t18('register_and') }}</span>
          <span class="agree__link" @click="$router.push('/privacyPolicy')">《{{ _t18('register_private') }}》</span>
        </div>
      </div>
    </div>

    <AreaCode :show="showAreaCode" @handelClick="showAreaCode = false" @handelSelect="onSelectAreaCode" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMainStore } from '@/store/index.js'
import { useToast } from '@/hook/useToast'
import { _t18 } from '@/utils/public'
import { signUp, emailCode } from '@/api/user'
import AreaCode from './components/areaCode.vue'
import {
  digitsOnlyMobile,
  isIndonesiaAreaCode,
  validateMobileByAreaCode
} from '@/utils/phoneValidate'
import { getCurrentLanguagePhoneCode } from '@/utils/languageCountry'
import bgImg from '@/assets/images/gxpex/login/bg.png'
import logoG from '@/assets/images/gxpex/login/gxpenlogo.png'
import iconAccount from '@/assets/images/gxpex/login/icon-account.svg'
import iconLock from '@/assets/images/gxpex/signup/icon-lock.svg'
import iconEye from '@/assets/images/gxpex/signup/icon-eye.svg'
import iconEyeOff from '@/assets/images/gxpex/signup/icon-eye-off.svg'
import iconInvite from '@/assets/images/gxpex/signup/icon-invite.svg'
import iconRadio from '@/assets/images/gxpex/signup/icon-radio.svg'
import langIcon from '@/assets/images/login/lang.png'

const router = useRouter()
const route = useRoute()
const mainStore = useMainStore()
const { _toast } = useToast()

const filterAlphanumeric = (val) =>
  String(val ?? '').replace(/[^a-zA-Z0-9一-龥]/g, '')

const loginMethods = computed(() => mainStore.getLoginMethodList || {})
const showAccountTab = computed(() => loginMethods.value.ordinaryIsOpen !== false)
const showEmailTab = computed(() => loginMethods.value.emailIsOpen !== false)
const showTabs = computed(() => showAccountTab.value && showEmailTab.value)

const registerType = ref('account')

const form = ref({
  username: '',
  email: '',
  mobile: '',
  areaCode: getCurrentLanguagePhoneCode(),
  password: '',
  password2: '',
  invitCode: filterAlphanumeric(route.query.invite_code),
  code: ''
})

const showPwd = ref(false)
const showPwd2 = ref(false)
const agreed = ref(false)
const loading = ref(false)
const showAreaCode = ref(false)
const emailCodeSending = ref(false)
const emailCodeCountdown = ref(60 * 1000)

const mobileMaxLength = computed(() =>
  isIndonesiaAreaCode(form.value.areaCode) ? 13 : 20
)

const mobilePlaceholder = computed(() =>
  isIndonesiaAreaCode(form.value.areaCode)
    ? `${_t18('login_mobileCode')} (10-13)`
    : _t18('login_mobileCode')
)

onMounted(() => {
  if (!showAccountTab.value && showEmailTab.value) {
    registerType.value = 'email'
  }
})

const onUsernameInput = (e) => {
  form.value.username = filterAlphanumeric(e.target.value)
}
const onPasswordInput = (e) => {
  form.value.password = filterAlphanumeric(e.target.value)
}
const onPassword2Input = (e) => {
  form.value.password2 = filterAlphanumeric(e.target.value)
}
const onInvitInput = (e) => {
  form.value.invitCode = filterAlphanumeric(e.target.value)
}
const onMobileInput = () => {
  form.value.mobile = digitsOnlyMobile(form.value.mobile)
}
const onSelectAreaCode = (code) => {
  form.value.areaCode = code
  onMobileInput()
}

const timestamp = ref(+new Date())
const codeUrl = computed(
  () => `${mainStore.verificationCodeUrl}?codeType=REGISTER&timestamp=${timestamp.value}`
)
const refreshCode = () => {
  timestamp.value = +new Date()
}

const sendEmailCode = async () => {
  const email = String(form.value.email ?? '').trim()
  if (!email) {
    _toast('login_please_emailCode')
    return
  }
  try {
    const res = await emailCode('REGISTER', email)
    if (res.code == '200' || res.code == 200) {
      emailCodeSending.value = true
      emailCodeCountdown.value = 60 * 1000
    } else {
      _toast(res.msg || 'error')
    }
  } catch (e) {
    console.log(e)
  }
}

const onEmailCodeFinish = () => {
  emailCodeSending.value = false
}

const buildRegisterParams = () => {
  const mobileCheck = validateMobileByAreaCode(form.value.areaCode, form.value.mobile)
  if (!mobileCheck.ok) {
    _toast(mobileCheck.key)
    return null
  }

  const params = {
    loginPassword: form.value.password,
    activeCode: form.value.invitCode,
    phone: String(form.value.areaCode ?? '') + mobileCheck.digits
  }

  if (registerType.value === 'account') {
    params.signType = 3
    params.loginName = form.value.username
    params.code = form.value.code
  } else {
    params.signType = 1
    params.email = String(form.value.email ?? '').trim()
    params.code = form.value.code
  }

  return params
}

const doRegister = async () => {
  if (loading.value) return
  if (!agreed.value) return _toast('register_agreeAgreement')

  if (registerType.value === 'account') {
    if (!form.value.username) return _toast('please_user')
    if (mainStore.getISCode && !form.value.code) return _toast('please_code')
  } else {
    if (!String(form.value.email ?? '').trim()) return _toast('please_email')
    if (!form.value.code) return _toast('please_code')
  }

  if (!form.value.password) return _toast('please_pwd')
  if (form.value.password !== form.value.password2) return _toast('register_pwd_diff')
  if (!form.value.invitCode) return _toast('please_shareCode')

  const params = buildRegisterParams()
  if (!params) return

  loading.value = true
  try {
    const res = await signUp(params)
    if (res.code == '200' || res.code == 200) {
      _toast('register_success')
      setTimeout(() => router.push('/sign-in'), 500)
    } else {
      _toast(res.msg || 'error')
      if (registerType.value === 'account') {
        refreshCode()
      }
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
$purple-1: #b388ff;
$purple-2: #a041ed;
$purple-3: #872ddc;
$font-raleway: 'Raleway', -apple-system, 'PingFang SC', sans-serif;
$font-pingfang: 'PingFang SC', -apple-system, 'Raleway', sans-serif;

.signup-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #0a0816;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.signup-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.signup-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 28px 24px;
  min-height: 100vh;
  box-sizing: border-box;
}

.lang-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 44px;
  height: 44px;
  padding: 0;
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
    width: 22px;
    height: 22px;
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
  font-size: 28px;
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

.register-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(20, 12, 38, 0.55);
  border: 1px solid rgba(160, 65, 237, 0.2);

  &__item {
    flex: 1;
    height: 36px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    font-family: $font-pingfang;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;

    &--active {
      color: #fff;
      background: linear-gradient(135deg, $purple-1 0%, $purple-2 100%);
      box-shadow: 0 4px 14px rgba(160, 65, 237, 0.35);
    }
  }
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

  &--captcha,
  &--phone {
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

    &::placeholder { color: rgba(202, 202, 202, 0.7); }
    &--captcha { flex: 1; margin-left: 12px; }
    &--phone { margin-left: 8px; }
  }
}

.area-code {
  flex-shrink: 0;
  height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: 999px;
  background: rgba(160, 65, 237, 0.18);
  font-family: $font-pingfang;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
}

.captcha-img {
  height: 38px;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.send-code-btn {
  flex-shrink: 0;
  min-width: 64px;
  height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, $purple-1 0%, $purple-2 100%);
  font-family: $font-pingfang;
  font-size: 12px;
  color: #fff;
  cursor: pointer;

  &:disabled {
    opacity: 0.75;
    cursor: not-allowed;
  }

  :deep(.van-count-down) {
    color: #fff;
    font-size: 12px;
    line-height: 34px;
  }
}

.btn {
  display: block;
  width: 100%;
  height: 50px;
  border: 0;
  border-radius: 999px;
  font-family: $font-raleway;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: #fff;
  cursor: pointer;
  user-select: none;
  margin-top: 8px;
  margin-bottom: 12px;

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
    font-size: 14px;
    &:active { background: rgba(160, 65, 237, 0.18); }
  }
}

.agree {
  margin-top: auto;
  padding-top: 18px;
  font-family: $font-pingfang;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.65);
  text-align: center;

  &__line {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  &__radio {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 50%;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    img {
      width: 16px;
      height: 16px;
      display: block;
    }
    &--on {
      background: linear-gradient(135deg, $purple-1 0%, $purple-2 100%);
      box-shadow: 0 0 8px rgba(160, 65, 237, 0.5);
      &::after {
        content: '';
        width: 4px;
        height: 8px;
        border-right: 2px solid #fff;
        border-bottom: 2px solid #fff;
        transform: rotate(45deg) translate(0, -1px);
      }
    }
  }

  &__link {
    color: $purple-1;
    cursor: pointer;
    &:active { opacity: 0.7; }
  }
  &__and {
    color: rgba(255, 255, 255, 0.65);
  }
}
</style>
