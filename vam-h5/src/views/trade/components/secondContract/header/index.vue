<template>
  <div class="sc-header">
    <!-- 顶部行：币种 + 涨跌% 左 / 双按钮 右 -->
    <div class="sc-symbol-row">
      <div class="symbol-pill" @click="emits('showSidePopup')">
        <img v-if="coinInfo.logo" :src="coinInfo.logo" class="symbol-pill__logo" alt="" />
        <div v-else class="symbol-pill__logo symbol-pill__logo--ph"></div>
        <div class="symbol-pill__name fw-bold">
          {{ coinInfo.showSymbol }}
        </div>
        <img :src="iconChevron" class="symbol-pill__chev" alt="" />
      </div>

      <div class="symbol-actions">
        <div class="action-info" @click="_toView('/tradingRules?type=0')">
          <img :src="iconInfo" class="action-info__icon" alt="" />
        </div>
      </div>
    </div>

    <!-- 价格 + 涨跌% (左) / 高/低/量 (右) -->
    <div class="sc-price-row">
      <div class="sc-price-block">
        <div
          class="sc-price"
          :class="_isRFD(coinPriceInfo.open, coinPriceInfo.close, 'buy', 'rise')"
        >
          <span class="fw-num">{{ coinPriceInfo.close || '0.00' }}</span>
        </div>
        <div
          :class="[
            _isRFDByChangePercent(coinPriceInfo?.priceChangePercent, 'buy', 'rise'),
            'rfd-sign sc-change fw-num'
          ]"
        >
          {{ _absChangePercentStr(coinPriceInfo?.priceChangePercent) }}%
        </div>
      </div>
      <div class="sc-stats">
        <div class="sc-stat-item">
          <span class="sc-stat-item__label">{{ _t18(`k_hight`, ['ebc']) }}</span>
          <span class="sc-stat-item__value fw-num">
            {{ priceFormat(coinPriceInfo?.high24 || tradeStore.klineTicker.highPrice || 0) }}
          </span>
        </div>
        <div class="sc-stat-item">
          <span class="sc-stat-item__label">{{ _t18(`k_low`, ['ebc']) }}</span>
          <span class="sc-stat-item__value fw-num">
            {{ priceFormat(coinPriceInfo?.low24 || tradeStore.klineTicker.lowPrice || 0) }}
          </span>
        </div>
        <div class="sc-stat-item">
          <span class="sc-stat-item__label">{{ _t18(`k_quantity`) }}</span>
          <span class="sc-stat-item__value fw-num">
            {{ countFormat(coinPriceInfo?.volume24 || tradeStore.klineTicker.volume || 0) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTradeStore } from '@/store/trade'
import { countFormat, priceFormat } from '@/utils/decimal'
import { _t18, _toView, _isRFD, _isRFDByChangePercent, _absChangePercentStr } from '@/utils/public'
import { useMainStore } from '@/store/index.js'
import { onMounted } from 'vue'
import iconChevron from '@/assets/images/gxpex/trade/icon-symbol-info.svg'
import iconInfo from '@/assets/images/gxpex/help/icon-faq-info.svg'
const mainStore = useMainStore()

const props = defineProps({
  coinInfo: { type: Object, default: () => {} }
})
const coinCollect = ref()
onMounted(() => {
  coinCollect.value = props.coinInfo.isCollect === 2 ? false : true
})
watch(
  () => props.coinInfo.coin,
  () => {
    coinCollect.value = props.coinInfo.isCollect === 2 ? false : true
  },
  { deep: true }
)

const tradeStore = useTradeStore()
const coinPriceInfo = computed(() => {
  return tradeStore.allCoinPriceInfo[props.coinInfo.coin] || {}
})
const emits = defineEmits(['showSidePopup'])
</script>

<style lang="scss" scoped>
.sc-header {
  padding: 0;
  background: transparent;
}

/* 第 1 行：币种 + 按钮 (跟 U本位/BB 同款 28px 高小尺寸) */
.sc-symbol-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px 8px;
  gap: 8px;
}

.symbol-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
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

}

.symbol-actions {
  display: flex;
  align-items: center;
}

.action-info {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &__icon {
    width: 18px;
    height: 18px;
    /* 把 SVG 自带的紫色滤成白色，再用 opacity 调暗，跟 U本位 icon 同调 */
    filter: brightness(0) invert(1);
    opacity: 0.6;
    transition: opacity 0.18s ease;
  }
  &:active &__icon { opacity: 1; }
}

/* 第 2 行：左 价格+涨跌% 列 / 右 高低量 */
.sc-price-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 4px 14px 12px;
  gap: 12px;
}

.sc-price-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.sc-price {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.3px;
  font-variant-numeric: tabular-nums;
  color: #f5f3f8;

  &.rise { color: #31c48d; }
  &.fall { color: #ff435d; }
}

.sc-change {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.sc-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sc-stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;

  &__label {
    color: #aaa5b3;
    min-width: 28px;
  }
  &__value {
    color: #f5f3f8;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
}
</style>
