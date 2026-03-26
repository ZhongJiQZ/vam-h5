<template>
  <div class="financial-top-bar">
    <img
      :src="logoSrc"
      alt=""
      class="logo-img"
      loading="lazy"
      @click="_toView('/home')"
    />
    <div class="actions">
      <img
        src="@/assets/images/financial/service.png"
        alt=""
        class="icon"
        @click="dispatchCustomEvent('event_serviceChange')"
      />
      <img
        src="@/assets/images/financial/sousuo.png"
        alt=""
        class="icon icon-search"
        @click="$router.push('/quote')"
      />
      <img
        src="@/assets/images/financial/user.png"
        alt=""
        class="icon"
        @click="$router.push('/myassets')"
      />
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useMainStore } from '@/store/index.js'
import { _toView } from '@/utils/public.js'
import { dispatchCustomEvent } from '@/utils/index'
import logoFallback from '@/assets/images/logo-white.png'

const mainStore = useMainStore()

const logoSrc = computed(() => {
  const fromStore = mainStore.getLogoList?.logo || mainStore.getLogoList?.logoD
  return fromStore || logoFallback
})
</script>
<style lang="scss" scoped>
.financial-top-bar {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #010e1a;
  box-sizing: border-box;
  width: 100%;
  max-width: var(--ex-max-width, 100%);
}
.logo-img {
  height: 32px;
  border-radius: 12px;
  object-fit: contain;
  display: block;
}
.actions {
  display: flex;
  align-items: center;
  gap: 18px;
}
.icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
}
.icon-search {
  width: 19px;
  height: 19px;
}
</style>
