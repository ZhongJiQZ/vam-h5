<!-- 合约历史 -->
<template>
  <div class="historyItem" :class="{ 'historyItem--orderCenter': orderCenterStyle }">
    <!-- tag看涨/看跌 -->
    <div class="header">
      <div
        class="direction-badge"
        :class="Number(itemHistroy.betContent) ? 'direction-badge--up' : 'direction-badge--down'"
      >
        <span class="direction-badge__text">{{
          Number(itemHistroy.betContent)
            ? _t18(`exchange_bullish`, ['bitmake'])
            : _t18(`exchange_bearish`, ['bitmake'])
        }}</span>
        <img
          class="direction-badge__icon"
          :src="Number(itemHistroy.betContent) ? imgTradeUp : imgTradeDown"
          alt=""
        />
      </div>
      <div class="header-time fw-num">
        {{ _timeFormat(itemHistroy.params?.createTime, 'DD/MM/YYYY HH:mm', true) }}
      </div>
    </div>
    <div class="list">
      <div class="item item--pair">
        <div>
          {{
            itemHistroy.showCoin
              ? itemHistroy.showCoin
              : itemHistroy.coinSymbol.toUpperCase() + '/' + itemHistroy.baseSymbol.toUpperCase()
          }}
        </div>
        <div class="fw-num numItem">{{ itemHistroy.openPrice }}</div>
      </div>
      <!-- 数量 -->
      <div class="item">
        <div>{{ _t18(`metastaking_bb_count`) }}</div>
        <div class="fw-num numItem">{{ itemHistroy.betAmount }}</div>
      </div>
      <!-- 当前价 -->
      <div class="item" v-if="!currentEntruset">
        <div>{{ _t18(`option_now_price`) }}</div>
        <div class="fw-num numItem">
          {{ tradeStore.allCoinPriceInfo[itemHistroy.coinSymbol].close }}
          {{ itemHistroy.baseSymbol ? itemHistroy.baseSymbol.toUpperCase() : '' }}
        </div>
      </div>

      <!-- 时间 -->
      <div class="item">
        <div>{{ _t18(`k_time`) }}</div>
        <div class="fw-num numItem">{{ itemHistroy.type }}s</div>
      </div>

      <!-- 收盘时间 -->
      <div class="item" v-if="currentEntruset">
        <div>{{ _t18(`exchange.finashTime`) }}</div>
        <div class="fw-num numItem">
          <!-- {{ _timeFormat(itemHistroy.params?.closeTime, 'DD/MM/YYYY HH:mm:ss', true) }} -->
          {{ _timeFormat(itemHistroy.closeTime, 'DD/MM/YYYY HH:mm:ss', true) }}
        </div>
      </div>

      <!-- 收盘价 -->
      <div class="item" v-if="currentEntruset">
        <div>{{ _t18(`exchange.close`) }}</div>
        <div class="fw-num numItem">
          {{ itemHistroy.closePrice }}
          {{ itemHistroy.baseSymbol ? itemHistroy.baseSymbol.toUpperCase() : '' }}
        </div>
      </div>

      <!-- 盈亏 -->
      <!-- currentEntruset 0 当前  1 历史 -->
      <div class="item">
        <div>{{ _t18(`option_profit_loss_1`) }}</div>
        <!-- currentEntruset 0 当前  1 历史 -->
        <div
          v-if="currentEntruset"
          class="fw-num numItem"
          :class="profitAndlossColor(itemHistroy.betAmount, itemHistroy.rewardAmount)"
        >
          {{ profitAndloss(itemHistroy.betAmount, itemHistroy.rewardAmount) }}
          {{ itemHistroy.baseSymbol ? itemHistroy.baseSymbol.toUpperCase() : '' }}
        </div>
        <div
          v-if="!currentEntruset"
          class="fw-num numItem"
          :class="
            formatExpectedProfitColor(
              Number(itemHistroy.betContent),
              itemHistroy.openPrice,
              tradeStore.allCoinPriceInfo[itemHistroy.coinSymbol].close
            )
          "
        >
          {{
            formatExpectedProfit(
              Number(itemHistroy.betContent),
              itemHistroy.openPrice,
              tradeStore.allCoinPriceInfo[itemHistroy.coinSymbol].close,
              itemHistroy.betAmount,
              itemHistroy.rate
            )
          }}
          {{ itemHistroy.baseSymbol ? itemHistroy.baseSymbol.toUpperCase() : '' }}
        </div>
      </div>

      <!-- 倒计时 -->
      <div class="item" v-if="!currentEntruset">
        <div>{{ _t18(`option_countdown`) }}</div>
        <div class="fw-num numItem">
          {{ formatTime(countdown) }}
        </div>
      </div>

      <!-- 分享 -->
      <div class="item" v-if="currentEntruset && HISTORY_SNIPASTE.includes(_getConfig('_APP_ENV'))">
        <div></div>
        <div class="fw-num numItem">
          <p class="share-button" @click="sharedImg(itemHistroy)">{{ _t18(`trade_share`) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HISTORY_SNIPASTE } from '@/config/index'
import { _toFixed } from '@/utils/decimal'
import { formatTime } from '@/utils/filters'
import { _timeFormat } from '@/utils/public'
import { watchEffect, onMounted } from 'vue'
import { useTradeStore } from '@/store/trade/index'

import {
  formatExpectedProfit,
  formatExpectedProfitColor,
  profitAndloss,
  profitAndlossColor
} from '@/utils/filters'
import { _t18 } from '@/utils/public'

import imgTradeUp from '@/assets/images/trade/up.png'
import imgTradeDown from '@/assets/images/trade/down.png'

const tradeStore = useTradeStore()
const countdown = ref(-1)
const props = defineProps({
  itemHistroy: {
    type: Object,
    default: {}
  },
  currentEntruset: {
    type: Number,
    default: () => {
      return 0
    }
  },
  /** 订单中心：白卡片 + 列表灰底 */
  orderCenterStyle: {
    type: Boolean,
    default: false
  }
})
const flag = ref(false)
const isUpdate = ref(false)
onMounted(() => {
  countdown.value = props.itemHistroy.time ? props.itemHistroy.time : 0
  flag.value = true
})
const emit = defineEmits(['recombine', 'updateRecord'])
watchEffect(() => {
  if (countdown.value >= 0) {
    isUpdate.value = true
    setTimeout(() => {
      countdown.value--
    }, 1000)
  } else {
    if (!props.currentEntruset && countdown.value !== 0 && flag.value) {
      emit('recombine', props.itemHistroy, countdown.value)
      if (isUpdate.value) {
        isUpdate.value = false
        emit('updateRecord')
      }
    }
  }
})

// 分享
const sharedImg = (model) => {
  console.log(model)
  emit('shareRevenue', model)
}
</script>
<style lang="scss" scoped>
.share-button {
  color: var(--ex-active-font-color);
  border: 1px solid var(--ex-active-font-color);
  border-radius: 3px;
  padding: 5px 10px;
}

.hightUp {
  color: var(--ex-font-color2) !important;
}

.hightDown {
  color: var(--ex-font-color10) !important;
}

.historyItem--orderCenter {
  padding: 14px 15px 4px;
  margin-bottom: 10px;
  border-bottom: none;
  background: #f5f6fa;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(5, 16, 26, 0.06);

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;

    .direction-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      color: #fff;

      &--up {
        background: #008710;
      }

      &--down {
        background: #e85d75;
      }
    }

    .direction-badge__icon {
      width: 14px;
      height: 14px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .header-time {
      color: #333;
      font-size: 12px;
    }
  }

  .list .item {
    padding-bottom: 12px;
    font-size: 12px;
    color: #999;

    &.item--pair > div:first-child {
      color: #333;
      font-weight: 500;
    }

    .numItem {
      color: #333;
      font-weight: 500;
    }
  }

  .hightUp {
    color: #008710 !important;
  }

  .hightDown {
    color: #e85d75 !important;
  }

  .share-button {
    color: #008710;
    border-color: #008710;
  }
}

.historyItem {
  padding: 20px 15px 0;
  border-bottom: 1px solid var(--ex-border-color);

  .colorBlue {
    color: var(--ex-font-color2) !important;
  }

  .header {
    padding-bottom: 20px;
    font-size: 14px;
    color: var(--ex-default-font-color);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .direction-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      font-size: 12px;
      border-radius: 4px;
      color: #fff;

      &--up {
        background: var(--ex-div-bgColor1);
      }

      &--down {
        background: var(--ex-div-bgColor16);
      }
    }

    .direction-badge__icon {
      width: 14px;
      height: 14px;
      object-fit: contain;
    }
  }

  .list {
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: var(--ex-passive-font-color);
      padding-bottom: 20px;

      .numItem {
        color: var(--ex-default-font-color);
      }
    }
  }
}
</style>
