<script setup>
import { ref } from 'vue'
import { _t18 } from '@/utils/public'
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import { addLoginPwd } from '@/api/user'
import { showToast } from 'vant'
import { useToast } from '@/hook/useToast'

const { _toast, _showName } = useToast()

const isPwd = ref(true)
const showPwdDiff = ref(false)
const formData = ref({
  newPwd: '',
  NPwd: ''
})

const pwdDiff = () => {
  showPwdDiff.value = !(formData.value.newPwd == formData.value.NPwd)
}

const submit = () => {
  if (!formData.value.newPwd) {
    return showToast(_showName(`login_please`) + _showName(`login_pwd`))
  }
  if (formData.value.newPwd !== formData.value.NPwd) {
    showPwdDiff.value = true
    return _toast('register_pwd_diff')
  }
  addLoginPwd(formData.value.NPwd).then((res) => {
    if (res.code == '200') {
      _toast('Fund_password_set_success')
      formData.value.newPwd = ''
      formData.value.NPwd = ''
    } else {
      showToast(res.msg)
    }
  })
}
</script>

<template>
  <div class="content">
    <div class="tip">{{ _t18('login_pwd') }}</div>
    <div class="input">
      <input
        :type="isPwd ? 'text' : 'password'"
        :placeholder="_t18('login_please')"
        v-model="formData.newPwd"
      />
      <span class="icon" @click="isPwd = !isPwd" aria-hidden="true">
        <svg v-if="isPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </span>
    </div>

    <div class="tip">{{ _t18('Confirm_Password') }}</div>
    <div class="input">
      <input
        :type="isPwd ? 'text' : 'password'"
        :placeholder="_t18('login_please')"
        v-model="formData.NPwd"
        @input="pwdDiff"
      />
      <span class="icon" @click="isPwd = !isPwd" aria-hidden="true">
        <svg v-if="isPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </span>
    </div>

    <p class="pwdDiff" v-if="showPwdDiff">*{{ _t18('register_pwd_diff') }}</p>

    <div class="btnBox" @click="submit">
      <ButtonBar :btnValue="_t18('btnConfirm', ['bitmake'])" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content {
  padding: 0;

  .tip {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
    margin: 0 0 8px;
    padding-left: 4px;
    text-align: left;
  }

  .input {
    padding: 0 16px;
    width: 100%;
    height: 50px;
    background: rgb(34, 34, 34);
    border-radius: 25px;
    border: 1px solid rgba(160, 65, 237, 0.45);
    box-shadow: 0 0 0 1px rgba(160, 65, 237, 0.12), 0 0 14px rgba(160, 65, 237, 0.18);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    box-sizing: border-box;

    input {
      flex: 1;
      min-width: 0;
      height: 100%;
      padding: 0 12px 0 0;
      font-size: 14px;
      color: #fff;
      border: none;
      background: transparent;
      outline: none;

      &::placeholder {
        color: rgba(255, 255, 255, 0.45);
      }
    }
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: rgb(196, 124, 255);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .btnBox {
    margin-top: 36px;
  }

  .pwdDiff {
    margin: -8px 0 16px;
    padding-left: 4px;
    font-size: 12px;
    color: #ff435d;
  }
}
</style>
