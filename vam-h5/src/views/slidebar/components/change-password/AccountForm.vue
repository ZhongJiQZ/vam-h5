<!-- 普通方式修改密码 -->
<script setup>
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import { updateLoginPwd, emailCode } from '@/api/user'
import { showToast } from 'vant'
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { _t18 } from '@/utils/public'
import { useToast } from '@/hook/useToast'
const { _toast } = useToast()
const userStore = useUserStore()
userStore.getUserInfo()
const { userInfo } = storeToRefs(userStore)
const boundEmail = computed(() => userInfo.value.user?.email || '')
const emailDisplayText = computed(() => boundEmail.value || _t18('email_not_bound'))
const hasBoundEmail = computed(() => !!boundEmail.value)
const newPwd = ref(true)
const oldPwd = ref(true)
const NPwd = ref(true)
const form = ref({
  code: '',
  newPwd: '',
  oldPwd: '',
  NPwd: ''
})
const setKeyVal = (val) => {
  if (val == 'oldPwd') {
    oldPwd.value = !oldPwd.value
  } else if (val == 'newPwd') {
    newPwd.value = !newPwd.value
  } else {
    NPwd.value = !NPwd.value
  }
}
const showPwdDiff = ref(false)
const pwdDiff = () => {
  showPwdDiff.value = !(form.value.newPwd == form.value.NPwd)
}

const time = ref(0)
const flag = ref(false)
const send = () => {
  if (!hasBoundEmail.value) {
    _toast('please_bind_email')
    return
  }
  emailCode('UPD_PASSWORD', boundEmail.value).then((res) => {
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

const submit = () => {
  if (!hasBoundEmail.value) {
    _toast('please_bind_email')
    return
  }
  if (form.value.code == '') {
    _toast('verification_code')
    return
  }
  if (form.value.oldPwd == '') {
    _toast('Fund_password_pleaseOld')
    return
  }
  if (form.value.newPwd == '') {
    _toast('Fund_password_pleaseNew')
    return
  }
  if (form.value.newPwd !== form.value.NPwd) {
    _toast('register_pwd_diff')
    return
  }

  updateLoginPwd(
    form.value.oldPwd,
    form.value.newPwd,
    userStore?.userInfo?.user?.userId,
    boundEmail.value,
    form.value.code
  ).then((res) => {
    if (res.code == '200') {
      _toast('Bank_update_success')
      form.value.newPwd = form.value.NPwd = form.value.oldPwd = form.value.code = ''
    } else {
      showToast(res.msg)
    }
  })
}
</script>
<template>
  <div class="content">
    <div class="tip">{{ _t18('login_emailCode') }}</div>
    <div class="input disabled" :class="{ 'input--unbound': !hasBoundEmail }">
      <svg-load name="youxiang-x" class="icon"></svg-load>
      <input type="text" disabled readonly :value="emailDisplayText" />
    </div>
    <div class="tip">{{ _t18('verification_code') }}</div>
    <div class="input">
      <svg-load name="yanzhengma" class="icon"></svg-load>
      <input type="text" v-model="form.code" :placeholder="_t18('login_please')" />
      <div class="code-box">
        <div class="wait-code" v-if="flag">
          <van-count-down :time="time" format="ss" @finish="finish" />
        </div>
        <div class="send-code" v-else @click="send">{{ _t18('login_send') }}</div>
      </div>
    </div>
    <div class="tip">{{ _t18('Old_Password') }}</div>
    <div class="input">
      <input :type="oldPwd ? 'text' : 'password'" v-model="form.oldPwd" :placeholder="_t18('login_please')" />
      <svg-load
        :name="oldPwd ? 'openeyes' : 'closeeyse'"
        class="icon"
        @click="setKeyVal('oldPwd')"
      ></svg-load>
    </div>
    <div class="tip">{{ _t18('New_Password') }}</div>
    <div class="input">
      <input :type="newPwd ? 'text' : 'password'" v-model="form.newPwd" :placeholder="_t18('login_please')" />
      <svg-load
        :name="newPwd ? 'openeyes' : 'closeeyse'"
        class="icon"
        @click="setKeyVal('newPwd')"
      ></svg-load>
    </div>
    <div class="tip">{{ _t18('Confirm_Password') }}</div>
    <div class="input">
      <input
        :type="NPwd ? 'text' : 'password'"
        v-model="form.NPwd"
        :placeholder="_t18('login_please')"
        @input="pwdDiff"
      />
      <svg-load
        :name="NPwd ? 'openeyes' : 'closeeyse'"
        class="icon"
        @click="setKeyVal('NPwd')"
      ></svg-load>
    </div>
    <p class="pwdDiff" v-if="showPwdDiff">*{{_t18('register_pwd_diff')}}</p>
    <div class="btnBox" @click="submit">
      <ButtonBar :btnValue="_t18('btnConfirm',['bitmake'])" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.content {
  padding: 0;
  .tip {
    font-size: 14px;
    color: var(--ex-font-color16);
    margin-bottom: 10px;
    text-align: left;
  }
  .input {
    padding: 0 15px;
    width: 100%;
    height: 50px;
    background: var(--ex-default-background-color);
    border-radius: 3px;
    border: 1px solid var(--ex-border-color1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    input {
      flex: 1;
      min-width: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 12px 0 0;
      font-size: 14px;
      color: var(--ex-default-font-color);
      border: none;
      background: transparent;
    }
    .code-box {
      min-width: 44px;
      height: 30px;
      background: var(--ex-div-bgColor1);
      border-radius: 2px 2px 2px 2px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--ex-font-color);
    }
    .send-code {
      font-size: 14px;
      border-radius: 5px;
    }
  }
  .disabled {
    background: #efefef;
  }
  .input--unbound input {
    color: var(--ex-passive-font-color, #969799);
  }
  .icon {
    font-size: 16px;
  }

  .btnBox {
    margin-top: 50px;
  }
  .pwdDiff {
    color: var(--ex-font-color14);
  }
}
:deep(.van-count-down) {
  font-size: 14px;
  color: var(--ex-font-color);
  padding: 0;
}
</style>
