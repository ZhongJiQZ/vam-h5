<!-- 划转 -->
<template>
  <div class="transfer-page">
    <DarkHeaderBar :title="_t18('transfer')" :border_bottom="false" right="" />

    <div class="transfer-page__body">
      <div class="transfer-page__round">
        <div class="transfer-page__sheet">
          <div class="transfer-page__sheet-bg" aria-hidden="true" />
          <div class="transfer-page__panel">
          <div class="transfer-card transfer-card--accounts">
            <div class="transfer-accounts">
              <div class="transfer-account-row">
                <span class="transfer-label">{{ _t18('transfer_from') }}</span>
                <div class="transfer-dd">
                  <van-dropdown-menu active-color="#008710">
                    <van-dropdown-item
                      v-model="params.transferOutAccount"
                      :options="transferOutAccountList"
                    />
                  </van-dropdown-menu>
                </div>
              </div>
              <div class="transfer-account-row">
                <span class="transfer-label">{{ _t18('transfer_to', ['aams']) }}</span>
                <div class="transfer-dd">
                  <van-dropdown-menu active-color="#008710">
                    <van-dropdown-item
                      v-model="params.transferInAccount"
                      :options="transferInAccountList"
                    />
                  </van-dropdown-menu>
                </div>
              </div>
            </div>
            <button type="button" class="transfer-swap-btn" aria-label="swap" @click="jiaohuanbtn2">
              <img :src="transferIconImg" alt="" class="transfer-swap-btn__img" />
            </button>
          </div>

          <div class="transfer-card transfer-card--amount">
            <div class="transfer-amount-title">{{ _t18('transfer_amount') }}</div>
            <div class="transfer-amount-row">
              <input
                v-model="params.amount"
                type="number"
                class="transfer-input ff-num"
                :placeholder="`${_t18('transfer_less', ['aams'])}1${params.coin?.toUpperCase()}`"
              />
              <div class="transfer-amount-meta">
                <span class="transfer-all" @click="amountAll">{{ _t18('swap_all') }}</span>
                <span class="transfer-sep">|</span>
                <span class="transfer-coin">{{ params.coin?.toUpperCase() }}</span>
              </div>
            </div>
          </div>

          <div class="transfer-balance">
            {{ _t18('transfer_available') }}：<span class="fw-num"
              >{{ availableAmount }} {{ params.coin?.toUpperCase() }}</span
            >
          </div>

          <div class="transfer-submit" @click="submit">
            {{ _t18('transfer_require') }}
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DIFF_ISFREEZE } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import transferIconImg from '@/assets/images/transfer/exchange.png'
import { getTransferList, getUserBalance } from '@/api/account'
import { onMounted, ref, computed } from 'vue'
import { showToast } from 'vant'
import { _t18 } from '@/utils/public'
import { useMainStore } from '@/store'
import { useUserStore } from '@/store/user'
import { useToast } from '@/hook/useToast'

const { _isFreeze } = useFreeze()
const { _toast } = useToast()
const mainStore = useMainStore()
const userStore = useUserStore()

const params = ref({
  coin: 'usdt',
  transferOutAccount: '',
  transferInAccount: '',
  amount: ''
})

const availableList = ref([])
const getBalance = async () => {
  let res = await getUserBalance()
  if (res.code == '200') {
    availableList.value = res.data
  }
}

const availableAmount = computed(() => {
  let amountTemp = ''
  availableList.value.forEach((item) => {
    if (item?.type == params.value.transferOutAccount) {
      amountTemp = item.availableAmount
    }
  })
  return amountTemp
})

const tempList = computed(() => {
  const list = mainStore.getAssetsTabList.filter((item) => {
    const key = { 平台资产: 1, 理财资产: 2, 合约资产: 3 }
    item.name == '平台资产' && (item.keyStr = _t18(item.keyStr, ['latcoin']))
    item.name == '理财资产' && (item.keyStr = _t18(item.keyStr, ['paxpay', 'latcoin']))
    item.name == '合约资产' && (item.keyStr = _t18(item.keyStr, ['paxpay', 'latcoin']))
    item['text'] = item.keyStr
    item['value'] = key[item.name]
    return true
  })
  return list.sort((a, b) => a.sort - b.sort)
})

params.value.transferOutAccount = tempList.value[0]?.value || ''
params.value.transferInAccount = tempList.value[1]?.value || ''

const transferOutAccountList = computed(() =>
  tempList.value.filter((item) => item.value != params.value.transferInAccount)
)
const transferInAccountList = computed(() =>
  tempList.value.filter((item) => item.value != params.value.transferOutAccount)
)

const submit = () => {
  if (DIFF_ISFREEZE.includes(__config._APP_ENV)) {
    if (_isFreeze(DIFF_ISFREEZE)) {
      submitForm()
    }
  } else {
    submitForm()
  }
}

const submitForm = () => {
  if (params.value.amount == '' || params.value.amount <= 0) {
    return _toast('transfer_please_amount')
  }
  getTransferList(params.value).then((res) => {
    if (res.code == '200') {
      _toast('transfer_success')
      getBalance()
    } else {
      showToast(res.msg || '')
    }
  })
}

const amountAll = () => {
  params.value.amount = availableAmount.value
}

const jiaohuanbtn2 = () => {
  ;[params.value.transferOutAccount, params.value.transferInAccount] = [
    params.value.transferInAccount,
    params.value.transferOutAccount
  ]
}

onMounted(() => {
  getBalance()
})
</script>

<style lang="scss" scoped>
$tp-top: #05101a;
$tp-green: #008710;
$tp-card: #f6f7fa;
$tp-border: #e8e8e8;
$tp-btn: #050e17;

.transfer-page {
  min-height: 100vh;
  // background: #ffffff;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.transfer-page__body {
  background: $tp-top;
}

.transfer-page__round {
  background: #fff;
  position: relative;
  overflow: visible;
  border-radius: 16px 16px 0 0;
}

.transfer-page__sheet-bg {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -8px 32px rgba(5, 16, 26, 0.18);
  pointer-events: none;
}

.transfer-page__panel {
  position: relative;
  z-index: 1;
  background: transparent;
  padding: 48px 15px 32px;
}

.transfer-card {
  background: $tp-card;
  border: 1px solid $tp-border;
  border-radius: 18px;
  padding: 4px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(5, 16, 26, 0.04);
}

.transfer-card--accounts {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 8px;
  padding: 8px 0 0 16px;
}

.transfer-accounts {
  flex: 1;
  min-width: 0;
}

.transfer-account-row {
  display: flex;
  align-items: center;
  min-height: 52px;
  padding: 8px 0;

  &:first-child {
    border-bottom: 1px dashed #ccc;
  }
}

.transfer-label {
  flex-shrink: 0;
  width: 36px;
  font-size: 14px;
  color: #888;
}

.transfer-dd {
  flex: 1;
  min-width: 0;

  :deep(.van-dropdown-menu) {
    width: 100%;
    height: auto;
  }

  :deep(.van-dropdown-menu__bar) {
    height: 44px;
    background: transparent;
    box-shadow: none;
  }

  :deep(.van-dropdown-menu__item) {
    justify-content: flex-end;
  }

  :deep(.van-dropdown-menu__title) {
    padding: 0 8px 0 12px;
    font-size: 15px;
    font-weight: 500;
    color: #111;
  }

  :deep(.van-dropdown-menu__title::after) {
    border-color: transparent transparent #999 #999;
    opacity: 0.8;
  }
}

.transfer-swap-btn {
  align-self: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  margin: 8px 12px 8px 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transfer-swap-btn__img {
  display: block;
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.transfer-card--amount {
  padding: 16px 16px 4px;
}

.transfer-amount-title {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #111;
}

.transfer-amount-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid $tp-border;
}

.transfer-input {
  flex: 1;
  min-width: 120px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #333;

  &::placeholder {
    color: #bbb;
  }
}

.transfer-amount-meta {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
}

.transfer-all {
  font-size: 14px;
  font-weight: 500;
  color: $tp-green;
  cursor: pointer;
}

.transfer-sep {
  font-size: 12px;
  color: #ccc;
}

.transfer-coin {
  font-size: 15px;
  font-weight: 600;
  color: #111;
}

.transfer-balance {
  margin: 4px 0 24px;
  font-size: 13px;
  color: #333;
  line-height: 1.5;
}

.transfer-submit {
  margin-top: 8px;
  padding: 15px 20px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: $tp-btn;
  border-radius: 999px;
  cursor: pointer;
}

:deep(.van-dropdown-menu) {
  :deep(.van-popup--top) {
    max-width: var(--ex-max-width);
    left: 50%;
    translate: -50%;
  }
}

:deep(.van-cell) {
  background: var(--ex-default-background-color) !important;
  color: var(--ex-default-font-color);
}
</style>
