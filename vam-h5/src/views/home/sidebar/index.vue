<template>
  <aside class="profile-sidebar-panel" aria-label="Personal center">
    <button type="button" class="profile-sidebar-panel__close" aria-label="Close" @click="closeSideBar">
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M17.6 15.24L30.01 2.82C30.31 2.52 30.48 2.11 30.48 1.68C30.48 1.25 30.31 0.84 30.01 0.54L29.94 0.47C29.63 0.17 29.22 0 28.79 0C28.37 0 27.96 0.17 27.65 0.47L15.24 12.9L2.83 0.47C2.53 0.17 2.12 0 1.69 0C1.26 0 0.85 0.17 0.55 0.47L0.48 0.54C0.33 0.69 0.21 0.86 0.13 1.06C0.04 1.26 0 1.47 0 1.68C0 1.89 0.04 2.11 0.13 2.3C0.21 2.5 0.33 2.68 0.48 2.82L12.89 15.24L0.48 27.65C0.18 27.96 0.01 28.37 0.01 28.79C0.01 29.22 0.18 29.63 0.48 29.94L0.55 30.01C0.85 30.31 1.26 30.48 1.69 30.48C2.12 30.48 2.53 30.31 2.83 30.01L15.24 17.59L27.65 30.01C27.96 30.31 28.37 30.48 28.79 30.48C29.22 30.48 29.63 30.31 29.94 30.01L30.01 29.94C30.31 29.63 30.48 29.22 30.48 28.8C30.48 28.37 30.31 27.96 30.01 27.65L17.6 15.24Z"
          fill="rgba(255,255,255,0.650)"
          fill-rule="nonzero"
        />
      </svg>
    </button>

    <UserLogin v-if="isSign" />

    <div v-if="isSign" class="profile-sidebar-panel__divider" role="presentation"></div>

    <Navigation />

    <div v-if="!isSign" class="profile-sidebar-panel__auth">
      <button type="button" class="profile-sidebar-panel__auth-btn profile-sidebar-panel__auth-btn--primary" @click="_toView('/sign-in')">
        {{ _t18('login') }}
      </button>
      <button type="button" class="profile-sidebar-panel__auth-btn profile-sidebar-panel__auth-btn--ghost" @click="_toView('/sign-up')">
        {{ _t18('register') }}
      </button>
    </div>

    <div v-if="isSign && !userInfo.addressFlag" class="profile-sidebar-panel__logout">
      <button type="button" class="profile-sidebar-panel__item" @click="exit">
        <span class="profile-sidebar-panel__icon">
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M12 4H6C4.9 4 4 4.9 4 6V26C4 27.1 4.9 28 6 28H12"
              stroke="rgba(255,255,255,0.65)"
              stroke-width="2"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M20 22L28 16L20 10"
              stroke="rgba(255,255,255,0.65)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
            <path
              d="M28 16H12"
              stroke="rgba(255,255,255,0.65)"
              stroke-width="2"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
        </span>
        <span class="profile-sidebar-panel__label">{{ _t18('layout', ['aams']) }}</span>
        <SidebarChevron />
      </button>
    </div>

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
    />
  </aside>
</template>

<script setup>
import { _t18, _toView, _toReplace } from '@/utils/public'
import { signOut } from '@/api/user'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import UserLogin from '../components/Sidebar/userLogin.vue'
import Navigation from '../components/Sidebar/navigation.vue'
import SidebarChevron from '../components/Sidebar/SidebarChevron.vue'
import Dialog from '@/components/Dialog/index.vue'
import { useToast } from '@/hook/useToast'

const { _toast } = useToast()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const isSign = ref(userStore.isSign)
const showDialog = ref(false)

const exit = () => {
  showDialog.value = true
}

const confirmBtn = () => {
  showDialog.value = false
  signOut()
    .then((res) => {
      if (res.code == '200') {
        _toast('layout_success')
        userStore.signOut()
        _toReplace('/')
        closeSideBar()
        isSign.value = false
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
