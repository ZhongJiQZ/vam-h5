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
          <p class="label">{{ _t18('recharge_number', ['bitmake']) }}</p>
          <div class="input-box">
            <input
              v-model="amount"
              type="number"
              class="ff-num"
              :placeholder="_t18('recharge_input')"
            />
          </div>
        </div>
        <p class="mini-hint">{{ _t18('recharge_amount_confirm_hint') }}</p>
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
import { _t18, filterCoin2 } from '@/utils/public'
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
  const addr = submitAddress.value
  if (!addr) {
    _toast('recharge_address_empty')
    return
  }
  const payload = {
    amount: priceFormat(val),
    type: route.query.type,
    coin: route.query.coin,
    filePath: '',
    address: addr
  }
  const isBankType = String(route.query.type || '').toUpperCase() === 'BANK'
  let orderId = ''
  let submitErrorMsg = ''
  let submitPayUrl = ''
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
    }
  } catch (err) {
    submitErrorMsg = err?.data?.msg || err?.msg || err?.message || ''
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

  if (isBankType) {
    _toast(submitErrorMsg || 'recharge_waiting')
    return
  }

  const q = new URLSearchParams({
    type: String(route.query.type || ''),
    coin: String(route.query.coin || ''),
    amount: String(priceFormat(val)),
    orderId: String(orderId || '')
  })
  router.push(`/recharge-apply?${q.toString()}`)
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

.mini-hint {
  margin: 12px 2px 0;
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
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
