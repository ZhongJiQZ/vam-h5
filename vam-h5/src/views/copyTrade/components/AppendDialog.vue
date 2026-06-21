<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :overlay-style="{ background: 'rgba(0,0,0,0.5)' }"
    @update:show="emit('update:show', $event)"
    @open="onOpen"
  >
    <div class="dialog-body">
      <h3 class="dialog-title">{{ _t18('copy_trade_append_title') }}</h3>
      <p v-if="item.strategyName" class="dialog-name">{{ item.strategyName }}</p>
      <p class="dialog-desc">{{ _t18('copy_trade_append_tip') }}</p>

      <div class="amount-head">
        <span>{{ _t18('copy_trade_append_amount') }} (USDT)</span>
        <span class="max-btn" @click="setMax">{{ _t18('pledge_maximum') }}</span>
      </div>
      <input
        v-model="amount"
        type="number"
        class="amount-input ff-num"
        :placeholder="_t18('copy_trade_append_amount_placeholder')"
      />
      <div class="balance-row">
        <span>{{ _t18('copy_trade_contract_balance') }}</span>
        <span class="ff-num">{{ priceFormat(contractBalance) }} USDT</span>
      </div>

      <div class="dialog-actions">
        <button type="button" class="btn-cancel" @click="emit('update:show', false)">
          {{ _t18('cancel') }}
        </button>
        <button type="button" class="btn-confirm" :disabled="loading" @click="handleConfirm">
          {{ _t18('copy_trade_append') }}
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { _t18 } from '@/utils/public'
import { priceFormat } from '@/utils/decimal'
import { normalizeCopyTradeAmount, resolveCopyTradeFillAmount } from '../utils'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'

const props = defineProps({
  show: { type: Boolean, default: false },
  item: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'confirm'])

const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)
const userStore = useUserStore()
const { asset } = storeToRefs(userStore)
const amount = ref('')

const contractBalance = computed(() => {
  const cur = asset.value?.filter((item) => item.type === 3) || []
  return cur[0]?.availableAmount ?? 0
})

function onOpen() {
  amount.value = ''
  userStore.getUserInfo()
}

function setMax() {
  amount.value = resolveCopyTradeFillAmount(contractBalance.value)
}

function handleConfirm() {
  const val = normalizeCopyTradeAmount(amount.value)
  if (!val) {
    showToast(t18('copy_trade_append_amount_error'))
    return
  }
  const balanceCap = normalizeCopyTradeAmount(contractBalance.value)
  if (balanceCap != null && val > balanceCap) {
    showToast(t18('copy_trade_insufficient_balance'))
    return
  }
  emit('confirm', val)
}
</script>

<style lang="scss" scoped>
$green: #17ac74;

.dialog-body {
  padding: 24px 20px calc(24px + env(safe-area-inset-bottom, 0));
}
.dialog-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  text-align: center;
}
.dialog-name {
  text-align: center;
  font-size: 14px;
  color: #333;
  margin: 0 0 6px;
}
.dialog-desc {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
  margin: 0 0 20px;
  text-align: center;
}
.amount-head {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 10px;
  .max-btn {
    color: $green;
    font-size: 13px;
  }
}
.amount-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid #eee;
  font-size: 24px;
  padding: 8px 0;
  outline: none;
  box-sizing: border-box;
}
.balance-row {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  font-size: 13px;
  color: #666;
}
.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 48px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  border: none;
}
.btn-cancel {
  background: #fff;
  border: 1px solid #ddd;
  color: #333;
}
.btn-confirm {
  background: $green;
  color: #fff;
  &:disabled { opacity: 0.6; }
}
</style>
