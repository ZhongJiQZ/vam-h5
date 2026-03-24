<script setup>
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import SetForm from './components/change-password/SetForm.vue'
import EmailForm from './components/change-password/EmailForm.vue'
import AccountForm from './components/change-password/AccountForm.vue'
import lockIcon from '@/assets/images/lock.png'
import {useUserStore} from '@/store/user'
import {storeToRefs} from 'pinia'
import {_t18} from '@/utils/public'
import {useToast} from '@/hook/useToast'

const {_toast} = useToast()
const userStore = useUserStore()
const {userInfo} = storeToRefs(userStore)

// 进入路由已请求  ---> 用户数据
// userStore.getUserInfo()
//修改登录密码的方式(true普通，false邮箱)
const updateLoginPwdMethod = ref(true)
//是否已有登录密码
const loginPassword = ref(userInfo.value.user?.loginPassword || '')
const changeMethod = () => {

  // 是否绑定邮箱
  if (!userInfo.value.user?.email) {
    return _toast('please_bind_email')
  }

  updateLoginPwdMethod.value = !updateLoginPwdMethod.value

}
</script>

<template>
  <div class="page-change-pwd">
    <DarkHeaderBar
      :title="_t18('password_set')"
      right="service"
      :border_bottom="true"
    />
    <div class="card">
      <div class="section-head">
        <span class="section-title">{{ _t18('password_set') }}</span>
        <img :src="lockIcon" alt="" class="lock-icon" />
      </div>
      <SetForm v-if="!loginPassword && updateLoginPwdMethod"></SetForm>
      <AccountForm v-if="loginPassword && updateLoginPwdMethod"></AccountForm>
      <EmailForm v-if="loginPassword && !updateLoginPwdMethod"></EmailForm>
      <div class="footer-link" v-if="loginPassword">
        <span
          v-if="!updateLoginPwdMethod"
          class="link"
          @click="changeMethod"
        >{{ _t18('password_update_pwd') }}</span>
        <span v-else class="link" @click="changeMethod">{{ _t18('password_update_email') }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-change-pwd {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.card {
  margin-top: 0;
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
</style>
