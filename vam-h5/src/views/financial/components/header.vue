<template>
  <div class="earn-tabs" role="tablist">
    <button
      v-for="item in tabList"
      :key="item.path"
      type="button"
      class="earn-tabs__item"
      :class="{ 'earn-tabs__item--active': isActive(item.path) }"
      @click="$router.push(item.path)"
    >
      <span class="earn-tabs__icon">
        <EarnIcon :name="item.icon" :size="28" :active="isActive(item.path)" />
      </span>
      <span class="earn-tabs__label">{{ item.name }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { _t18 } from '@/utils/public'
import EarnIcon from './EarnIcon.vue'

const route = useRoute()

const tabList = computed(() => [
  {
    icon: 'yield',
    name: _t18('value_added _income'),
    path: '/addIncome',
  },
  {
    icon: 'standard',
    name: _t18('normal_product'),
    path: '/generalMerchandise',
  },
  {
    icon: 'investment',
    name: _t18('my_invest'),
    path: '/myInvestment',
  },
])

const isActive = (path) => {
  if (path === '/addIncome') {
    return route.path === '/financial' || route.path === '/addIncome'
  }
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<style lang="scss" scoped>
.earn-tabs {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0;
  min-height: 51px;
}

.earn-tabs__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 109px;
  flex-shrink: 0;
  gap: 6px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
}

.earn-tabs__icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.earn-tabs__label {
  width: 100%;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.42;
  color: #fff;
  text-align: center;
}

.earn-tabs__item--active .earn-tabs__label {
  font-weight: 500;
}
</style>
