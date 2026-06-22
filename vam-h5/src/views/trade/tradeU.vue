<!-- 交易 → U本位 独立路由 /tradeU
     顶部用 GXPEX 子页同款 header；内容直接挂 tradeUstandard.vue
     拿到它全套 .u-trade-wrap 暗紫主题 + 下单/订单区 deep 样式覆盖 -->
<template>
  <div class="tradeU-page">
    <header class="tradeU-header">
      <button type="button" class="tradeU-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="tradeU-header__back-icon" />
      </button>
      <h1 class="tradeU-header__title">{{ _t18('trade_tab5', ['paxpay', 'latcoin']) }}</h1>
    </header>

    <TradeUstandard :headerList="headerList" />
  </div>
</template>

<script setup>
import TradeUstandard from './components/tradeUstandard.vue'
import { _t18, _back } from '@/utils/public'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'

defineProps({
  headerList: { type: Array }
})
</script>

<style lang="scss" scoped>
.tradeU-page {
  position: relative;
  min-height: 100vh;
  background: #111216;
  color: #f5f3f8;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.tradeU-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.tradeU-header__back {
  position: absolute;
  left: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.tradeU-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.tradeU-header__title {
  margin: 0;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}
</style>
