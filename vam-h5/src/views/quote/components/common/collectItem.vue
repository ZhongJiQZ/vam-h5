<template>
  <div class="collectItem">
    <div class="left">
      <img v-if="collectItem.icon" :src="collectItem.icon" class="leftImg" alt="" />
      <!-- <p class="fw-bold">{{ item.coin?.toUpperCase() }}</p> -->
      <div class="nameBlock">
        <div class="topText ff-num">
          <div class="textTop fw-num">
            {{ collectItem.coin?.toUpperCase() }}
          </div>
        </div>
        <div v-if="playStyleLabel" class="play-style">{{ playStyleLabel }}</div>
      </div>
    </div>
    <!-- <div class="right">
          <p>{{ tradeStore.allCoinPriceInfo[`${item.coin}`]?.close }}</p>
          <p>{{ tradeStore.allCoinPriceInfo[`${item.coin}`]?.priceChangePercent }}</p>
        </div> -->
    <div class="right">
      <div class="rightLeft">
        <div class="fw-num">
          {{ priceFormat(tradeStore.allCoinPriceInfo[collectItem.coin]?.close) }}
        </div>
      </div>
      <div class="rightBox">
        <div
          :class="[
            _isRFDByChangePercent(tradeStore.allCoinPriceInfo[collectItem.coin]?.priceChangePercent),
            'rfd-sign rfd-bg rightRight fw-num'
          ]"
        >
          <span>{{ _absChangePercentStr(tradeStore.allCoinPriceInfo[collectItem.coin]?.priceChangePercent) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { priceFormat } from '@/utils/decimal.js'
import { useTradeStore } from '@/store/trade'
import { _t18, _isRFDByChangePercent, _absChangePercentStr } from '@/utils/public'

const tradeStore = useTradeStore()
const props = defineProps({
  collectItem: {
    type: Object
  }
})

/** 与行情顶栏 PLAYING_SETTING 的 componentName 一致 */
const COMPONENT_NAME_I18N = {
  SecondContract: 'trade_tab6',
  BBTrading: 'trade_tab3',
  Ustandard: 'trade_tab5',
  Optional: 'quote_optional'
}

function resolveComponentName(item) {
  if (!item) return ''
  if (item.componentName) return item.componentName
  if (item.component_name) return item.component_name
  const key = item.coinKey
  if (typeof key === 'string' && key.includes('|')) {
    const part = key.split('|')[1]?.trim()
    if (part) return part
  }
  return ''
}

const playStyleLabel = computed(() => {
  const name = resolveComponentName(props.collectItem)
  const i18nKey = COMPONENT_NAME_I18N[name]
  return i18nKey ? _t18(i18nKey) : ''
})
</script>

<style lang="scss" scoped>
.collectItem {
  padding: 8px 15px;
  display: flex;
  justify-content: space-between;
  .left {
    display: flex;
    align-items: flex-start;
    min-width: 0;
    .leftImg {
      width: 25px;
      height: 25px;
      margin-right: 10px;
      margin-top: 2px;
      flex-shrink: 0;
    }
    .nameBlock {
      min-width: 0;
    }
    .play-style {
      margin-top: 4px;
      font-size: 11px;
      line-height: 1.2;
      color: var(--ex-font-color21);
    }
    .topText {
      display: flex;
      align-items: flex-end;
      font-size: 12px;
      color: var(--ex-font-color21);
      .textTop {
        color: var(--ex-font-color6);
        font-size: 14px;
      }
      .tip {
        margin-left: 5px;
        display: flex;
        align-items: center;
        padding: 5px;
        height: 15px;
        background: var(--ex-div-bgColor21);
        border-radius: 1px 1px 1px 1px;
        font-size: 12px;
        font-weight: 400;
        color: var(--ex-active-font-color) !important;
      }
    }
    .bottomText {
      margin-top: 4px;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: var(--ex-font-color21);
      .bottomTextNum {
        margin-left: 5px;
        color: var(--ex-font-color20s);
      }
    }
  }
  .right {
    display: flex;
    align-items: center;
    .rightLeft {
      text-align: right;
      font-size: 14px;
      color: var(--ex-font-color6);
      .numRight {
        font-size: 12px;
        margin-top: 4px;
        color: var(--ex-font-color20);
      }
    }
    .rightBox {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .rightRight {
        color: var(--ex-rfd-draw);
        background-color: var(--ex-rfd-draw-bg);
        max-width: 80px;
        min-width: 80px;
        height: 80%;
        margin-left: 20px;
        border-radius: 3px;
        padding: 12px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }
    }
  }
}
</style>
