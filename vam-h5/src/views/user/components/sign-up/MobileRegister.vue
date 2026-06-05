<template>
  <div>
    <div class="formData">
      <!-- 手机号 -->
      <p>
        {{ _t18('login_mobileCode') }}
        <i>({{ _t18('required') }})</i>
      </p>
      <div>
        <div class="right" @click="shouAreaCode">
          <i>+</i>
          <p>{{ formData3.areaCode }}</p>
          <svg-load name="jiantou10x5-x" class="jiantou"></svg-load>
        </div>
        <input style="margin-left: 5px" type="tel" inputmode="numeric" :maxlength="mobileMaxLength"
          :placeholder="mobilePlaceholder" v-model="formData3.mobile" @input="onMobileInput" />
      </div>
    </div>
    <div class="formData">
      <!-- 密码 -->
      <p>{{ _t18('login_pwd') }}</p>
      <div>
        <input :type="showk ? 'text' : 'password'" :placeholder="_t18('login_please')" v-model="formData3.password" />
        <svg-load :name="showk ? 'yanjin-k' : 'yanjin-g'" @click="showk = !showk"></svg-load>
      </div>
    </div>
    <div class="formData">
      <!-- 确认密码 -->
      <p>{{ _t18('register_pwd_require') }}</p>
      <div>
        <input :type="requireShowk ? 'text' : 'password'" :placeholder="_t18('login_please')"
          v-model="formData3.password2" @input="inputPass" />
        <svg-load :name="requireShowk ? 'yanjin-k' : 'yanjin-g'" @click="requireShowk = !requireShowk"></svg-load>
      </div>
    </div>
    <p class="requirePass" v-if="requirePass">*{{ _t18('register_pwd_diff') }}</p>
    <div class="formData">
      <!-- 邀请码 -->
      <p>
        {{ _t18('register_invitation') }}
        <i>({{ _t18('required') }})</i>
      </p>
      <div>
        <input type="text" :placeholder="_t18('login_please')" v-model="formData3.invitCode" />
      </div>
    </div>

    <Footer :type="1" :formDataToRegister="formData3"></Footer>
    <AreaCode :show="show" @handelClick="close" @handelSelect="select"></AreaCode>
  </div>
</template>

<script setup>
import Footer from './../signFooter.vue'
import { _t18 } from '@/utils/public'
import AreaCode from './../areaCode.vue'
import {
  digitsOnlyMobile,
  isIndonesiaAreaCode,
  INDONESIA_AREA_CODE
} from '@/utils/phoneValidate'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const formData3 = ref({
  type: 3,
  mobile: '',
  password: '',
  password2: '',
  invitCode: route.query.invite_code,
  areaCode: INDONESIA_AREA_CODE
})
if (['bitbyex'].includes(__config._APP_ENV)) {
  formData3.value.areaCode = '1'
}

const mobileMaxLength = computed(() =>
  isIndonesiaAreaCode(formData3.value.areaCode) ? 13 : 20
)

const mobilePlaceholder = computed(() =>
  isIndonesiaAreaCode(formData3.value.areaCode)
    ? _t18('login_mobileCode') + ' (10-13)'
    : _t18('login_mobileCode')
)

const onMobileInput = () => {
  formData3.value.mobile = digitsOnlyMobile(formData3.value.mobile)
}

const requirePass = ref(false)
const inputPass = () => {
  requirePass.value = formData3.value.password2 !== formData3.value.password
}

const showk = ref(false)
const requireShowk = ref(false)
const show = ref(false)

const shouAreaCode = () => {
  show.value = true
}
const close = () => {
  show.value = false
}
const select = (val) => {
  formData3.value.areaCode = val
  onMobileInput()
}

import './../style.scss'
</script>

<style lang="scss" scoped></style>
