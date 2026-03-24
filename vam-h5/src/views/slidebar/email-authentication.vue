<!-- 绑定邮箱 -->
<template>
  <div class="page-email-auth">
    <DarkHeaderBar
      :title="_t18('sidebar_certified')"
      right="service"
      :border_bottom="true"
    />

    <div class="card">
      <div v-if="!bind" class="bind-not">
        <div class="field-block">
          <div class="field-label">{{ _t18('login_emailCode') }}：</div>
          <div class="field-input">
            <input
              v-model="formData.email"
              type="email"
              inputmode="email"
              autocomplete="email"
              class="field-control"
              :placeholder="_t18('login_emailCode')"
            />
          </div>
        </div>

        <div class="field-block">
          <div class="field-label">{{ _t18('verification_code') }}：</div>
          <div class="field-input field-input--code">
            <input
              v-model="formData.code"
              type="text"
              inputmode="numeric"
              class="field-control"
              :placeholder="_t18('recharge_input')"
            />
            <div class="code-side">
              <div v-if="flag" class="code-wait">
                <van-count-down :time="time" format="ss" @finish="finish" />
              </div>
              <button v-else type="button" class="send-btn" @click="handleSend">
                {{ _t18('login_send') }}
              </button>
            </div>
          </div>
        </div>

        <div class="btnBox" @click="handleEmailBind">
          <ButtonBar :btnValue="_t18('btnConfirm', ['bitmake'])" />
        </div>
      </div>

      <div v-else class="bind-yes">
        <div class="top">
          <img src="@/assets/defi/email.png" alt="" />
          <div class="success-title">{{ _t18('email_bind_success') }}</div>
          <div class="success-email">{{ _t18('email_your') }}：{{ email }}</div>
        </div>

        <div class="change-email" @click="bind = false">{{ _t18('email_update') }}</div>
        <div class="back-home" @click="router.push('/')">{{ _t18('backhome') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import { emailCode, emailBind } from '@/api/user'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'
import { _t18 } from '@/utils/public'
import { useToast } from '@/hook/useToast'

const { _toast } = useToast()
const router = useRouter()
const userStore = useUserStore()
userStore.getUserInfo()

const { userInfo } = storeToRefs(userStore)
const email = ref(userInfo.value.user?.email)
const bind = ref(!!email.value)

const formData = ref({
  email: '',
  code: ''
})

const time = ref(0)
const flag = ref(false)

const handleSend = () => {
  if (formData.value.email == '') {
    _toast('login_please_emailCode')
    return
  }
  flag.value = true
  time.value = 60 * 1000
  emailCode('BIND', formData.value.email).then((res) => {
    if (res.code != '200') {
      flag.value = false
      showToast(res.msg)
    }
  })
}

const finish = () => {
  flag.value = false
}

const handleEmailBind = () => {
  if (formData.value.email == '') {
    _toast('login_please_emailCode')
    return
  }
  if (formData.value.code == '') {
    _toast('verification_code')
    return
  }
  emailBind(formData.value.email, formData.value.code).then((res) => {
    if (res.code == '200') {
      _toast('email_bind_success')
      email.value = formData.value.email
      bind.value = true
    } else {
      showToast(res.msg)
    }
  })
}
</script>

<style lang="scss" scoped>
.page-email-auth {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.card {
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 20px 15px 28px;
  box-sizing: border-box;
}

.field-block {
  margin-bottom: 20px;
}

.field-label {
  font-size: 14px;
  color: #646566;
  margin-bottom: 8px;
  line-height: 1.4;
}

.field-input {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
}

.field-input--code {
  padding-right: 8px;
}

.field-control {
  flex: 1;
  min-width: 0;
  height: 44px;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #323233;
  outline: none;

  &::placeholder {
    color: #c8c9cc;
  }
}

.code-side {
  flex-shrink: 0;
  margin-left: 8px;
}

.send-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #17ac74;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.code-wait {
  min-width: 40px;
  text-align: center;
  font-size: 14px;
  color: #17ac74;
  padding: 0 4px;
}

.page-email-auth :deep(.code-wait .van-count-down) {
  font-size: 14px;
  color: #17ac74;
}

.btnBox {
  margin-top: 36px;
}

.card :deep(.btnBox > div) {
  border-radius: 999px !important;
  background: #05101a !important;
  border-color: #05101a !important;
  color: #fff !important;
}

.bind-yes {
  .top {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 24px;

    img {
      width: 132px;
      height: 100px;
    }

    .success-title {
      color: #323233;
      text-align: center;
      font-size: 16px;
      margin: 24px 0 16px;
    }

    .success-email {
      text-align: center;
      font-size: 14px;
      color: #646566;
    }
  }

  .change-email {
    margin: 48px 0 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    color: #fff;
    background: #17ac74;
    font-size: 14px;
    border-radius: 999px;
    -webkit-tap-highlight-color: transparent;
  }

  .back-home {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    background: #f7f8fa;
    border: 1px solid #ebedf0;
    color: #646566;
    font-size: 14px;
    border-radius: 8px;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
