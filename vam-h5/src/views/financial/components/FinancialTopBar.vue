<template>
  <div class="financial-top-bar">
    <Logo />
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
        class="icon"
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
import Logo from '@/components/common/Logo/index.vue'
import { dispatchCustomEvent } from '@/utils/index'
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
</style>
