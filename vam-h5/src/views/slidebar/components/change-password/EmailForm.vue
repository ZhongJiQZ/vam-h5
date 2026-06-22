<!-- 邮箱方式修改登录密码 -->
<script setup>
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import { emailCode, updatePwdByEmail } from '@/api/user'
import { ref } from 'vue'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'
import { _t18 } from '@/utils/public'
import { useToast } from '@/hook/useToast'
import { useRouter } from 'vue-router'

const { _toast } = useToast()
const router = useRouter()
const userStore = useUserStore()
userStore.getUserInfo()
const { userInfo } = storeToRefs(userStore)
const newPwd = ref(false)
const NPwd = ref(false)
const form = ref({
  email: userInfo.value.user?.email,
  code: '',
  newPwd: '',
  NPwd: ''
})
const setKeyVal = (val) => {
  if (val == 'newPwd') {
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
  if (form.value.email == '') {
    _toast('login_please_emailCode')
    return
  }
  emailCode('UPD_PASSWORD', form.value.email).then((res) => {
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
  if (form.value.code == '') {
    _toast('verification_code')
    return
  }
  if (form.value.newPwd == '') {
    _toast('Fund_password_pleaseNew')
    return
  }
  if (form.value.newPwd != form.value.NPwd) {
    _toast('register_pwd_diff')
    return
  }
  updatePwdByEmail(form.value.email, form.value.newPwd, form.value.code)
    .then((res) => {
      if (res.code == '200') {
        _toast('Bank_update_success')
        setTimeout(() => {
          router.push('/homeSidebar')
        }, 500)
      } else {
        showToast(res.msg)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}
</script>
<template>
  <div class="content">
    <div class="tip">{{ _t18('login_emailCode') }}</div>
    <div class="input disabled">
      <span class="icon icon--lead" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      </span>
      <input type="text" disabled v-model="form.email" />
    </div>

    <div class="tip">{{ _t18('verification_code') }}</div>
    <div class="input">
      <span class="icon icon--lead" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </span>
      <input type="text" v-model="form.code" :placeholder="_t18('login_please')" />
      <div class="code-box">
        <div class="wait-code" v-if="flag">
          <van-count-down :time="time" format="ss" @finish="finish" />
        </div>
        <div class="send-code" v-else @click="send">{{ _t18('login_send') }}</div>
      </div>
    </div>

    <div class="tip">{{ _t18('forgot_newPwd') }}</div>
    <div class="input">
      <input
        :type="newPwd ? 'text' : 'password'"
        v-model="form.newPwd"
        :placeholder="_t18('login_please')"
      />
      <span class="icon" @click="setKeyVal('newPwd')" aria-hidden="true">
        <svg v-if="newPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </span>
    </div>

    <div class="tip">{{ _t18('forgot_require_newPwd') }}</div>
    <div class="input">
      <input
        :type="NPwd ? 'text' : 'password'"
        v-model="form.NPwd"
        @input="pwdDiff"
        :placeholder="_t18('login_please')"
      />
      <span class="icon" @click="setKeyVal('NPwd')" aria-hidden="true">
        <svg v-if="NPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
    padding: 0 12px 0 14px;
    width: 100%;
    height: 50px;
    background: rgb(34, 34, 34);
    border-radius: 25px;
    border: 1px solid rgba(160, 65, 237, 0.45);
    box-shadow: 0 0 0 1px rgba(160, 65, 237, 0.12), 0 0 14px rgba(160, 65, 237, 0.18);
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    box-sizing: border-box;

    input {
      flex: 1;
      min-width: 0;
      height: 100%;
      padding: 0;
      font-size: 14px;
      color: #fff;
      border: none;
      background: transparent;
      outline: none;

      &::placeholder {
        color: rgba(255, 255, 255, 0.45);
      }

      &:disabled {
        color: rgba(255, 255, 255, 0.65);
      }
    }
  }

  .input.disabled {
    background: rgba(34, 34, 34, 0.6);
    border-color: rgba(160, 65, 237, 0.25);
    box-shadow: 0 0 0 1px rgba(160, 65, 237, 0.06), 0 0 10px rgba(160, 65, 237, 0.1);
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
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .icon--lead {
    cursor: default;
  }

  .code-box {
    flex-shrink: 0;
    min-width: 80px;
    height: 32px;
    padding: 0 14px;
    background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
    border-radius: 999px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    box-shadow: 0 4px 10px rgba(127, 43, 218, 0.32);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;

    .wait-code {
      cursor: default;
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

:deep(.van-count-down) {
  font-size: 13px;
  color: #fff;
  padding: 0;
  line-height: 1;
}
</style>
