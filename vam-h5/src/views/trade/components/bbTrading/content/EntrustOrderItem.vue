<!-- 当前委托订单 -->
<script setup>
import { formatLocalTime } from "@/utils/time";
import { cancelOrderCurrencyApi } from '@/api/trade/index'
import { showToast } from 'vant'
import { useToast } from '@/hook/useToast'
const { _toast } = useToast()
import { _t18 } from '@/utils/public'
import { useTradeStore } from '@/store/trade'
import { _add, _sub, _mul, _div, _toFixed, priceFormat } from '@/utils/decimal'
import { computed } from 'vue'
const tradeStore = useTradeStore()
const newPrice = computed(() => {
  return tradeStore.allCoinPriceInfo[props.data.symbol]?.close
})
const formatLocal = (t)=>{
      return formatLocalTime(t); // 默认 YYYY-MM-DD HH:mm:ss
}
const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  },
  coinInfo: {
    type: Object,
    default: () => {}
  }
})
/**
 * 取消订单
 */
const hide = ref(false)
const showChe = ref(true)
const emit = defineEmits(['reduceOrderNum'])
// 撤单
const cancelOrder = async () => {
  const res = await cancelOrderCurrencyApi(props.data.id)
  if (res.code == 200) {
    showToast(res.msg)
    showChe.value = false
    hide.value = true
    emit('reduceOrderNum')
  } else {
    showToast(res.msg)
  }
}
</script>
<template>
  <div class="hisToryList" v-if="!hide">
    <div class="header">
      <div class="headerLeft">
        <!-- 买 -->
        <div class="name" v-if="data.type == 0">{{ _t18(`buy`) }}</div>
        <!-- 卖 -->
        <div class="name name2" v-if="data.type == 1">{{ _t18(`sell`) }}</div>
        <div class="pair-name fw-bold">
          {{
            data.showCoin
              ? data.showCoin
              : data.symbol?.toUpperCase() + '/' + data.coin?.toUpperCase()
          }}
        </div>
      </div>
      <!-- 撤单 -->
      <div v-if="showChe && data.status == 0" class="headerRight" @click="cancelOrder">
        {{ _t18(`bb_Cancellation`) }}
      </div>
    </div>
    <div class="list">
      <!-- 时间 -->
      <div class="item">
        <div>{{ _t18(`k_time`) }}</div>
        <div class="fw-num numItem" v-if="data.delegateTime">
          {{ formatLocal(data.params?.delegateTime) }}
        </div>
      </div>
      <!-- 委托价 -->
      <div class="item">
        <div>{{ _t18(`bb_order_price`) }}</div>
        <div class="fw-num numItem">{{ data.delegatePrice || 0 }}</div>
      </div>
      <!-- 委托量 -->
      <div class="item" v-if="!['rxce'].includes(_getConfig('_APP_ENV'))">
        <div>{{ _t18(`bb_order_quantity`) }}</div>
        <div class="fw-num numItem">{{ data.delegateTotal || 0 }} {{ data.symbol.toUpperCase() }}</div>
      </div>
      
      <!-- 成交单价 ,rxce:最新价 -->
        <div class="item" v-if="['rxce'].includes(_getConfig('_APP_ENV')) && data.type === 0">
        <div>{{ _t18(`bb_avg_fill_price`) }}</div>
        <div class="fw-num numItem">{{ newPrice || 0 }}</div>
      </div>
      <div class="item" v-else>
        <div>{{ _t18(`bb_avg_fill_price`) }}</div>
        <div class="fw-num numItem">{{ data.dealPrice || 0 }}</div>
      </div>

      <!-- 成交数量 -->
      <div class="item">
        <div>{{ _t18(`bb_filled_quantity`) }}</div>
        <div class="fw-num numItem">{{ data.dealNum || 0 }} {{ data.symbol.toUpperCase() }}</div>
      </div>

        <!--成交总量-->
        <div class="item">
        <div>{{ _t18(`bb_total_amount`) }}</div>
        <div class="fw-num numItem">{{ data.dealValue || 0 }} {{ data.coin.toUpperCase() }}</div>
      </div>

    
     
      <!--手续费-->
      <div class="item">
        <div>{{ _t18(`bb_trading_fee`) }}</div>
        <div class="fw-num numItem">{{ data.status == 3 ? 0 : data.fee || 0 }} {{ data.symbol.toUpperCase() }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.colorBlue {
  color: var(--ex-font-color9) !important;
}
.hisToryList {
  padding: 14px 15px 4px;
  margin-bottom: 10px;
  background: #f5f6fa;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(5, 16, 26, 0.06);

  .header {
    padding-bottom: 12px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .headerLeft {
      display: flex;
      align-items: center;
      min-width: 0;

      .name {
        flex-shrink: 0;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 6px;
        margin-right: 10px;
        color: #fff !important;
        background: #008710;
      }

      .name2 {
        background: #e85d75 !important;
      }

      .pair-name {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
    }

    .headerRight {
      flex-shrink: 0;
      padding: 4px 8px;
      background: #fff;
      border-radius: 4px;
      border: 1px solid var(--ex-border-color4);
      font-size: 12px;
      color: var(--ex-font-color9);
    }
  }

  .list {
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #999;
      padding-bottom: 12px;

      .numItem {
        color: #333;
        font-weight: 500;
      }

      .numItemRed {
        color: var(--ex-font-color15);
      }
    }
  }
}
</style>
