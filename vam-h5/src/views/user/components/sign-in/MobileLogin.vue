<template>
  <div>
    <div class="formData">
      <p>{{ _t18('login_mobileCode') }}</p>
      <div>
        <div class="right" @click="showAreaCode">
          <i>+</i>
          <p>{{ formData3.areaCode }}</p>
          <svg-load name="jiantou10x5-x" class="jiantou" @click="showAreaCode"></svg-load>
        </div>
        <input
          style="margin-left: 5px"
          type="tel"
          inputmode="numeric"
          :maxlength="mobileMaxLength"
          :placeholder="mobilePlaceholder"
          v-model="formData3.mobile"
          @input="onMobileInput"
        />
      </div>
    </div>
    <div class="formData">
      <p>{{ _t18('login_pwd') }}</p>
      <div>
        <input
          :type="showk ? 'text' : 'password'"
          :placeholder="_t18('login_please')"
          v-model="formData3.password"
        />
        <svg-load :name="showk ? 'yanjin-k' : 'yanjin-g'" @click="showk = !showk"></svg-load>
      </div>
    </div>
    <p class="forgotPwd" @click="$router.push('/forgot-password')">
      {{ _t18('forget_pwd', ['bitmake']) }}
    </p>
    <Footer :type="0" :formDataToLogin="formData3"></Footer>
    <AreaCode :show="show" @handelClick="close" @handelSelect="select"></AreaCode>
  </div>
</template>

<script setup>
import Footer from './../signFooter.vue'
import AreaCode from './../areaCode.vue'
import { _t18 } from '@/utils/public'
import {
  digitsOnlyMobile,
  isIndonesiaAreaCode,
  INDONESIA_AREA_CODE
} from '@/utils/phoneValidate'
import { computed } from 'vue'

const formData3 = ref({
  type: 3,
  mobile: '',
  password: '',
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

const showk = ref(false)
const show = ref(false)

const showAreaCode = () => {
  show.value = true
}
const close = () => {
  show.value = false
}
const select = (v) => {
  formData3.value.areaCode = v
  onMobileInput()
}

import './../style.scss'
</script>

<style lang="scss" scoped></style>
