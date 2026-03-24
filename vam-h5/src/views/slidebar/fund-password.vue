<script setup>
import Success from './components/success.vue'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import SetForm from './components/fund-password/SetForm.vue'
import ChangeForm from './components/fund-password/ChangeForm.vue'
import lockIcon from '@/assets/images/lock.png'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'
import { _t18 } from '@/utils/public'
import { useToast } from '@/hook/useToast'
const { _toast } = useToast()
const userStore = useUserStore()
userStore.getUserInfo()
// 用户信息
const { userInfo } = storeToRefs(userStore)
// 用户是否设置过资金密码(userInfo.detail?.userTardPwd)

// const notPwd = ref(true)
const notPwd = ref(userInfo.value.detail?.userTardPwd)
const success = ref(true)
const changePwd = () => {
  notPwd.value = true
  success.value = false
  userStore.getUserInfo()
}
const setPwd = (v) => {
  success.value = v
  notPwd.value = v
  userStore.getUserInfo()
}
const toCustorm = () => {
  // showToast('请联系客服')
  _toast('custorm_service')
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
      <ChangeForm v-if="notPwd && !success" @setPwd="setPwd"></ChangeForm>
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
          <div class="forgot" @click="toCustorm">{{ _t18('forgot_security_code') }}?</div>
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
  border-radius: 16px 16px 0 0;
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
