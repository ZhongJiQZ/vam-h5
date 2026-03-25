<template>
  <div class="order-card">
    <div class="title">
      <div class="left">
        <img :src="pledgeCoinIcon" alt="" class="pledge-coin-icon" />
        <div class="txt">
          {{ dataValue.planTitle }}
        </div>
      </div>
    </div>
    <div class="message">
      <!-- 投资金额 -->
      <div>
        <p class="left">{{ _t18('pledge_investment_amount') }}</p>
        <p class="right fontBold ff-num">{{ priceFormat(dataValue.amount) }}</p>
      </div>
      <!-- 状态 -->
      <div>
        <p class="left">{{ _t18('recharge_status') }}</p>
        <p class="right status0" v-if="status == 0">{{ _t18('pledge_in_progress') }}</p>
        <p class="right status1" v-if="status == 1">{{ _t18('pledge_completed') }}</p>
        <p class="right status2" v-if="status == 2">{{ _t18('pledge_redeem_ok') }}</p>
      </div>
      <!-- 日收益率 -->
      <div>
        <p class="left">{{ _t18('host_dailyrateof_return') }}</p>
        <p class="right fontBold ff-num">{{ dataValue.minOdds }}%~{{ dataValue.maxOdds }}%</p>
      </div>
      <!-- 周期 -->
      <div>
        <p class="left">{{ _t18('pledge_cycle') }}</p>
        <p class="right fontBold ff-num">{{ dataValue.days }}({{ _t18('pledge_day') }})</p>
      </div>
      <!--PNL-->
      <div>
        <p class="left">{{ _t18('assets.PNL') }}</p>
        <p class="right fontBold ff-num">{{ dataValue.accumulaEarn }}(USDT)</p>
      </div>
      <!-- 开始日期 -->
      <div>
        <p class="left">{{ _t18('pledge_start_date') }}</p>
        <p class="right ff-num">{{ formatLocalTime(dataValue.params?.createTime) }}</p>
      </div>
      <!-- 结束日期 -->
      <div>
        <p class="left">{{ _t18('pledge_end_date') }}</p>
        <p class="right ff-num">{{ formatLocalTime(dataValue.params?.endTime) }}</p>
      </div>
      <!-- 赎回 -->
      <div v-if="status == 0 && !DIFF_HIDE_REDEEM.includes(_getConfig('_APP_ENV'))">
        <div class="btn" @click="submit">{{ _t18('host.redeem', ['aams']) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatLocalTime } from "@/utils/time";
import { DIFF_HIDE_REDEEM } from '@/config/index'
import { priceFormat } from '@/utils/decimal.js'
import { redemption, redempNewtion } from '@/api/pledge/index'
import { _t18 } from '@/utils/public'
import pledgeCoinIcon from '@/assets/images/Frame 981370.png'
import { useToast } from '@/hook/useToast'
import { showToast } from 'vant'
const { _toast } = useToast()
const props = defineProps({
  data: {
    type: Object,
    default: {}
  }
})
const emit = defineEmits(['getList'])
const dataValue = computed(() => {
  return props.data
})
const status = computed(() => {
  return props.data.status
})
const submit = () => {
  let params = { id: props.data.id }
  console.log(params)
  if (['trustwallet'].includes(__config._APP_ENV)) {
    redempNewtion(params).then((res) => {
      if (res.code == '200') {
        status.value = 2
        _toast('transfer_success')
        setTimeout(() => {
          emit('getList')
        }, 500)
      } else {
        showToast(res.msg)
      }
    })
  } else {
    redemption(params).then((res) => {
      if (res.code == '200') {
        status.value = 2
        _toast('transfer_success')
        setTimeout(() => {
          emit('getList')
        }, 500)
      } else {
        showToast(res.msg)
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.order-card {
  font-size: 14px;
  color: #1a1a1a;
  background: #f5f6fa;
  border-radius: 12px;
  padding: 18px 16px 16px;
  box-sizing: border-box;
}

.title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  .left {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    .pledge-coin-icon {
      width: 26px;
      height: 26px;
      object-fit: contain;
      margin-right: 10px;
      flex-shrink: 0;
    }
  }
}

.message {
  & > div {
    padding: 14px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left {
      color: #888888;
    }
    .right {
      color: #1a1a1a;
    }
    .fontBold {
      font-weight: 600;
    }
    .status0 {
      color: #2b7fff;
    }
    .status1 {
      color: #17ac74;
    }
    .status2 {
      color: #1a1a1a;
    }
  }
}

.btn {
  width: 100%;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #05101a;
  color: #fff;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
}
</style>
