<template>
  <div v-if="userId" class="profile-sidebar-panel__head">
    <img
      class="profile-sidebar-panel__avatar"
      :src="avatarImg"
      alt=""
      @click="$router.push('/myassets')"
    />
    <div class="profile-sidebar-panel__uid-row">
      <p class="profile-sidebar-panel__uid">UID:{{ userId }}</p>
      <button type="button" class="profile-sidebar-panel__copy" aria-label="Copy UID" @click="copyUid">
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g transform="translate(3.71, 3.36)">
            <path
              d="M20.15 0L9.11 0C7.89 0 6.72 0.48 5.84 1.33C4.97 2.19 4.47 3.36 4.45 4.58C3.26 4.63 2.12 5.14 1.3 6.01C0.47 6.87 0 8.02 0 9.22L0 20.46C0 21.69 0.49 22.87 1.36 23.74C2.23 24.61 3.41 25.1 4.64 25.1L15.7 25.1C16.92 25.1 18.09 24.62 18.96 23.76C19.83 22.9 20.32 21.74 20.34 20.52C21.54 20.47 22.67 19.96 23.5 19.09C24.33 18.23 24.79 17.08 24.8 15.88L24.8 4.65C24.79 3.42 24.31 2.24 23.44 1.36C22.57 0.49 21.38 0 20.15 0ZM18.43 20.46C18.43 21.18 18.14 21.87 17.63 22.38C17.12 22.89 16.43 23.18 15.71 23.18L4.67 23.18C3.95 23.18 3.26 22.89 2.75 22.38C2.24 21.87 1.95 21.18 1.95 20.46L1.95 9.22C1.95 8.5 2.24 7.81 2.75 7.3C3.26 6.79 3.95 6.5 4.67 6.5L15.7 6.5C16.42 6.51 17.11 6.79 17.62 7.3C18.13 7.81 18.42 8.5 18.42 9.22L18.43 20.46ZM22.88 15.88C22.88 16.57 22.62 17.24 22.15 17.74C21.68 18.25 21.04 18.56 20.35 18.6L20.35 9.22C20.35 7.99 19.86 6.81 18.99 5.95C18.12 5.08 16.94 4.59 15.71 4.58L6.38 4.58C6.4 3.87 6.69 3.19 7.2 2.7C7.71 2.2 8.39 1.92 9.11 1.92L20.15 1.92C20.87 1.92 21.56 2.21 22.07 2.72C22.58 3.23 22.87 3.92 22.87 4.64L22.88 15.88Z"
              fill="rgb(160,65,237)"
              fill-rule="nonzero"
            />
          </g>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import avatarImg from '@/assets/images/gxpex/home/sidebar-avatar.png'
import { computed } from 'vue'
import Copy from 'vue-clipboard3'
import { useToast } from '@/hook/useToast'
import { useUserStore } from '@/store/user/index'

const { _toast } = useToast()
const userStore = useUserStore()
const userId = computed(() => userStore.userInfo.user?.userId)
const { toClipboard } = Copy()

const copyUid = async () => {
  if (!userId.value) return
  try {
    await toClipboard(String(userId.value))
    _toast('copy_success')
  } catch {
    _toast('copy_error')
  }
}
</script>
