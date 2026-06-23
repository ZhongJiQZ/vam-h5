<template>
  <article class="order-card">
    <div class="title">
      <div class="left">
        <img :src="pledgeCoinIcon" alt="" class="pledge-coin-icon" />
        <div class="txt">
          {{ dataValue.planTitle }}
        </div>
      </div>
    </div>
    <div class="message">
      <div>
        <p class="left">{{ _t18('pledge_investment_amount') }}</p>
        <p class="right fontBold ff-num">{{ priceFormat(dataValue.amount) }}</p>
      </div>
      <div>
        <p class="left">{{ _t18('recharge_status') }}</p>
        <p class="right status0" v-if="status == 0">{{ _t18('pledge_in_progress') }}</p>
        <p class="right status1" v-if="status == 1">{{ _t18('pledge_completed') }}</p>
        <p class="right status2" v-if="status == 2">{{ _t18('pledge_redeem_ok') }}</p>
      </div>
      <div>
        <p class="left">{{ _t18('host_dailyrateof_return') }}</p>
        <p class="right fontBold ff-num">{{ dataValue.minOdds }}%~{{ dataValue.maxOdds }}%</p>
      </div>
      <div>
        <p class="left">{{ _t18('pledge_cycle') }}</p>
        <p class="right fontBold ff-num">{{ dataValue.days }}({{ _t18('pledge_day') }})</p>
      </div>
      <div>
        <p class="left">{{ _t18('assets.PNL') }}</p>
        <p class="right fontBold ff-num">{{ dataValue.accumulaEarn }}(USDT)</p>
      </div>
      <div>
        <p class="left">{{ _t18('pledge_start_date') }}</p>
        <p class="right ff-num">{{ formatLocalTime(dataValue.params?.createTime) }}</p>
      </div>
      <div>
        <p class="left">{{ _t18('pledge_end_date') }}</p>
        <p class="right ff-num">{{ formatLocalTime(dataValue.params?.endTime) }}</p>
      </div>
      <div v-if="status == 0 && !DIFF_HIDE_REDEEM.includes(_getConfig('_APP_ENV'))">
        <button type="button" class="btn" @click="submit">{{ _t18('host.redeem', ['aams']) }}</button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { formatLocalTime } from '@/utils/time'
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
    default: () => ({})
  }
})
const emit = defineEmits(['getList'])
const dataValue = computed(() => props.data)
const status = computed(() => props.data.status)

const submit = () => {
  const params = { id: props.data.id }
  const onSuccess = (res) => {
    if (res.code == '200') {
      _toast('transfer_success')
      setTimeout(() => {
        emit('getList')
      }, 500)
    } else {
      showToast(res.msg)
    }
  }
  if (['trustwallet'].includes(__config._APP_ENV)) {
    redempNewtion(params).then(onSuccess)
  } else {
    redemption(params).then(onSuccess)
  }
}
</script>

<style lang="scss" scoped>
.order-card {
  font-size: 14px;
  color: #f5f3f8;
  background: rgb(34, 28, 49);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 18px 16px 16px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .left {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #fff;

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
    padding: 12px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .left {
      color: rgba(255, 255, 255, 0.55);
      flex-shrink: 0;
    }

    .right {
      color: #fff;
      text-align: right;
      word-break: break-all;
    }

    .fontBold {
      font-weight: 600;
    }

    .status0 {
      color: rgb(196, 124, 255);
    }

    .status1 {
      color: #31c48d;
    }

    .status2 {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

.btn {
  width: 100%;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.32);
  color: #fff;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>
