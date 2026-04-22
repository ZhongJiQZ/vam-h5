<!-- 充值申请 -->
<template>
  <div class="page-recharge-apply">
    <DarkHeaderBar
      :title="currentName"
      right="rechargeOrder"
      :border_bottom="true"
    />

    <div class="page-body">
      <div v-if="!isBankRecharge" class="qr-section">
        <div
          class="qr-bg"
          :style="{ backgroundImage: `url(${rechargeApplyBg})` }"
          aria-hidden="true"
        />
        <div class="qr-frame">
          <QRCode :address="address"></QRCode>
        </div>
      </div>

      <div class="applyMes" :class="{ 'applyMes--noqr': isBankRecharge }">
        <template v-if="isBankRecharge">
          <div class="info-row">
            <p class="top">{{ _t18('bank_name') }}</p>
            <div class="bottom">{{ rechargeObj?.bankName }}</div>
          </div>
          <div class="address">
            <p class="top">{{ _t18('Account_holder') }}</p>
            <div class="bottom">
              <Copy :data="rechargeObj?.bankUserName || ''" :fontSize="'16px'">
                <template #copyMsg>
                  <span class="fw-num">{{ rechargeObj?.bankUserName }}</span>
                </template>
              </Copy>
            </div>
          </div>
          <div class="address">
            <p class="top">{{ _t18('Bank_card_number') }}</p>
            <div class="bottom">
              <Copy :data="rechargeObj?.bankCardNo || ''" :fontSize="'16px'">
                <template #copyMsg>
                  <span class="fw-num">{{ rechargeObj?.bankCardNo }}</span>
                </template>
              </Copy>
            </div>
          </div>
        </template>
        <div v-else class="address">
          <p class="top">{{ _t18('recharge_address', ['bitmake']) }}({{ route.query.type }})</p>
          <div class="bottom">
            <Copy :data="address" :fontSize="'16px'">
              <template #copyMsg>
                <span class="fw-num">{{ address }}</span>
              </template>
            </Copy>
          </div>
        </div>
        <template
          v-if="
            isBankRecharge ||
            !['coinsexpto', 'rxce', 'gmtoin', 'aams', 'bitbyex', 'gmmoin'].includes(
              _getConfig('_APP_ENV')
            )
          "
        >
          <div class="num">
            <p class="top">
              {{
                isBankRecharge
                  ? _t18('recharge_amount_usdt')
                  : _t18('recharge_number', ['bitmake'])
              }}
            </p>
            <div class="bottom">
              <input
                v-model="num"
                type="number"
                class="ff-num"
                :placeholder="_t18('recharge_input')"
              />
            </div>
          </div>
          <div v-if="isBankRecharge && showFiatHints" class="fiat-hints">
            <p class="fiat-rate-line">{{ fiatRateText }}</p>
            <p v-if="fiatTransferDisplay" class="fiat-estimate">
              <span class="fiat-est-label">{{ _t18('recharge_fiat_transfer') }}</span>
              <span class="fiat-est-val ff-num">{{ fiatTransferDisplay }}</span>
            </p>
          </div>
        </template>
      </div>

      <template
        v-if="
          !isBankRecharge &&
          ['coinsexpto', 'rxce', 'bitbyex', 'gmmoin'].includes(_getConfig('_APP_ENV'))
        "
      >
        <div class="btn-wrap">
          <div class="btn btn--primary" @click="_copy(address)">
            <p>{{ _t18('copy') }}</p>
          </div>
        </div>
        <div v-if="['bitbyex'].includes(_getConfig('_APP_ENV'))" class="tip-list">
          <div v-for="(item, index) in tipList2" :key="index" class="tip">
            {{ item.content }}
          </div>
        </div>
        <div v-else class="tip-list">
          <div v-for="(item, index) in tipList" :key="index" class="tip">
            {{ index + 1 }}.{{ item.content }}
          </div>
        </div>
      </template>
      <template v-else-if="!isBankRecharge && ['gmtoin'].includes(_getConfig('_APP_ENV'))">
        <div class="tip-list">
          <div class="tip">{{ _t18('account_balance_info') }}</div>
        </div>
      </template>
      <template
        v-else-if="!isBankRecharge && ['aams', 'gmmoin'].includes(_getConfig('_APP_ENV'))"
      ></template>
      <template v-else>
        <div class="btn-wrap">
          <div class="btn btn--primary" @click="submit">
            <p>{{ _t18('recharge_require', ['bitmake']) }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { rechargeSubmit } from '@/api/account.js'
import { _toView, _t18, _getConfig, _numberWithCommas } from '@/utils/public'
import { priceFormat } from '@/utils/decimal'
import QRCode from '@/components/common/QRCode/index.vue'
import Copy from '@/components/common/Copy/index.vue'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import rechargeApplyBg from '@/assets/images/recharge-apply-bg.png'
import { showToast } from 'vant'
import { debounce } from 'lodash'
import { useToast } from '@/hook/useToast'
import { useCopy } from '@/hook/useCopy'
import { useRouter, useRoute } from 'vue-router'
import { useMainStore } from '@/store'
import { reactive, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { normalizeRechargeAddressFromApi } from '@/utils/rechargeAddress'

const { t } = useI18n()

const { _toast } = useToast()
const { _copy } = useCopy()
const route = useRoute()
const router = useRouter()

const currentName = `${_t18('recharge', ['latcoin'])} ${route.query.type}`

const tipList = reactive([
  { content: _t18('recharge_tip1') },
  { content: _t18('recharge_tip2') },
  { content: _t18('recharge_tip3') },
  { content: _t18('recharge_tip4') }
])
const tipList2 = reactive([{ content: _t18('recharge_tip5') }])
const num = ref('')

const submit = debounce(() => {
  const needAmount = isBankRecharge.value || !['coinsexpto'].includes(__config._APP_ENV)
  if (needAmount && num.value == '') {
    _toast('recharge_num')
    return
  }
  const payAddress = isBankRecharge.value
    ? (rechargeObj.value?.bankCardNo ?? '')
    : address.value
  let params = {}
  if (needAmount) {
    params = {
      amount: priceFormat(num.value),
      type: route.query.type,
      coin: route.query.coin,
      filePath: '',
      address: payAddress
    }
  } else {
    params = {
      amount: 0,
      type: route.query.type,
      coin: route.query.coin,
      address: payAddress
    }
  }

  rechargeSubmit(params).then((res) => {
    if (res.code == '200') {
      _toast('recharge_success')
      num.value = ''
      setTimeout(() => {
        _toView('/recharge-order')
      }, 500)
    } else {
      showToast(res.msg)
    }
  })
}, 500)

const mainStore = useMainStore()

const rechargeObj = computed(() =>
  mainStore.getRechargeList.find((elem) => elem.coinName == route.query.type)
)
const isBankRecharge = computed(() =>
  Boolean(rechargeObj.value?.bankCardNo && rechargeObj.value?.bankName)
)

function ensureUserRechargeAddresses() {
  if (isBankRecharge.value) return
  mainStore.getUserRechageNew()
}

watch(
  [() => route.query.coin, () => route.query.type, isBankRecharge],
  ensureUserRechargeAddresses,
  { immediate: true }
)

const address = computed(() => {
  if (isBankRecharge.value) return rechargeObj.value?.coinAddress ?? ''
  const key = route.query.type
  const fromMap = key ? normalizeRechargeAddressFromApi(mainStore.userRechageMap[key], key) : ''
  return fromMap || rechargeObj.value?.coinAddress || ''
})

const fiatPerUsdtNum = computed(() => {
  const n = Number(rechargeObj.value?.fiatPerUsdt)
  return Number.isFinite(n) && n > 0 ? n : null
})
const showFiatHints = computed(() => isBankRecharge.value && fiatPerUsdtNum.value != null)
const fiatCurrency = computed(() => String(rechargeObj.value?.fiatCurrency || 'IDR'))
const fiatRateText = computed(() => {
  if (!showFiatHints.value || fiatPerUsdtNum.value == null) return ''
  return t('withdraw_rate_line', {
    currency: fiatCurrency.value,
    rate: _numberWithCommas(fiatPerUsdtNum.value)
  })
})
const fiatTransferDisplay = computed(() => {
  if (!showFiatHints.value || fiatPerUsdtNum.value == null) return ''
  const qty = Number(num.value)
  if (!Number.isFinite(qty) || qty <= 0) return ''
  const fiat = Math.round(qty * fiatPerUsdtNum.value)
  return `${fiatCurrency.value} ${_numberWithCommas(fiat)}`
})
</script>

<style lang="scss" scoped>
.page-recharge-apply {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.page-body {
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: #f0f2f5;
  
  padding-bottom: 28px;
  padding-top: 20px;
  box-sizing: border-box;
}

.qr-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px 100px;
  overflow: hidden;
}

.qr-bg {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(100%, 360px);
  height: 220px;
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: contain;
  pointer-events: none;
  z-index: 0;
}

.qr-frame {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding: 8px;
  border: 2px solid #17ac74;
  border-radius: 10px;
  background: #fff;
  box-sizing: content-box;
}

.page-recharge-apply :deep(.qr-frame .box .erweima) {
  border-color: transparent;
}

.applyMes {
  margin: -64px 15px 0;
  position: relative;
  z-index: 2;
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  &--noqr {
    margin-top: 0;
  }

  & > div {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .top {
    font-size: 13px;
    color: #969799;
    margin: 0 0 10px;
    line-height: 1.4;
  }

  .address .bottom {
    word-break: break-all;
    font-size: 15px;
    color: #323233;
  }

  .info-row .bottom {
    font-size: 15px;
    color: #323233;
    line-height: 1.45;
  }

  .fiat-hints {
    margin: -4px 0 4px;
  }

  .fiat-rate-line {
    margin: 0 0 8px;
    font-size: 13px;
    color: #646566;
    line-height: 1.5;
  }

  .fiat-estimate {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px;
    font-size: 13px;
    color: #323233;
    line-height: 1.5;
  }

  .fiat-est-label {
    color: #969799;
  }

  .num .bottom {
    border: 1px solid #ebedf0;
    padding: 12px;
    border-radius: 8px;
    background: #fff;

    input {
      width: 100%;
      border: none;
      font-size: 15px;
      color: #323233;
      background: transparent;
      outline: none;
    }

    input::placeholder {
      color: #c8c9cc;
      font-size: 14px;
    }
  }
}

.btn-wrap {
  padding: 20px 15px 0;
}

.btn {
  p {
    margin: 0;
    text-align: center;
    padding: 14px 0;
    font-size: 16px;
    border-radius: 999px;
  }

  &--primary p {
    color: #fff;
    background: #05101a;
    font-weight: 500;
  }
}

.tip-list {
  padding: 16px 15px 0;
  font-size: 14px;
  color: #646566;
  line-height: 1.5;

  .tip {
    margin-bottom: 12px;
  }
}
</style>
