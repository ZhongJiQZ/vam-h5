<template>
  <div class="assets-shortcuts">
    <button
      v-for="link in links"
      :key="link.path"
      type="button"
      class="assets-shortcuts__btn"
      :aria-label="link.aria"
      @click="_toView(link.path)"
    >
      <AssetsIcon :name="link.icon" :size="20" :active="isActive(link.path)" />
    </button>
  </div>
</template>

<script setup>
import { _toView } from '@/utils/public'
import AssetsIcon from './AssetsIcon.vue'

defineProps({
  links: {
    type: Array,
    default: () => [
      { path: '/myassets', aria: 'myassets', icon: 'wallet' },
      { path: '/orderCenter', aria: 'orderCenter', icon: 'order' },
      { path: '/assetRecord', aria: 'assetRecord', icon: 'record' },
    ],
  },
})

const route = useRoute()

const isActive = (path) =>
  route.path === path || route.path.startsWith(`${path}/`)
</script>

<style lang="scss" scoped>
.assets-shortcuts {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.assets-shortcuts__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  /* SVG 内部不同 transform 偏移略调，确保视觉居中 */
  :deep(.assets-icon) { width: 20px !important; height: 20px !important; }
}
</style>
