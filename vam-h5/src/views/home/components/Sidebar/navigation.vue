<template>
  <nav class="profile-sidebar-panel__menu" aria-label="Account menu">
    <button
      v-for="item in listArray.filter((item) => item.isOpen)"
      :key="item.icon"
      type="button"
      class="profile-sidebar-panel__item"
      @click="toView(item)"
    >
      <span class="profile-sidebar-panel__icon">
        <image-load :filePath="item.logoUrl" alt="" />
      </span>
      <span class="profile-sidebar-panel__label">
        <template v-if="item.key == 'language'">{{ _t18('language_key') }}</template>
        <template v-else>{{ _t18(`sidebar_${item.key}`, ['bitmake', 'paxpay', 'aams']) }}</template>
      </span>
      <span
        v-if="item.key == 'primary' && userInfo.detail?.auditStatusPrimary === '1'"
        class="profile-sidebar-panel__badge"
      >
        {{ _t18('verified_ok') }}
      </span>
      <span
        v-if="item.key == 'advanced' && userInfo.detail?.auditStatusAdvanced === '1'"
        class="profile-sidebar-panel__badge"
      >
        {{ _t18('verified_ok') }}
      </span>
      <SidebarChevron />
    </button>
  </nav>
</template>

<script setup>
import { noticeList, getWhitePaperUrl } from '@/api/common/index'
import { useMainStore } from '@/store/index.js'
import { _t18 } from '@/utils/public'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { useToast } from '@/hook/useToast'
import SidebarChevron from './SidebarChevron.vue'
import { useRouter } from 'vue-router'

const { _toast } = useToast()
const userStore = useUserStore()
if (userStore.isSign) {
  userStore.getUserInfo({ silent: true })
}

const { userInfo } = storeToRefs(userStore)
const router = useRouter()
const mainStore = useMainStore()
const paperUrl = ref('')

const listArray = computed(() => {
  return mainStore.getSidebarList
})

onMounted(() => {
  getWhitePaper()
})

const getWhitePaper = async () => {
  const res = await getWhitePaperUrl()
  if (res.code == '200') {
    paperUrl.value = res.data.url
  }
}

const toView = (item) => {
  if (item.key == 'paper') {
    router.push('/white-paper')
  }

  if (item.jumpType == 'link' && item.key == 'aboutUS') {
    window.open(paperUrl.value)
  } else if (item.jumpType == 'path') {
    if (item.key == 'advanced') {
      const target = listArray.value.find((item) => item.key == 'primary')
      if (target && target.isOpen) {
        const auditStatusPrimary = userInfo.value.detail.auditStatusPrimary
        if (auditStatusPrimary && auditStatusPrimary == 1) {
          router.push(item.jumpUrl)
        } else {
          _toast('please_primary')
        }
      } else {
        router.push(item.jumpUrl)
      }
    } else {
      router.push(item.jumpUrl)
    }
  }
}
</script>
