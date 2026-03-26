<!-- 忘记密码 -->
<template>
  <div class="forgot-page">
    <header class="forgot-header">
      <img :src="logoPng" class="logo" alt="" />
      <img
        :src="langPng"
        class="lang-icon"
        alt=""
        @click="$router.push('/language-selection')"
      />
    </header>

    <div class="forgot-card">
      <button type="button" class="card-close" @click="$router.push('/')" aria-label="close">
        <img :src="closePng" alt="" />
      </button>

      <h1 class="card-title">{{ _t18('forget_pwd', ['bitmake']) }}</h1>

      <div class="forgot-body">
        <div class="formData">
          <p>{{ _t18('login_emailCode') }}</p>
          <div>
            <input type="text" :placeholder="_t18('login_emailCode')" v-model="formData.email" />
          </div>
        </div>
        <div class="formData">
          <p>{{ _t18('login_code') }}</p>
          <div>
            <input type="text" :placeholder="_t18('login_please')" v-model="formData.code" />
            <p v-if="!flag" @click="send()">{{ _t18('login_send') }}</p>
            <p v-else><van-count-down :time="time" format="ss" @finish="finish" /></p>
          </div>
        </div>
        <div class="formData">
          <p>{{ _t18('forgot_newPwd') }}</p>
          <div>
            <input
              :type="showk ? 'text' : 'password'"
              :placeholder="_t18('login_please')"
              v-model="formData.password"
            />
            <svg-load :name="showk ? 'yanjin-k' : 'yanjin-g'" @click="showk = !showk"></svg-load>
          </div>
        </div>
        <div class="formData">
          <p>{{ _t18('forgot_require_newPwd') }}</p>
          <div>
            <input
              :type="requireShowk ? 'text' : 'password'"
              :placeholder="_t18('login_please')"
              v-model="formData.password2"
              @input="inputPass"
            /><svg-load
              :name="requireShowk ? 'yanjin-k' : 'yanjin-g'"
              @click="requireShowk = !requireShowk"
            ></svg-load>
          </div>
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
import logoPng from '@/assets/images/login/logo.png'
import langPng from '@/assets/images/login/lang.png'
import closePng from '@/assets/images/login/close.png'

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
$veloxam-dark: #0c1017;
$veloxam-green: #17ac74;

.forgot-page {
  min-height: 100vh;
  background: $veloxam-dark;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.forgot-header {
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

.forgot-card {
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

.forgot-body {
  :deep(.formData > p) {
    margin: 18px 0 8px;
    color: #6b7280;
    font-size: 14px;
  }

  :deep(.formData:first-child > p) {
    margin-top: 0;
  }

  :deep(.formData > div) {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px 12px;
    background: #fafafa;
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 1.5;
  }

  :deep(.formData input) {
    flex: 1;
    border-radius: 0;
    background: transparent !important;
    padding: 3px 0;
  }

  :deep(.formData input::placeholder) {
    color: #9ca3af;
  }

  :deep(.formData > div > p) {
    background: $veloxam-green !important;
    border-radius: 8px !important;
    padding: 6px 12px !important;
    color: #fff !important;
    font-size: 13px;
    white-space: nowrap;
    margin: 0;
  }

  :deep(.van-count-down) {
    font-size: 14px;
    color: $veloxam-green;
    padding: 0;
  }

  .requirePass {
    font-size: 12px;
    margin-top: 10px;
    color: #ef4444;
  }

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

  :deep(.info) {
    margin-top: 20px;
    text-align: center;
    font-size: 13px;
    line-height: 1.55;
    color: #6b7280;

    span {
      color: $veloxam-green !important;
      text-decoration: underline;
    }
  }
}
</style>
