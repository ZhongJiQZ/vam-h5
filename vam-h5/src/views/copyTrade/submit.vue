<!-- 发起跟单 -->
<script setup>
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import { DIFF_ISFREEZE } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
import { _t18, _getConfig } from '@/utils/public'
import { submitCopyTrade, getCopyTradeStrategyDetail, getCopyTradeDocuments } from '@/api/copyTrade'
import { priceFormat } from '@/utils/decimal'
import { symbolPair, formatProfitShareRate } from './utils'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useToast } from '@/hook/useToast'
import { computed, reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)

const { _isFreeze } = useFreeze()
const { _toast } = useToast()
const route = useRoute()
const router = useRouter()
const strategy = reactive(
  route.query.data ? JSON.parse(decodeURI(route.query.data)) : { id: route.query.strategyId }
)

const userStore = useUserStore()
const { asset } = storeToRefs(userStore)
const amount = ref('')
const secretKey = ref('')
const pageLoading = ref(!!route.query.strategyId)
const agreementDoc = ref(null)
const riskDoc = ref(null)

const needSecretKey = computed(() => {
  if (strategy.subscribed) return false
  return strategy.secretKeyRequired !== false
})

const displayBalance = computed(() => {
  if (strategy.contractBalance != null && strategy.contractBalance !== '') {
    return strategy.contractBalance
  }
  return contractBalance.value
})

const contractBalance = computed(() => {
  const cur = asset.value?.filter((item) => item.type === 3) || []
  return cur[0]?.availableAmount ?? 0
})

function setMax() {
  const max = Math.min(Number(displayBalance.value) || 0, Number(strategy.maxAmount) || Infinity)
  amount.value = max > 0 ? String(max) : ''
}

async function loadStrategyDetail() {
  const strategyId = route.query.strategyId || strategy.id
  if (!strategyId) return
  pageLoading.value = true
  try {
    const res = await getCopyTradeStrategyDetail({ strategyId })
    if (res?.code == 200 && res.data) {
      Object.assign(strategy, res.data, { id: res.data.id || strategyId })
    }
    const institutionId = route.query.institutionId || strategy.institutionId
    if (institutionId) {
      const [agreementRes, riskRes] = await Promise.all([
        getCopyTradeDocuments({ type: 'agreement', institutionId }),
        getCopyTradeDocuments({ type: 'risk', institutionId })
      ])
      if (agreementRes?.code == 200) agreementDoc.value = agreementRes.data
      if (riskRes?.code == 200) riskDoc.value = riskRes.data
    }
  } finally {
    pageLoading.value = false
  }
}

function showDocument(doc) {
  if (!doc?.content) return
  showDialog({
    title: doc.title || '',
    message: doc.content,
    confirmButtonColor: '#17ac74'
  })
}

onMounted(() => {
  if (route.query.strategyId) loadStrategyDetail()
})

async function submitForm() {
  if (strategy?.canJoin === false) {
    showToast(strategy.followStatusText || t18('copy_trade_unjoinable'))
    return
  }
  const val = Number(amount.value)
  if (!val || val < strategy.minAmount || val > strategy.maxAmount) {
    _toast('copy_trade_amount_error')
    return
  }
  if (val > Number(displayBalance.value)) {
    showToast(t18('copy_trade_insufficient_balance'))
    return
  }
  if (needSecretKey.value && !String(secretKey.value || '').trim()) {
    showToast(t18('copy_trade_inst_secret_required'))
    return
  }
  const payload = { strategyId: strategy.id, amount: val }
  if (needSecretKey.value) payload.secretKey = secretKey.value.trim()
  const res = await submitCopyTrade(payload)
  if (res.code == 200) {
    showToast(res.msg || t18('copy_trade_submit_success'))
    setTimeout(() => router.replace('/copy-trade/my'), 500)
  } else {
    showToast(res.msg)
  }
}

function submit() {
  if (DIFF_ISFREEZE.includes(_getConfig('_APP_ENV'))) {
    if (_isFreeze(DIFF_ISFREEZE)) submitForm()
  } else {
    submitForm()
  }
}
</script>

<template>
  <div class="copy-submit-page">
    <DarkHeaderBar :title="_t18('copy_trade_submit_title')" :border_bottom="true" />
    <van-loading v-if="pageLoading" class="page-loading" />
    <div v-else class="sheet">
      <section class="card strategy-brief">
        <p class="strategy-name">{{ strategy.strategyName }}</p>
        <p class="strategy-meta">
          {{ symbolPair(strategy.symbol) }} · {{ strategy.profitRate }}%/{{ strategy.cycleHours }}h
        </p>
        <p class="strategy-meta strategy-meta--window">
          {{ _t18('copy_trade_join_window') }}:
          {{ strategy.joinStartTime || _t18('copy_trade_no_limit') }}
          ~
          {{ strategy.joinEndTime || _t18('copy_trade_no_limit') }}
        </p>
        <p class="strategy-meta strategy-meta--window">
          {{ _t18('copy_trade_profit_share_rate') }}:
          {{ formatProfitShareRate(strategy.profitShareRate, t18('copy_trade_profit_share_rate_none')) }}
          ({{ _t18('copy_trade_profit_share_rate_desc') }})
        </p>
        <p v-if="strategy.tradeFeeRate != null" class="strategy-meta strategy-meta--window">
          {{ _t18('copy_trade_trade_fee') }}: {{ strategy.tradeFeeRate }}%
        </p>
        <p v-if="strategy.followStatusText" class="strategy-status">{{ strategy.followStatusText }}</p>
      </section>

      <section v-if="needSecretKey" class="card">
        <p class="amount-head">{{ _t18('copy_trade_inst_secret_placeholder') }}</p>
        <input v-model="secretKey" type="text" class="ipt ff-num secret-ipt" :placeholder="_t18('copy_trade_inst_secret_placeholder')" />
      </section>

      <section class="card">
        <div class="amount-head">
          <span>{{ _t18('copy_trade_amount') }} (USDT)</span>
          <span class="link" @click="router.push('/recharge')">{{ _t18('pledge_deposit_funds') }}</span>
        </div>
        <div class="ipt-row">
          <input
            v-model="amount"
            type="number"
            class="ipt ff-num"
            :placeholder="`${strategy.minAmount}~${strategy.maxAmount}`"
          />
          <span class="max-btn" @click="setMax">{{ _t18('pledge_maximum') }}</span>
        </div>
        <div class="balance-row">
          <span>{{ _t18('copy_trade_contract_balance') }}</span>
          <span class="ff-num">{{ priceFormat(displayBalance) }} USDT</span>
        </div>
      </section>

      <div v-if="agreementDoc || riskDoc" class="doc-links">
        <span v-if="agreementDoc" class="link" @click="showDocument(agreementDoc)">{{ _t18('copy_trade_agreement') }}</span>
        <span v-if="riskDoc" class="link" @click="showDocument(riskDoc)">{{ _t18('copy_trade_risk') }}</span>
      </div>

      <p class="tip">{{ _t18('copy_trade_submit_tip') }}</p>

      <button type="button" class="submit-btn" @click="submit">{{ _t18('btnConfirm') }}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$green: #17ac74;

.copy-submit-page {
  min-height: 100vh;
  background: #f6f7fa;
}
.sheet {
  padding: 12px 15px 32px;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}
.strategy-name {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 6px;
}
.strategy-meta {
  font-size: 13px;
  color: #888;
  margin: 0;
}
.strategy-meta--window {
  margin-top: 6px;
  word-break: break-all;
}
.strategy-status {
  margin: 8px 0 0;
  font-size: 12px;
  color: #666;
}
.amount-head {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 12px;
  .link {
    color: $green;
    font-size: 13px;
  }
}
.ipt-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  .ipt {
    flex: 1;
    border: none;
    font-size: 22px;
    outline: none;
  }
  .max-btn {
    color: $green;
    font-size: 14px;
    padding-left: 8px;
  }
}
.balance-row {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  font-size: 13px;
  color: #666;
}
.tip {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
  margin: 0 0 24px;
  padding: 0 4px;
}
.page-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
.secret-ipt {
  width: 100%;
  border: none;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  padding: 8px 0;
  outline: none;
}
.doc-links {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding: 0 4px;
  .link {
    color: $green;
    font-size: 13px;
  }
}
.submit-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: $green;
  color: #fff;
  font-size: 16px;
}
</style>
