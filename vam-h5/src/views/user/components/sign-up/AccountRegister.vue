<template>
  <div>
    <div class="formData">
      <!-- 账号 -->
      <p>{{ _t18('account', ['bitmake']) }}</p>
      <div>
        <input
          type="text"
          :placeholder="_t18('login_please')"
          v-model="formData1.username"
          @input="onUsernameInput"
        />
      </div>
    </div>
    <div v-if="['vam'].includes(_getConfig('_APP_ENV'))" class="formData">
      <!-- 手机号 -->
      <p>{{ _t18('login_mobileCode') }}</p>
      <div>
        <div class="right" @click="shouAreaCode">
          <i>+</i>
          <p>{{ formData1.areaCode }}</p>
          <svg-load name="jiantou10x5-x" class="jiantou"></svg-load>
        </div>
        <input type="text" :placeholder="_t18('login_mobileCode')" v-model="formData1.mobile" />
      </div> 
    </div>
    <div class="formData">
      <!-- 密码 -->
      <p>{{ _t18('login_pwd') }}</p>
      <div>
        <input
          :type="showk ? 'text' : 'password'"
          :placeholder="_t18('login_please')"
          v-model="formData1.password"
          @input="onPasswordInput"
        />
        <svg-load :name="showk ? 'yanjin-k' : 'yanjin-g'" @click="showk = !showk"></svg-load>
      </div>
    </div>
    <div class="formData">
      <!-- 确认密码 -->
      <p>{{ _t18('register_pwd_require') }}</p>
      <div>
        <input
          :type="requireShowk ? 'text' : 'password'"
          :placeholder="_t18('login_please')"
          v-model="formData1.password2"
          @input="onPassword2Input"
        /><svg-load
          :name="requireShowk ? 'yanjin-k' : 'yanjin-g'"
          @click="requireShowk = !requireShowk"
        ></svg-load>
      </div>
    </div>
    <p class="requirePass" v-if="requirePass">*{{ _t18('register_pwd_diff') }}</p>
    <div class="formData">
      <!-- 邀请码 选填/必填 -->
      <p>
        {{ _t18('register_invitation') }}
        <i>({{ _t18('required') }})</i>
      </p>
      <div>
        <input
          type="text"
          :placeholder="_t18('login_please')"
          v-model="formData1.invitCode"
          @input="onInvitCodeInput"
        />
      </div>
    </div>
    <div class="formData" v-if="mainStore.getISCode">
      <!-- 验证码 -->
      <p>{{ _t18('login_code') }}</p>
      <div>
        <input type="text" :placeholder="_t18('login_please')" v-model="formData1.code" /><span
          @click="refreshCode"
        >
          <img :src="codeUrl" />
        </span>
      </div>
    </div>

    <Footer :type="1" :formDataToRegister="formData1" @refersh="refreshCode"></Footer>
    <AreaCode :show="show" @handelClick="close" @handelSelect="select"></AreaCode>
  </div>
</template>

<script setup>
import Footer from './../signFooter.vue'
import AreaCode from './../areaCode.vue'
import { _t18 } from '@/utils/public'
import { useMainStore } from '@/store/index.js'
import { useRoute } from 'vue-router'

const route = useRoute()
const mainStore = useMainStore()
const show = ref(false)
const close = () => {
  show.value = false
}
const select = (val) => {
  formData1.value.areaCode = val
}
/** 仅允许字母、数字、中文，过滤空格与特殊字符 */
const filterAlphanumeric = (val) => String(val ?? '').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')

const onUsernameInput = (e) => {
  formData1.value.username = filterAlphanumeric(e.target.value)
}

const onInvitCodeInput = (e) => {
  formData1.value.invitCode = filterAlphanumeric(e.target.value)
}

const onPasswordInput = (e) => {
  formData1.value.password = filterAlphanumeric(e.target.value)
  inputPass()
}

const onPassword2Input = (e) => {
  formData1.value.password2 = filterAlphanumeric(e.target.value)
  inputPass()
}

// 选择区号面板
const shouAreaCode = () => {
  show.value = true
}

/**
 * 表单数据
 */
const formData1 = ref({
  type: 1, //自定义注册类型：1普通2邮箱3手机
  username: '', //用户名/邮箱/手机号
  password: '', //密码
  password2: '', //二次密码
  invitCode: filterAlphanumeric(route.query.invite_code), //邀请码
  code: '', //验证码
  mobile: '', //手机号
  areaCode: '93' //区号
})
/**
 * 图形验证码
 */
// 时间戳
const timestamp = ref(+new Date())
// 图形验证码地址
const codeUrl = computed(
  () => `${mainStore.verificationCodeUrl}?codeType=REGISTER&timestamp=${timestamp.value}`
)
// 刷新验证码
const refreshCode = () => {
  timestamp.value = +new Date()
}
const requirePass = ref(false)
const inputPass = () => {
  requirePass.value = formData1.value.password2 !== formData1.value.password ? true : false
}
// 眼睛
const showk = ref(false)
const requireShowk = ref(false)
import './../style.scss'
</script>

<style lang="scss" scoped></style>
