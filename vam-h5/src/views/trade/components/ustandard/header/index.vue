<template>
  <div class="u-symbol-header">
    <!-- 左：币种 胶囊 -->
    <div class="symbol-pill" @click="emits('showSidePopup')">
      <img v-if="coinInfo.logo" :src="coinInfo.logo" class="symbol-pill__logo" alt="" />
      <div v-else class="symbol-pill__logo symbol-pill__logo--ph"></div>
      <div class="symbol-pill__name">
        {{ coinInfo.showSymbol }}
      </div>
      <img :src="iconChevron" class="symbol-pill__chev" alt="" />
    </div>

    <!-- 右：双按钮胶囊 + 跟单 -->
    <div class="symbol-actions">
      <div class="action-pill">
        <div
          class="action-pill__btn"
          @click="$router.push(`/detail?symbol=${coinInfo.coin}&type=2`)"
        >
          <img :src="iconDepth" class="action-pill__icon" alt="" />
        </div>
        <div
          class="action-pill__btn action-pill__btn--active"
          @click="_toView('/tradingRules?type=2')"
        >
          <img :src="iconOrderbook" class="action-pill__icon" alt="" />
        </div>
      </div>
      <div class="copytrade-btn" @click="onCopyTrade">
        <img :src="iconCopytrade" class="copytrade-btn__icon" alt="" />
        <span class="copytrade-btn__text">{{ _t18('copy_trade') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTradeStore } from '@/store/trade'
import { _t18, _toView } from '@/utils/public'
import { useMainStore } from '@/store/index.js'
import { useRouter } from 'vue-router'
import iconChevron from '@/assets/images/gxpex/trade/icon-symbol-info.svg'
import iconDepth from '@/assets/images/gxpex/trade/icon-btn-left.svg'
import iconOrderbook from '@/assets/images/gxpex/trade/icon-btn-right.svg'
import iconCopytrade from '@/assets/images/gxpex/trade/icon-copytrade.svg'
const mainStore = useMainStore()
const router = useRouter()

const props = defineProps({
  coinInfo: { type: Object, default: () => {} }
})

const tradeStore = useTradeStore()
const coinPriceInfo = computed(() => {
  return tradeStore.allCoinPriceInfo[props.coinInfo.coin] || {}
})
const emits = defineEmits(['showSidePopup'])

const onCopyTrade = () => {
  router.push('/copy-trade')
}
</script>

<style lang="scss" scoped>
.u-symbol-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px 8px;
  background: transparent;
  gap: 8px;
}

/* 左侧：币种 (无胶囊，直接透到页面) */
.symbol-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0;
  background: transparent;
  border-radius: 0;
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

/* 右侧：双按钮 + 跟单 (透明背景，无胶囊) */
.symbol-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-pill {
  display: flex;
  align-items: center;
  background: transparent;
  border-radius: 0;
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

.action-pill__icon {
  width: 16px;
  height: 16px;
}

.copytrade-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
  padding: 0 2px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &__icon { width: 16px; height: 16px; }
  &__text {
    font-family: 'Inter', 'PingFang SC', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #f5f3f8;
  }
}
</style>
