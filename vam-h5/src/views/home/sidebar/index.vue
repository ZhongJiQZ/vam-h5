<template>
  <div class="slidebar">
    <header class="sidebar-header">
      <div class="sidebar-header__title">{{ _t18('sidebar_personal_center') }}</div>
      <button type="button" class="sidebar-header__close" @click="closeSideBar">
        <img
          src="@/assets/images/close.png"
          alt=""
          class="sidebar-header__close-img"
        />
      </button>
    </header>
    <div class="sidebar-body">
      <UserLogin v-if="isSign"></UserLogin>
      <Navigation></Navigation>
    <!-- 未登录 -->
    <div v-if="!isSign" class="notLogged">
      <div class="btnBox" @click="_toView('/sign-in')">
        <!-- 登录 -->
        <ButtonBar :btnValue="_t18('login')" />
      </div>
      <div class="btnBox" @click="_toView('/sign-up')">
        <!-- 注册 -->
        <ButtonBar :btnReverse="false" :btnValue="_t18('register')" :btnColor="'#fff'" />
      </div>
    </div>
    <!-- 已登录 -->
    <div v-if="isSign && !userInfo.addressFlag" class="logged-wrap">
      <button type="button" class="logged-btn" @click="exit">
        <img
          src="@/assets/images/logout.png"
          alt=""
          class="logged-icon"
          aria-hidden="true"
        />
        <span class="logged-text">{{ _t18('layout', ['aams']) }}</span>
      </button>
    </div>

    <!-- 退出弹窗 -->
    <!-- 您确定要退出登录吗 -->
    <Dialog
      v-model:value="showDialog"
      :title="``"
      :content="_t18('layout_require')"
      confirm-button-color="#17ac74"
      @cancelBtn="cancelBtn"
      @confirmBtn="confirmBtn"
      :confirmButtonText="_t18('btnConfirm', ['bitmake'])"
      :cancelButtonText="_t18('cancel')"
      z-index="200"
    ></Dialog>
    </div>
  </div>
</template>
<script setup>
import { _back, _t18, _toView, _toReplace } from '@/utils/public'
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import { signOut } from '@/api/user'
import { useUserStore } from '@/store/user/index'
import UserLogin from '../components/Sidebar/userLogin.vue'
import Navigation from '../components/Sidebar/navigation.vue'
import Dialog from '@/components/Dialog/index.vue'
import { useToast } from '@/hook/useToast'
const { _toast } = useToast()

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
// 判断是否登录
const isSign = ref(userStore.isSign)
/**
 * 显示弹窗
 */
const showDialog = ref(false)
// 退出登录
const exit = () => {
  showDialog.value = true
}
const confirmBtn = () => {
  showDialog.value = false
  signOut()
    .then((res) => {
      if (res.code == '200') {
        _toast('layout_success')
        // 清除token
        userStore.signOut()
        _toReplace('/')
        closeSideBar()
        isSign.value = false
        // setTimeout(() => location.reload(), 10)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}
const cancelBtn = () => {
  showDialog.value = false
}
const emit = defineEmits(['closeSideBar'])
const closeSideBar = () => {
  emit('closeSideBar')
}
</script>
<style lang="scss" scoped>
/* 与 /withdraw 一致：外层深色 + 内层浅色圆角内容区 */
.slidebar {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #05101a;
  box-sizing: border-box;
}

.sidebar-header {
  flex-shrink: 0;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top, 0px);
  padding-left: 15px;
  padding-right: 15px;
  min-height: 60px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #05101a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-header__title {
  flex: 1;
  min-width: 0;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-header__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.sidebar-header__close-img {
  display: block;
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.sidebar-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding-bottom: calc(100px + constant(safe-area-inset-bottom));
  padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

// 未登录
.notLogged {
  border-top: 1px solid var(--ex-input-boder-bgColor);
  padding: 50px 15px 30px;
  .btnBox {
    margin-bottom: 20px;
  }
}
// 退出登录（胶囊按钮）
.logged-wrap {
  // border-top: 1px solid var(--ex-input-boder-bgColor);
  margin-top: 50px;
  padding: 30px 15px;
}

.logged-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border: none;
  border-radius: 999px;
  background: #0a0f14;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    opacity: 0.92;
  }
}

.logged-icon {
  flex-shrink: 0;
  display: block;
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.logged-text {
  color: #fff;
}
</style>
