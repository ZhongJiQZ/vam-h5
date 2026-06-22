<!-- 充值币种列表 -->
<template>
  <div class="recharge-list">
    <p class="section-title">{{ _t18('coinList') }}</p>
    <div class="list">
      <div
        v-for="(item, index) in props.data"
        :key="index"
        class="list-row"
        role="button"
        tabindex="0"
        @click="toClick(item)"
      >
        <div class="left">
          <span class="coin-wrap" aria-hidden="true">
            <svg-load :name="item.icon" class="coin"></svg-load>
          </span>
          <span class="coin-name">{{ item.title }}</span>
        </div>
        <span class="chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { _t18 } from '@/utils/public'

const router = useRouter()
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const toClick = (item) => {
  const q = new URLSearchParams({
    type: String(item.coinName ?? ''),
    coin: String(item.icon ?? '')
  })
  router.push(`/recharge-amount?${q.toString()}`)
}
</script>

<style lang="scss" scoped>
.recharge-list {
  padding: 0;
}

.section-title {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 10px;
  padding-left: 4px;
  text-align: left;
  line-height: 1.4;
}

.list {
  background: rgba(30, 21, 48, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 4px 16px;
}

.list-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  min-height: 56px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    opacity: 0.7;
  }
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.coin-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.coin {
  font-size: 32px;
  width: 32px;
  height: 32px;
  display: block;
}

.coin-name {
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.92);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>
