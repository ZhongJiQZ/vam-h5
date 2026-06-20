<template>
  <div class="bb-symbol-header">
    <!-- 左：币种 + 涨跌% -->
    <div class="symbol-pill" @click="emits('showSidePopup')">
      <img v-if="coinInfo.logo" :src="coinInfo.logo" class="symbol-pill__logo" alt="" />
      <div v-else class="symbol-pill__logo symbol-pill__logo--ph"></div>
      <div class="symbol-pill__name fw-bold">
        {{ coinInfo.showSymbol }}
      </div>
      <img :src="iconChevron" class="symbol-pill__chev" alt="" />
      <div
        :class="[
          _isRFDByChangePercent(coinPriceInfo?.priceChangePercent, 'buy', 'rise'),
          'rfd-sign symbol-pill__change fw-num'
        ]"
      >
        {{ _absChangePercentStr(coinPriceInfo?.priceChangePercent) }}%
      </div>
    </div>

    <!-- 右：双按钮 -->
    <div class="symbol-actions">
      <div class="action-pill">
        <div
          class="action-pill__btn"
          @click="$router.push(`/detail?symbol=${coinInfo.coin}&type=1`)"
        >
          <img :src="iconDepth" class="action-pill__icon" alt="" />
        </div>
        <div
          class="action-pill__btn action-pill__btn--active"
          @click="_toView('/tradingRules?type=1')"
        >
          <img :src="iconOrderbook" class="action-pill__icon" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTradeStore } from '@/store/trade'
import { _t18, _toView, _isRFDByChangePercent, _absChangePercentStr } from '@/utils/public'
import { useMainStore } from '@/store/index.js'
import iconChevron from '@/assets/images/gxpex/trade/icon-symbol-info.svg'
import iconDepth from '@/assets/images/gxpex/trade/icon-btn-left.svg'
import iconOrderbook from '@/assets/images/gxpex/trade/icon-btn-right.svg'
const mainStore = useMainStore()

const props = defineProps({
  coinInfo: { type: Object, default: () => {} }
})

const tradeStore = useTradeStore()
const coinPriceInfo = computed(() => {
  return tradeStore.allCoinPriceInfo[props.coinInfo.coin] || {}
})
const emits = defineEmits(['showSidePopup'])
</script>

<style lang="scss" scoped>
.bb-symbol-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px 8px;
  background: transparent;
  gap: 8px;
}

/* 左：币种 (无胶囊，直接透到页面) */
.symbol-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  min-width: 0;

  &__logo {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    object-fit: contain;
    background: rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }
  &__logo--ph { background: rgba(255, 255, 255, 0.12); }

  &__name {
    font-family: 'Inter', 'PingFang SC', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #f5f3f8;
    line-height: 1;
    white-space: nowrap;
  }

  &__chev {
    width: 10px;
    height: 10px;
    opacity: 0.6;
    margin-left: 2px;
  }

  &__change {
    margin-left: 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
}

/* 右：双按钮 (透明，无胶囊) */
.symbol-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-pill {
  display: flex;
  align-items: center;
  background: transparent;
  padding: 0;
  gap: 4px;
}

.action-pill__btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.2s ease;

  &__icon {
    width: 16px;
    height: 16px;
    opacity: 0.6;
  }

  &--active {
    background: #a13cff;
    .action-pill__icon { opacity: 1; }
  }
}

.action-pill__icon { width: 16px; height: 16px; }
</style>
