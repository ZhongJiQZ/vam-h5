<template>
  <div class="page-white-paper">
    <DarkHeaderBar :title="_t18('sidebar_paper')" :border_bottom="true" />
    <iframe :src="paperUrl" frameborder="0"></iframe>
  </div>
</template>

<script setup>
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import { _t18 } from '@/utils/public'
import { useMainStore } from '@/store/index.js'
const mainStore = useMainStore()
const paperUrl = computed(() => {
  let data = mainStore.getSidebarList.filter((item) => item.isOpen && item.key == 'paper')
  return data[0]?.jumpUrl
})
</script>

<style lang="scss" scoped>
.page-white-paper {
  iframe {
    width: 100%;
    height: 100%;
    min-height: calc(100vh - 62px);
  }
}
</style>