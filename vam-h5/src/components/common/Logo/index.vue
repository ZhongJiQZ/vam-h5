<!-- 平台Logo -->
<script setup name="img-load">
import { computed } from 'vue'
import { _toView } from '@/utils/public.js'
import { useMainStore } from '@/store/index.js'
const mainStroe = useMainStore()

/**
 * Logo
 */
import logo from '@/assets/images/logo-white.png'
const path = computed(() => {
  let tempPath = mainStroe.getLogoList?.logo || mainStroe.getLogoList?.logoD
  if (!tempPath) {
    // tempPath = `/platform/${__config._APP_ENV}/logo.png?${_APP_VERSION}`
    // tempPath = `/platform/dev/logo.png?${_APP_VERSION}`
    tempPath = logo
  }
  return tempPath
})
</script>
<template>
  <img :src="path" loading="lazy" class="logo" @click="_toView('/home')" />
</template>
<style lang="scss" scoped>
.logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}
</style>
