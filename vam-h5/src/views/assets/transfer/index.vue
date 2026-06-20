<!-- 划转 -->
<template>
  <div class="page page--transfer">
    <header class="transfer-header">
      <button type="button" class="transfer-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="transfer-header__back-icon" />
      </button>
      <h1 class="transfer-header__title">{{ _t18('transfer') }}</h1>
    </header>

    <main class="transfer-main">
      <section class="transfer-card transfer-card--wallets">
        <div class="transfer-wallet">
          <div class="transfer-wallet__row">
            <span class="transfer-wallet__value">{{ _t18('transfer_from') }}</span>
            <button type="button" class="transfer-wallet__select" @click="openWalletPicker('from')">
              <span class="transfer-wallet__name">{{ getAccountName(params.transferOutAccount) }}</span>
              <span class="transfer-wallet__chevron" aria-hidden="true"></span>
            </button>
          </div>
        </div>

        <div class="transfer-flip">
          <button type="button" class="transfer-flip__btn" aria-label="swap" @click="jiaohuanbtn2">
            <span
              class="transfer-flip__icon"
              aria-hidden="true"
              :style="{ transform: `rotate(${flipRotation}deg)` }"
            >
              <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="transfer-flip-grad" gradientUnits="objectBoundingBox" x1="0" y1="0.5" x2="1" y2="0.5">
                    <stop offset="0%" stop-color="rgb(160,65,236)" />
                    <stop offset="60.9%" stop-color="rgb(81,76,253)" />
                  </linearGradient>
                </defs>
                <g transform="matrix(1,0,0,1,6.666666507720947,6.666666507720947)">
                  <path
                    d="M33.33 66.67C51.74 66.67 66.67 51.74 66.67 33.33C66.67 14.92 51.74 0 33.33 0C14.92 0 0 14.92 0 33.33C0 51.74 14.92 66.67 33.33 66.67ZM43 12.31L52.52 24.93C53.96 26.83 52.6 29.56 50.22 29.56L15.56 29.56C15.23 29.56 14.92 29.49 14.62 29.37C14.32 29.25 14.05 29.07 13.83 28.84C13.6 28.61 13.42 28.34 13.3 28.05C13.17 27.75 13.11 27.43 13.11 27.11C13.11 26.79 13.17 26.47 13.3 26.18C13.42 25.88 13.6 25.61 13.83 25.38C14.05 25.16 14.32 24.98 14.62 24.85C14.92 24.73 15.23 24.67 15.56 24.67L46.2 24.67L39.1 15.25C38.91 14.99 38.76 14.7 38.68 14.39C38.6 14.08 38.58 13.76 38.63 13.44C38.67 13.12 38.78 12.82 38.94 12.54C39.11 12.26 39.32 12.02 39.58 11.83C39.83 11.63 40.13 11.49 40.44 11.41C40.75 11.33 41.07 11.31 41.39 11.36C41.71 11.4 42.01 11.51 42.29 11.67C42.57 11.83 42.81 12.05 43 12.31ZM23.67 54.36L14.14 41.74C12.71 39.84 14.06 37.11 16.45 37.11L51.11 37.11C51.43 37.11 51.75 37.17 52.05 37.3C52.34 37.42 52.61 37.6 52.84 37.83C53.07 38.05 53.25 38.32 53.37 38.62C53.49 38.92 53.56 39.23 53.56 39.56C53.56 39.88 53.49 40.19 53.37 40.49C53.25 40.79 53.07 41.06 52.84 41.28C52.61 41.51 52.34 41.69 52.05 41.81C51.75 41.94 51.43 42 51.11 42L20.46 42L27.57 51.42C27.95 51.93 28.12 52.58 28.02 53.22C27.93 53.86 27.59 54.44 27.08 54.82C26.56 55.21 25.92 55.38 25.28 55.3C24.64 55.21 24.06 54.87 23.67 54.36Z"
                    fill="url(#transfer-flip-grad)"
                    fill-rule="nonzero"
                  />
                </g>
              </svg>
            </span>
          </button>
        </div>

        <div class="transfer-wallet">
          <div class="transfer-wallet__row">
            <span class="transfer-wallet__value">{{ _t18('transfer_to', ['aams']) }}</span>
            <button type="button" class="transfer-wallet__select" @click="openWalletPicker('to')">
              <span class="transfer-wallet__name">{{ getAccountName(params.transferInAccount) }}</span>
              <span class="transfer-wallet__chevron" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </section>

      <section class="transfer-card transfer-card--amount">
        <div class="transfer-panel">
          <div class="transfer-panel__label">{{ _t18('transfer_amount') }}</div>
          <div class="transfer-panel__row">
            <button type="button" class="transfer-token">
              <span class="transfer-token__icon">
                <svg-load :name="params.coin" />
              </span>
              <span class="transfer-token__symbol">{{ params.coin?.toUpperCase() }}</span>
            </button>
            <div class="transfer-panel__field">
              <input
                v-model="params.amount"
                type="number"
                class="transfer-panel__input ff-num"
                :placeholder="`${_t18('transfer_less', ['aams'])}1${params.coin?.toUpperCase()}`"
                :aria-label="_t18('transfer_amount')"
              />
              <button type="button" class="transfer-panel__max" @click="amountAll">
                {{ _t18('swap_all') }}
              </button>
            </div>
          </div>
          <div class="transfer-panel__head">
            <span class="transfer-panel__balance-label">{{ _t18('transfer_available') }}</span>
            <div class="transfer-panel__balance">
              <span class="transfer-panel__balance-value ff-num">{{ availableAmount }}</span>
              <span class="transfer-panel__balance-unit">{{ params.coin?.toUpperCase() }}</span>
            </div>
          </div>
        </div>
      </section>

      <button
        type="button"
        class="transfer-confirm"
        :class="{ 'transfer-confirm--disabled': submitting }"
        @click="submit"
      >
        {{ submitting ? _t18('loading') : _t18('transfer_require') }}
      </button>
    </main>

    <van-action-sheet
      v-model:show="showSheet"
      title=""
      class="assets-picker-sheet"
      style="max-width: var(--ex-max-width); left: 50%; translate: -50%"
    >
      <div class="picker-list">
        <button
          v-for="item in walletOptions"
          :key="item.value"
          type="button"
          class="picker-item"
          @click="selectWallet(item)"
        >
          <span class="picker-item__label">{{ item.text }}</span>
        </button>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { DIFF_ISFREEZE } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import '../styles/picker-sheet.scss'
import { getTransferList, getUserBalance } from '@/api/account'
import { onMounted, ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import { _t18, _back } from '@/utils/public'
import { useMainStore } from '@/store'
import { useToast } from '@/hook/useToast'

const { _isFreeze } = useFreeze()
const { _toast } = useToast()
const mainStore = useMainStore()

const params = ref({
  coin: 'usdt',
  transferOutAccount: '',
  transferInAccount: '',
  amount: ''
})

const submitting = ref(false)
const flipRotation = ref(90)
const showSheet = ref(false)
const walletPickerType = ref('from')
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

const hasInitDefaultAccounts = ref(false)
watch(
  () => tempList.value,
  (list) => {
    if (hasInitDefaultAccounts.value) return
    if (!Array.isArray(list) || list.length === 0) return

    const out = list.find((i) => i.value === 1)?.value ?? list[0]?.value ?? ''
    const preferredIn =
      list.find((i) => i.value === 3 && i.value !== out)?.value ??
      list.find((i) => i.value !== out)?.value ??
      ''

    params.value.transferOutAccount = out
    params.value.transferInAccount = preferredIn
    hasInitDefaultAccounts.value = true
  },
  { immediate: true }
)

const transferOutAccountList = computed(() =>
  tempList.value.filter((item) => item.value != params.value.transferInAccount)
)
const transferInAccountList = computed(() =>
  tempList.value.filter((item) => item.value != params.value.transferOutAccount)
)

const walletOptions = computed(() =>
  walletPickerType.value === 'from' ? transferOutAccountList.value : transferInAccountList.value
)

const getAccountName = (value) => {
  const item = tempList.value.find((i) => i.value === value)
  return item?.text || ''
}

const openWalletPicker = (type) => {
  walletPickerType.value = type
  showSheet.value = true
}

const selectWallet = (item) => {
  showSheet.value = false
  if (walletPickerType.value === 'from') {
    params.value.transferOutAccount = item.value
  } else {
    params.value.transferInAccount = item.value
  }
}

const submit = () => {
  if (submitting.value) return
  if (DIFF_ISFREEZE.includes(__config._APP_ENV)) {
    if (_isFreeze(DIFF_ISFREEZE)) {
      submitForm()
    }
  } else {
    submitForm()
  }
}

const submitForm = () => {
  if (submitting.value) return
  if (params.value.amount == '' || params.value.amount <= 0) {
    return _toast('transfer_please_amount')
  }
  submitting.value = true
  getTransferList(params.value)
    .then((res) => {
      if (res.code == '200') {
        _toast('transfer_success')
        getBalance()
      } else {
        showToast(res.msg || '')
      }
    })
    .finally(() => {
      submitting.value = false
    })
}

const amountAll = () => {
  params.value.amount = availableAmount.value
}

const jiaohuanbtn2 = () => {
  flipRotation.value += 180
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
.page--transfer {
  min-height: 100vh;
  background: #111111;
  color: #fff;
  padding-bottom: calc(79px + env(safe-area-inset-bottom, 0px));
}

.transfer-header {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 22px 1fr 22px;
  align-items: center;
  min-height: 26px;
  padding: 0 12px;
}

.transfer-header__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-left: -9px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.transfer-header__back-icon {
  display: block;
  width: 12px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.transfer-header__title {
  grid-column: 2;
  margin: 0;
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
}

.transfer-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 12px 0;
}

.transfer-card {
  padding: 20px 12px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.transfer-card--wallets {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transfer-wallet__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 50px;
  padding: 9px 12px;
  border-radius: 25px;
  background: rgb(34, 34, 34);
}

.transfer-wallet__value {
  flex-shrink: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.45);
}

.transfer-wallet__select {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  height: 32px;
  margin-left: auto;
  padding: 0 6px 0 8px;
  border: none;
  border-radius: 999px;
  background: rgb(27, 27, 27);
  cursor: pointer;
}

.transfer-wallet__name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  white-space: nowrap;
}

.transfer-wallet__chevron {
  width: 5px;
  height: 5px;
  border-right: 1px solid rgba(255, 255, 255, 0.65);
  border-bottom: 1px solid rgba(255, 255, 255, 0.65);
  transform: rotate(45deg);
  margin-top: -2px;
  flex-shrink: 0;
}

.transfer-flip {
  display: flex;
  justify-content: center;
  margin: 0;
  position: relative;
  z-index: 1;
}

.transfer-flip__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.transfer-flip__icon {
  display: block;
  width: 40px;
  height: 40px;
  transition: transform 0.35s ease;

  svg {
    width: 40px;
    height: 40px;
    display: block;
  }
}

.transfer-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transfer-panel__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.85);
}

.transfer-panel__row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 9px 12px;
  border-radius: 25px;
  background: rgb(34, 34, 34);
}

.transfer-token {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  min-width: 77px;
  height: 32px;
  padding: 0 8px 0 4px;
  border: none;
  border-radius: 999px;
  background: rgb(27, 27, 27);
  cursor: default;
}

.transfer-token__icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;

  :deep(img),
  :deep(svg) {
    width: 24px;
    height: 24px;
    display: block;
  }
}

.transfer-token__symbol {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  white-space: nowrap;
}

.transfer-panel__field {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.transfer-panel__input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  line-height: 1.2;
  color: #fff;
  text-align: right;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
}

.transfer-panel__max {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 24px;
  padding: 0 8px;
  border: none;
  border-radius: 999px;
  background: rgb(160, 65, 237);
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: #fff;
  cursor: pointer;
}

.transfer-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 17px;
}

.transfer-panel__balance-label {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.65);
}

.transfer-panel__balance {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.transfer-panel__balance-value,
.transfer-panel__balance-unit {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.85);
}

.transfer-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 40px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35);
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  cursor: pointer;

  &:active {
    opacity: 0.92;
  }

  &--disabled {
    opacity: 0.65;
    pointer-events: none;
    cursor: not-allowed;
  }
}
</style>
