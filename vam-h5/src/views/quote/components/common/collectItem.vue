<template>
  <div class="collectItem">
    <div class="left">
      <img v-if="collectItem.icon" :src="collectItem.icon" class="leftImg" alt="" />
      <div class="nameBlock">
        <div class="topText ff-num">
          <div class="textTop fw-num">
            {{ collectItem.coin?.toUpperCase() }}
          </div>
        </div>
        <div v-if="playStyleLabel" class="play-style">{{ playStyleLabel }}</div>
      </div>
    </div>
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
/* Figma GXPEX 行情列表卡 - 暗紫卡片 + 圆形币图 + 涨跌徽章 */
.collectItem {
  margin: 0 12px 12px;
  padding: 14px 16px;
  background: #221c31;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  .left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;

    .leftImg {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: contain;
      background: rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
    }

    .nameBlock {
      min-width: 0;
    }

    .topText {
      display: flex;
      align-items: flex-end;
      .textTop {
        color: #ffffff;
        font-family: 'Roboto', sans-serif;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.1;
      }
    }

    .play-style {
      margin-top: 4px;
      font-size: 11px;
      line-height: 1.2;
      color: rgba(255, 255, 255, 0.45);
    }
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;

    .rightLeft {
      color: #ffffff;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: 500;
      text-align: right;
      line-height: 1.1;
    }

    .rightBox {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .rightRight {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        min-width: 0;
        max-width: 100px;
        height: auto;
        margin-left: 0;
        padding: 3px 8px;
        border-radius: 6px;
        font-family: 'PingFang SC', -apple-system, sans-serif;
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
        background: rgba(125, 145, 157, 0.15);
        color: #7d919d;

        &::before {
          content: '';
          width: 8px;
          height: 10px;
          display: inline-block;
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
        }

        &.rise {
          background: rgba(46, 189, 133, 0.15);
          color: #2ebd85;
          &::before {
            background-image: url('@/assets/images/gxpex/home/arrow-up.png');
          }
        }
        &.fall {
          background: rgba(246, 70, 93, 0.15);
          color: #f6465d;
          &::before {
            background-image: url('@/assets/images/gxpex/home/arrow-down.png');
          }
        }
        &.draw {
          background: rgba(125, 145, 157, 0.15);
          color: #7d919d;
          &::before {
            display: none;
          }
        }
      }
    }
  }
}
</style>
