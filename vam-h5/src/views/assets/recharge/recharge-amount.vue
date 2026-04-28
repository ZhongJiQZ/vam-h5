<template>
  <div class="page-recharge-amount">
    <DarkHeaderBar :title="currentName" :border_bottom="true" />
    <div class="page-body">
      <div class="card">
        <div class="coin-row">
          <svg-load :name="coinIcon" class="coin-icon" />
          <div class="coin-meta">
            <p class="coin-type">{{ route.query.type }}</p>
            <p class="coin-sub">{{ _t18('recharge', ['latcoin']) }}</p>
          </div>
        </div>
        <div class="field">
          <p class="label">
            {{ _t18('recharge_number', ['bitmake']) }}
            <span v-if="showFiatMode" class="rate-pill">1={{ _numberWithCommas(fiatRateNum) }}</span>
          </p>
          <div class="input-box" :class="{ 'input-box--suffix': showFiatMode }">
            <input
              v-model="amount"
              type="number"
              class="ff-num"
              :placeholder="_t18('recharge_input')"
            />
            <span v-if="showFiatMode" class="currency-suffix">{{ fiatCurrency }}</span>
          </div>
          <p v-if="showFiatMode && convertedUsdt" class="approx-line">
            {{ _t18('recharge_amount_usdt') }}: {{ convertedUsdt }}
          </p>
          <p v-if="showFiatMode && convertedUsdt" class="approx-line approx-line--net">
            {{ _t18('Actual_amount_received') }}: {{ netUsdt }}
          </p>
        </div>
        <div class="tips-card">
          <div v-if="showFiatMode && hasLimitRange" class="tips-row">
            <span class="tips-label">
              <i class="tips-dot"></i>
              {{ _t18('recharge_limit_range') }}
            </span>
            <span class="tips-value tips-value--stack">
              <span class="tips-limit-line">
                <span class="tips-chip">MIN</span>
                <span>{{ limitMinDisplay }}</span>
              </span>
              <span class="tips-limit-line">
                <span class="tips-chip">MAX</span>
                <span>{{ limitMaxDisplay }}</span>
              </span>
            </span>
          </div>
          <div v-if="showFiatMode" class="tips-row">
            <span class="tips-label">
              <i class="tips-dot tips-dot--warn"></i>
              {{ _t18('withdraw_commission') }}
            </span>
            <span class="tips-value tips-value--warn">{{ feeRatioNum }}%</span>
          </div>
          <p class="tips-desc">{{ _t18('recharge_amount_confirm_hint') }}</p>
        </div>
      </div>
      <div class="btn-wrap">
        <div class="btn btn--primary" @click="onNext">
          <p>{{ _t18('recharge_require', ['bitmake']) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { rechargeSubmit, getRechargeList } from '@/api/account.js'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import { useMainStore } from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { _t18, filterCoin2, _numberWithCommas } from '@/utils/public'
import { useToast } from '@/hook/useToast'
import { computed, ref, watch } from 'vue'
import { priceFormat } from '@/utils/decimal'
import { normalizeRechargeAddressFromApi } from '@/utils/rechargeAddress'

const route = useRoute()
const router = useRouter()
const mainStore = useMainStore()
const { _toast } = useToast()

const amount = ref('')
const currentName = `${_t18('recharge', ['latcoin'])} ${route.query.type || ''}`
const coinIcon = computed(() => filterCoin2(String(route.query.coin || '')))

const rechargeObj = computed(() =>
  mainStore.getRechargeList.find((elem) => elem.coinName == route.query.type)
)
const isBankRecharge = computed(() =>
  Boolean(rechargeObj.value?.bankCardNo && rechargeObj.value?.bankName)
)
const isBankType = computed(() => String(route.query.type || '').toUpperCase() === 'BANK')
const isVirtualType = computed(() => !isBankType.value)
const fiatRateNum = computed(() => {
  const n = Number(rechargeObj.value?.fiatPerUsdt)
  return Number.isFinite(n) && n > 0 ? n : null
})
const fiatCurrency = computed(() =>
  String(rechargeObj.value?.fiatCurrency || 'Rp').toUpperCase()
)
const showFiatMode = computed(() => isBankType.value && fiatRateNum.value != null)
const feeRatioNum = computed(() => {
  const n = Number(rechargeObj.value?.rechargeFeeRatio)
  return Number.isFinite(n) && n > 0 ? n : 0
})
const convertedUsdt = computed(() => {
  if (!showFiatMode.value) return ''
  const fiat = Number(amount.value)
  if (!Number.isFinite(fiat) || fiat <= 0) return ''
  const usdt = fiat / fiatRateNum.value
  return `${priceFormat(usdt)} USDT`
})
const netUsdt = computed(() => {
  if (!showFiatMode.value) return ''
  const fiat = Number(amount.value)
  if (!Number.isFinite(fiat) || fiat <= 0) return ''
  const usdt = fiat / fiatRateNum.value
  const net = usdt * (1 - feeRatioNum.value / 100)
  return `${priceFormat(Math.max(net, 0))} USDT`
})
const hasLimitRange = computed(() => {
  if (!showFiatMode.value) return ''
  const min = Number(rechargeObj.value?.rechargeMin)
  const max = Number(rechargeObj.value?.rechargeMax)
  return Number.isFinite(min) && Number.isFinite(max)
})
const limitMinDisplay = computed(() => {
  const min = Number(rechargeObj.value?.rechargeMin)
  if (!Number.isFinite(min)) return '--'
  return `${_numberWithCommas(String(Math.floor(min)))} ${fiatCurrency.value}`
})
const limitMaxDisplay = computed(() => {
  const max = Number(rechargeObj.value?.rechargeMax)
  if (!Number.isFinite(max)) return '--'
  return `${_numberWithCommas(String(Math.floor(max)))} ${fiatCurrency.value}`
})
const submitAddress = computed(() => {
  if (isBankRecharge.value) return rechargeObj.value?.bankCardNo ?? ''
  const key = route.query.type
  const fromMap = key ? normalizeRechargeAddressFromApi(mainStore.userRechageMap[key], key) : ''
  return fromMap || rechargeObj.value?.coinAddress || ''
})

watch(
  () => route.query.type,
  () => {
    if (!isBankRecharge.value) {
      mainStore.getUserRechageNew()
    }
  },
  { immediate: true }
)

const onNext = async () => {
  const val = Number(amount.value)
  if (!Number.isFinite(val) || val <= 0) {
    _toast('recharge_num')
    return
  }
  const submitAmountValue = val
  // 虚拟币：若已有处理中订单，直接进入“地址+我已充值”页，避免重复下单
  if (isVirtualType.value) {
    const pendingRes = await getRechargeList('status=0&pageNum=1&pageSize=100')
    if (pendingRes.code == '200' || pendingRes.code == 200) {
      const rows = pendingRes.rows || []
      const wantType = String(route.query.type || '').toUpperCase()
      const wantCoin = String(route.query.coin || '').toUpperCase()
      const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
      const wantTypeN = norm(wantType)
      const wantCoinN = norm(wantCoin)
      const pending = rows.find(
        (item) => {
          const t = String(item?.type || '')
          const coin = String(item?.coin || '')
          const coinName = String(item?.coinName || '')
          const symbol = String(item?.symbol || '')
          const tN = norm(t)
          const coinN = norm(coin)
          const coinNameN = norm(coinName)
          const symbolN = norm(symbol)
          return (
            tN === wantTypeN ||
            coinNameN === wantTypeN ||
            symbolN === wantTypeN ||
            coinN === wantCoinN ||
            tN === wantCoinN ||
            tN.includes(wantTypeN) ||
            coinNameN.includes(wantTypeN) ||
            symbolN.includes(wantTypeN) ||
            wantTypeN.includes(tN)
          )
        }
      )
      if (pending) {
        const q = new URLSearchParams({
          type: String(route.query.type || ''),
          coin: String(route.query.coin || ''),
          amount: String(priceFormat(pending?.amount ?? submitAmountValue)),
          orderId: String(pending?.id || pending?.serialId || '')
        })
        router.push(`/recharge-apply?${q.toString()}`)
        return
      }
    }
  }

  const addr = submitAddress.value
  if (!addr) {
    _toast('recharge_address_empty')
    return
  }
  const payload = {
    amount: priceFormat(submitAmountValue),
    type: route.query.type,
    coin: route.query.coin,
    filePath: '',
    address: addr
  }
  let orderId = ''
  let submitErrorMsg = ''
  let submitPayUrl = ''
  const pickErrMsg = (e) =>
    String(e?.data?.msg || e?.response?.data?.msg || e?.msg || e?.message || '')
  const waitingMsgHit = (msg) => {
    const s = String(msg || '').toLowerCase()
    return (
      s.includes('waiting for callback') ||
      s.includes('do not create another one') ||
      s.includes('充值订单等待回调') ||
      s.includes('不要重复创建') ||
      s.includes('正在等待回調') ||
      s.includes('請勿重複建立')
    )
  }
  const jumpToApply = (oid = '') => {
    const q = new URLSearchParams({
      type: String(route.query.type || ''),
      coin: String(route.query.coin || ''),
      amount: String(priceFormat(submitAmountValue)),
      orderId: String(oid || '')
    })
    router.push(`/recharge-apply?${q.toString()}`)
  }
  try {
    const res = await rechargeSubmit(payload)
    submitPayUrl = String(res?.data?.payUrl || '').trim()
    orderId =
      res?.data?.id ??
      res?.data?.orderId ??
      res?.data?.serialId ??
      res?.id ??
      ''
    if (isBankType && submitPayUrl) {
      window.location.href = submitPayUrl
      return
    }
    if (res.code != '200' && res.code != 200) {
      submitErrorMsg = res.msg || ''
      if (isVirtualType.value && waitingMsgHit(submitErrorMsg)) {
        _toast('recharge_waiting')
        jumpToApply(orderId)
        return
      }
    }
  } catch (err) {
    submitErrorMsg = pickErrMsg(err)
    if (isVirtualType.value && waitingMsgHit(submitErrorMsg)) {
      _toast('recharge_waiting')
      jumpToApply(orderId)
      return
    }
  }

  // 虚拟币：后端明确提示“已有等待回调订单”时，直接跳申请页
  if (isVirtualType.value && waitingMsgHit(submitErrorMsg)) {
    const listRes = await getRechargeList('status=0&pageNum=1&pageSize=100')
    let fallbackOrderId = ''
    if (listRes.code == '200' || listRes.code == 200) {
      const rows = listRes.rows || []
      const wantType = String(route.query.type || '').toUpperCase()
      const wantCoin = String(route.query.coin || '').toUpperCase()
      const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
      const wantTypeN = norm(wantType)
      const wantCoinN = norm(wantCoin)
      const pending = rows.find((item) => {
        const tN = norm(item?.type)
        const coinN = norm(item?.coin)
        const coinNameN = norm(item?.coinName)
        const symbolN = norm(item?.symbol)
        return (
          tN === wantTypeN ||
          coinNameN === wantTypeN ||
          symbolN === wantTypeN ||
          coinN === wantCoinN ||
          tN === wantCoinN ||
          tN.includes(wantTypeN) ||
          coinNameN.includes(wantTypeN) ||
          symbolN.includes(wantTypeN) ||
          wantTypeN.includes(tN)
        )
      })
      fallbackOrderId = String(pending?.id || pending?.serialId || '')
    }
    _toast('recharge_waiting')
    jumpToApply(fallbackOrderId)
    return
  }

  if (!orderId) {
    const listRes = await getRechargeList('status=0&pageNum=1&pageSize=20')
    if (listRes.code == '200' || listRes.code == 200) {
      const rows = listRes.rows || []
      const pending = rows.find(
        (item) => String(item?.type || '').toUpperCase() === String(route.query.type || '').toUpperCase()
      )
      if (pending) {
        orderId = pending?.id || pending?.serialId || ''
        _toast('recharge_waiting')
      } else if (submitErrorMsg) {
        _toast(submitErrorMsg)
        return
      } else {
        _toast('error')
        return
      }
    } else {
      if (submitErrorMsg) {
        _toast(submitErrorMsg)
      } else {
        _toast(listRes.msg || 'error')
      }
      return
    }
  }

  if (isBankType.value) {
    _toast(submitErrorMsg || 'recharge_waiting')
    return
  }

  // 仅虚拟币可进入地址/回调等待页
  if (!isVirtualType.value) return

  jumpToApply(orderId)
}
</script>

<style lang="scss" scoped>
.page-recharge-amount {
  min-height: 100vh;
  background: #05101a;
}

.page-body {
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: #f6f7fb;
  padding: 12px 15px 24px;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 18px 16px;
}

.coin-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f3f5;
  margin-bottom: 16px;
}

.coin-icon {
  font-size: 34px;
}

.coin-type {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.coin-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: #969799;
}

.field .label {
  margin: 0 0 10px;
  font-size: 13px;
  color: #969799;
  line-height: 1.4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.rate-pill {
  color: #ee0a24;
  font-size: 14px;
  font-weight: 600;
}

.input-box {
  border: 1px solid #ebedf0;
  border-radius: 10px;
  background: #fff;
  padding: 0 14px;

  input {
    width: 100%;
    height: 46px;
    border: none;
    outline: none;
    font-size: 15px;
    color: #323233;
    background: transparent;
  }
}

.input-box--suffix {
  display: flex;
  align-items: center;
  gap: 10px;

  input {
    flex: 1;
    min-width: 0;
  }
}

.currency-suffix {
  color: #ee0a24;
  font-size: 16px;
  font-weight: 600;
}

.approx-line {
  margin: 8px 2px 0;
  font-size: 13px;
  color: #646566;
}

.approx-line--net {
  margin-top: 4px;
  color: #17ac74;
}

.mini-hint {
  margin: 12px 2px 0;
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
}

.tips-card {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 138, 0, 0.35);
  background: linear-gradient(180deg, rgba(255, 245, 230, 0.75) 0%, rgba(255, 250, 242, 0.95) 100%);
}

.tips-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(255, 138, 0, 0.25);
}

.tips-row:last-of-type {
  border-bottom: 0;
}

.tips-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 74px;
  flex-shrink: 0;
  font-size: 12px;
  color: #8d6a3f;
}

.tips-value {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #323233;
  text-align: right;
  flex: 1;
  min-width: 0;
}

.tips-value--warn {
  color: #ee0a24;
}

.tips-value--stack {
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.tips-limit-line {
  display: grid;
  grid-template-columns: 28px auto;
  align-items: center;
  gap: 4px;
  min-height: 16px;
  width: 100%;
  justify-content: end;
  justify-items: end;
}

.tips-desc {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: #7a7f87;
}

.tips-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff8a00;
}

.tips-dot--warn {
  background: #ee0a24;
}

.tips-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  box-sizing: border-box;
  font-size: 10px;
  line-height: 1;
  padding: 3px 5px;
  border-radius: 999px;
  color: #8d6a3f;
  background: rgba(255, 138, 0, 0.16);
  border: 1px solid rgba(255, 138, 0, 0.28);
}

.tips-sep {
  opacity: 0.55;
}

.btn-wrap {
  margin-top: 16px;
}

.btn p {
  margin: 0;
  text-align: center;
  padding: 14px 0;
  font-size: 16px;
  border-radius: 999px;
}

.btn--primary p {
  color: #fff;
  background: #05101a;
  font-weight: 500;
}
</style>
