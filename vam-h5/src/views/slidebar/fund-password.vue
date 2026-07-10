<script setup>
import Success from './components/success.vue'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import SetForm from './components/fund-password/SetForm.vue'
import ChangeForm from './components/fund-password/ChangeForm.vue'
import EmailForm from './components/fund-password/EmailForm.vue'
import lockIcon from '@/assets/images/lock.png'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { _t18 } from '@/utils/public'
import { useToast } from '@/hook/useToast'

const { _toast } = useToast()
const userStore = useUserStore()
userStore.getUserInfo()
const { userInfo } = storeToRefs(userStore)

const notPwd = ref(userInfo.value.detail?.userTardPwd)
const success = ref(true)
// true=旧密码修改, false=邮箱验证码修改
const updateFundPwdMethod = ref(true)

const changePwd = () => {
  if (!userInfo.value.user?.email) {
    return _toast('please_bind_email')
  }
  notPwd.value = true
  success.value = false
  updateFundPwdMethod.value = true
  userStore.getUserInfo()
}

const forgotPwd = () => {
  if (!userInfo.value.user?.email) {
    return _toast('please_bind_email')
  }
  notPwd.value = true
  success.value = false
  updateFundPwdMethod.value = false
}

const toggleMethod = () => {
  if (!userInfo.value.user?.email) {
    return _toast('please_bind_email')
  }
  updateFundPwdMethod.value = !updateFundPwdMethod.value
}

const setPwd = (v) => {
  success.value = v
  notPwd.value = v
  updateFundPwdMethod.value = true
  userStore.getUserInfo()
}
</script>
<template>
  <div class="page-fund-pwd">
    <DarkHeaderBar
      :title="notPwd ? _t18('Change_security_password') : _t18('sidebar_tardPwd', ['bitmake'])"
      right="service"
      :border_bottom="true"
    />
    <div class="card">
      <div class="section-head">
        <span class="section-title">{{
          notPwd ? _t18('Change_security_password') : _t18('sidebar_tardPwd', ['bitmake'])
        }}</span>
        <img :src="lockIcon" alt="" class="lock-icon" />
      </div>
      <SetForm v-if="!notPwd && success" @setPwd="setPwd"></SetForm>
      <ChangeForm v-if="notPwd && !success && updateFundPwdMethod" @setPwd="setPwd"></ChangeForm>
      <EmailForm v-if="notPwd && !success && !updateFundPwdMethod" @setPwd="setPwd"></EmailForm>
      <div class="footer-link" v-if="notPwd && !success">
        <span v-if="!updateFundPwdMethod" class="link" @click="toggleMethod">{{
          _t18('password_update_pwd')
        }}</span>
        <span v-else class="link" @click="toggleMethod">{{ _t18('password_update_email') }}</span>
      </div>
      <Success
        v-if="notPwd && success"
        :text="_t18('Fund_password_has_set')"
        :imgUrl="'defi/fund.png'"
        class="success"
      >
        <template #btn>
          <div class="btnBox" @click="changePwd">
            <ButtonBar :btnValue="_t18('Change_security_password')" />
          </div>
          <div class="forgot" @click="forgotPwd">{{ _t18('forgot_security_code') }}?</div>
        </template>
      </Success>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.page-fund-pwd {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.card {
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: #fff;

  padding: 20px 15px 28px;
  box-sizing: border-box;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.lock-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
}

.footer-link {
  margin-top: 20px;
  text-align: center;
}

.footer-link .link {
  font-size: 14px;
  color: #17ac74;
}

.card :deep(.btnBox > div) {
  border-radius: 999px !important;
  background: #05101a !important;
  border-color: #05101a !important;
  color: #fff !important;
}

.success {
  padding: 0;
  width: 100%;
  :deep(img) {
    margin: 32px 0 0 0;
  }
  :deep(.text) {
    font-size: 14px;
    margin: 24px 0 40px 0;
    color: var(--ex-font-color18);
  }
  .btnBox {
    width: 100%;
    font-size: 14px;
  }
  .forgot {
    margin-top: 24px;
    text-align: center;
    font-size: 14px;
    color: #17ac74;
  }
}
</style>
