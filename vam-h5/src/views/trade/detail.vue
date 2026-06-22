<!-- K线 + 实时成交 详情页 -->
<template>
  <div class="detail-page">
    <div class="bg-glow bg-glow--1"></div>
    <div class="bg-glow bg-glow--2"></div>

    <van-sticky>
      <header class="detail-header">
        <div class="detail-topbar">
          <div class="detail-topbar__back" @click="_back()">
            <img :src="iconBack" alt="back" class="detail-topbar__back-icon" />
          </div>

          <div class="symbol-pill" @click="showLeft">
            <img v-if="coinInfo.logo" :src="coinInfo.logo" class="symbol-pill__logo" alt="" />
            <div v-else class="symbol-pill__logo symbol-pill__logo--ph"></div>
            <div class="symbol-pill__name fw-bold">{{ coinInfo.showSymbol }}</div>
            <img :src="iconChevron" class="symbol-pill__chev" alt="" />
          </div>
        </div>

        <!-- 价格 + 涨跌% / 高低量 -->
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
              <span class="sc-stat-item__value fw-num">{{ priceFormat(coinPriceInfo.high24) }}</span>
            </div>
            <div class="sc-stat-item">
              <span class="sc-stat-item__label">{{ _t18(`k_low`, ['ebc']) }}</span>
              <span class="sc-stat-item__value fw-num">{{ priceFormat(coinPriceInfo.low24) }}</span>
            </div>
            <div class="sc-stat-item">
              <span class="sc-stat-item__label">{{ _t18(`k_quantity`) }}</span>
              <span class="sc-stat-item__value fw-num">{{ countFormat(coinPriceInfo.volume24) }}</span>
            </div>
          </div>
        </div>
      </header>
    </van-sticky>

    <div class="detail-sheet">
      <Candlestick v-if="coinInfo.coin" :coinInfo="coinInfo" type="detail"></Candlestick>

      <!-- 实时成交标题行 — 沿用 .sc-entrust 同款 -->
      <div class="sc-entrust">
        <div class="entrustL">
          <div class="entrustItem hightItem">
            <span class="entrustItem__text">{{ _t18(`real_time_transaction`) }}</span>
          </div>
        </div>
      </div>

      <!-- 成交列表 -->
      <DealList v-if="coinInfo.coin" :coinInfo="coinInfo" :rows="20"></DealList>
    </div>

    <!-- 左侧切换币种 -->
    <PublicPopup
      :show="showOverlay"
      :direction="`left`"
      @handelClose="handelClose"
      :height="`100%`"
      :width="`80%`"
      :showHeader="false"
      :empty="false"
    >
      <template #emptyContentCustomize>
        <LeftSide @linkTo="linkTo" @close="handelClose"></LeftSide>
      </template>
    </PublicPopup>
  </div>
</template>

<script setup>
import Candlestick from './components/common/candlestick.vue'
import DealList from './components/common/dealList.vue'
import PublicPopup from '@/components/Popup/public.vue'
import LeftSide from './components/common/leftSide.vue'
import { countFormat, priceFormat } from '@/utils/decimal'
import {
  _isRFD,
  _isRFDByChangePercent,
  _absChangePercentStr,
  _t18,
  _back
} from '@/utils/public'
import { useMainStore } from '@/store/index'
const mainStore = useMainStore()
import { useTradeStore } from '@/store/trade'
const tradeStore = useTradeStore()
import { useRoute } from 'vue-router'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconChevron from '@/assets/images/gxpex/trade/icon-symbol-info.svg'
const $route = useRoute()

const showOverlay = ref(false)
const showLeft = () => {
  showOverlay.value = true
}
const handelClose = () => {
  showOverlay.value = false
}

const coinInfo = computed(() => {
  let temp = {}
  if (Number($route.query.type) == 2) {
    if ($route.query.symbol) {
      temp =
        tradeStore.contractCoinList.filter((obj) => {
          return obj.coin === $route.query.symbol
        })[0] || tradeStore.contractCoinList[0]
    } else {
      temp = tradeStore.contractCoinList[0]
    }
  } else {
    if ($route.query.symbol) {
      temp =
        tradeStore.spotCoinList.filter((obj) => {
          return obj.coin === $route.query.symbol
        })[0] || tradeStore.spotCoinList[0]
    } else {
      temp = tradeStore.spotCoinList[0]
    }
  }

  return temp
})
const getHeader = () => {}
const coinPriceInfo = computed(() => {
  return tradeStore.allCoinPriceInfo[coinInfo.value.coin] || {}
})

const linkTo = (item, type) => {
  $route.query.symbol = item
  $route.query.type = type || $route.query.type
  showOverlay.value = false
  getHeader()
}
watch(
  () => {
    coinInfo.value.coin
  },
  (val, oldVal) => {
    tradeStore.setCurrentCoinList(oldVal, 'remove')
    tradeStore.setCurrentCoinList(val)
  }
)
onMounted(() => {
  getHeader()
})
onUnmounted(() => {
  tradeStore.setCurrentCoinList(coinInfo.value.coin, 'remove')
})
</script>

<style lang="scss" scoped>
.detail-page {
  position: relative;
  min-height: 100vh;
  background: #111216;
  box-sizing: border-box;
  overflow-x: hidden;

  /* GXPEX 暗紫主题 — 与 trade-page 同源，沿 DOM 继承让 Candlestick/DealList 自动暗色 */
  --page-bg: #111216;
  --panel-bg: #211b32;
  --input-bg: #181326;
  --text-primary: #f5f3f8;
  --text-secondary: #aaa5b3;
  --text-disabled: #625d6d;
  --buy-color: #31c48d;
  --sell-color: #ff435d;
  --ask-color: #ff5968;
  --bid-color: #5fc692;
  --purple: #a13cff;
  --divider: rgba(255, 255, 255, 0.09);

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Microsoft YaHei', sans-serif;
  color: var(--text-primary);

  --ex-default-font-color: var(--text-primary);
  --ex-passive-font-color: var(--text-secondary);
  --ex-font-color: var(--text-primary);
  --ex-font-color1: var(--text-disabled);
  --ex-font-color2: var(--purple);
  --ex-font-color6: var(--text-primary);
  --ex-font-color9: var(--text-primary);
  --ex-font-color10: var(--text-primary);
  --ex-font-color21: var(--text-secondary);
  --ex-font-color22: var(--text-primary);
  --ex-active-font-color: var(--purple);
  --ex-tip-font-color: var(--sell-color);
  --ex-border-color: rgba(255, 255, 255, 0.07);
  --ex-border-color5: rgba(255, 255, 255, 0.07);

  --ex-default-background-color: transparent;
  --ex-div-bgColor: var(--input-bg);
  --ex-div-bgColor1: var(--buy-color);
  --ex-div-bgColor2: var(--input-bg);
  --ex-div-bgColor3: rgba(255, 255, 255, 0.18);
  --ex-div-bgColor4: var(--purple);
  --ex-div-bgColor5: var(--input-bg);
  --ex-div-bgColor7: rgba(239, 86, 101, 0.18);
  --ex-div-bgColor8: transparent;
  --ex-div-bgColor10: var(--divider);
  --ex-div-bgColor12: var(--input-bg);
  --ex-div-bgColor19: rgba(0, 0, 0, 0.6);
  --ex-div-bgColor21: rgba(161, 60, 255, 0.16);
  --ex-div-bgColor29: rgba(161, 60, 255, 0.18);

  --ex-rfd-rise-bg: rgba(49, 196, 141, 0.18);
  --ex-rfd-fall-bg: rgba(255, 67, 93, 0.18);
  --ex-rfd-draw-bg: rgba(125, 145, 157, 0.15);
  --ex-rfd-rise: var(--bid-color);
  --ex-rfd-fall: var(--ask-color);
  --ex-rfd-draw: #7d919d;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #a642ec 0%, #802bda 60%, transparent 100%);
  filter: blur(60px);
  opacity: 0.18;
  pointer-events: none;
  z-index: 0;

  &--1 {
    top: -80px;
    right: -60px;
    width: 260px;
    height: 260px;
  }
  &--2 {
    top: 200px;
    left: -90px;
    width: 240px;
    height: 240px;
  }
}

.detail-header {
  position: relative;
  z-index: 2;
  background: transparent;
  padding-top: env(safe-area-inset-top);
}

.detail-topbar {
  position: relative;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;

  &__back {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  &__back-icon {
    width: 12px;
    height: 22px;
    opacity: 0.9;
  }
}

/* 中间币种胶囊 — 与 sc-header 同款 */
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
  &__logo--ph {
    background: rgba(255, 255, 255, 0.12);
  }

  &__name {
    font-family: 'Inter', 'PingFang SC', sans-serif;
    font-size: 16px;
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

/* 价格 / 高低量行 — 与 sc-header 同款 */
.sc-price-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 4px 14px 14px;
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

  &.rise {
    color: #31c48d;
  }
  &.fall {
    color: #ff435d;
  }
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

.detail-sheet {
  position: relative;
  z-index: 1;
}

/* 实时成交标题行 — 与 sc-entrust 同款，左侧紫色下划线 */
.sc-entrust {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 18px 4px;
  height: 40px;
  background: transparent;
}

.sc-entrust .entrustL {
  display: flex;
  align-items: center;
  height: 40px;
  background: transparent;
}

.sc-entrust .entrustItem {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 0 4px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  position: relative;
  background: transparent !important;
}

.sc-entrust .entrustItem.hightItem {
  color: #f5f3f8 !important;
  font-weight: 600;
}

.sc-entrust .entrustItem.hightItem::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 2px;
  transform: translateX(-50%);
  width: 18px;
  height: 3px;
  background: #a13cff;
  border-radius: 2px;
}
</style>
