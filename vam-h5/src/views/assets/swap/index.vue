<!-- 兑换 -->
<template>
  <div class="page page--swap">
    <header class="swap-header">
      <button type="button" class="swap-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="swap-header__back-icon" />
      </button>
      <h1 class="swap-header__title">{{ _t18('swap') }}</h1>
    </header>

    <main class="swap-main">
      <div class="swap-stack">
        <section class="swap-card">
          <div class="swap-panel swap-panel--from">
            <div class="swap-panel__row">
              <button type="button" class="swap-token" @click="showAction('from')">
                <span class="swap-token__icon">
                  <image-load
                    v-if="displayIconUrl(list1Current)"
                    :filePath="displayIconUrl(list1Current)"
                    alt=""
                    @error="onIconError(list1Current?.coin)"
                  />
                  <svg-load v-else :name="displaySvgIcon(list1Current)" />
                </span>
                <span class="swap-token__symbol">{{ list1Current?.coin?.toLocaleUpperCase() }}</span>
                <span class="swap-token__chevron" aria-hidden="true"></span>
              </button>
              <div class="swap-panel__field">
                <input
                  v-model="fromNum"
                  type="number"
                  class="swap-panel__input ff-num"
                  :placeholder="_t18('swap_input')"
                  :aria-label="_t18('swap_input')"
                />
                <button type="button" class="swap-panel__max" @click="fromNum = String(list1Current?.amount || '0')">
                  {{ _t18('swap_all') }}
                </button>
              </div>
            </div>
            <div class="swap-panel__head">
              <span class="swap-panel__label">{{ _t18('swap_available') }}</span>
              <div class="swap-panel__balance">
                <span class="swap-panel__balance-value ff-num">{{ priceFormat(availableAmount || 0) }}</span>
                <span class="swap-panel__balance-unit">{{ list1Current?.coin?.toLocaleUpperCase() }}</span>
              </div>
            </div>
          </div>
        </section>

        <div class="swap-flip">
          <button type="button" class="swap-flip__btn" aria-label="swap" @click="jiaohuan()">
            <span
              class="swap-flip__icon"
              aria-hidden="true"
              :style="{ transform: `rotate(${flipRotation}deg)` }"
            >
              <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="swap-flip-grad" gradientUnits="objectBoundingBox" x1="0" y1="0.5" x2="1" y2="0.5">
                    <stop offset="0%" stop-color="rgb(160,65,236)" />
                    <stop offset="60.9%" stop-color="rgb(81,76,253)" />
                  </linearGradient>
                </defs>
                <g transform="matrix(1,0,0,1,6.666666507720947,6.666666507720947)">
                  <path
                    d="M33.33 66.67C51.74 66.67 66.67 51.74 66.67 33.33C66.67 14.92 51.74 0 33.33 0C14.92 0 0 14.92 0 33.33C0 51.74 14.92 66.67 33.33 66.67ZM43 12.31L52.52 24.93C53.96 26.83 52.6 29.56 50.22 29.56L15.56 29.56C15.23 29.56 14.92 29.49 14.62 29.37C14.32 29.25 14.05 29.07 13.83 28.84C13.6 28.61 13.42 28.34 13.3 28.05C13.17 27.75 13.11 27.43 13.11 27.11C13.11 26.79 13.17 26.47 13.3 26.18C13.42 25.88 13.6 25.61 13.83 25.38C14.05 25.16 14.32 24.98 14.62 24.85C14.92 24.73 15.23 24.67 15.56 24.67L46.2 24.67L39.1 15.25C38.91 14.99 38.76 14.7 38.68 14.39C38.6 14.08 38.58 13.76 38.63 13.44C38.67 13.12 38.78 12.82 38.94 12.54C39.11 12.26 39.32 12.02 39.58 11.83C39.83 11.63 40.13 11.49 40.44 11.41C40.75 11.33 41.07 11.31 41.39 11.36C41.71 11.4 42.01 11.51 42.29 11.67C42.57 11.83 42.81 12.05 43 12.31ZM23.67 54.36L14.14 41.74C12.71 39.84 14.06 37.11 16.45 37.11L51.11 37.11C51.43 37.11 51.75 37.17 52.05 37.3C52.34 37.42 52.61 37.6 52.84 37.83C53.07 38.05 53.25 38.32 53.37 38.62C53.49 38.92 53.56 39.23 53.56 39.56C53.56 39.88 53.49 40.19 53.37 40.49C53.25 40.79 53.07 41.06 52.84 41.28C52.61 41.51 52.34 41.69 52.05 41.81C51.75 41.94 51.43 42 51.11 42L20.46 42L27.57 51.42C27.95 51.93 28.12 52.58 28.02 53.22C27.93 53.86 27.59 54.44 27.08 54.82C26.56 55.21 25.92 55.38 25.28 55.3C24.64 55.21 24.06 54.87 23.67 54.36Z"
                    fill="url(#swap-flip-grad)"
                    fill-rule="nonzero"
                  />
                </g>
              </svg>
            </span>
          </button>
        </div>

        <section class="swap-card">
          <div class="swap-panel swap-panel--to">
            <div class="swap-panel__label swap-panel__label--section">{{ _t18('swap_number') }}</div>
            <div class="swap-panel__row">
              <button type="button" class="swap-token" @click="showAction('to')">
                <span class="swap-token__icon">
                  <image-load
                    v-if="displayIconUrl(list2Current)"
                    :filePath="displayIconUrl(list2Current)"
                    alt=""
                    @error="onIconError(list2Current?.coin)"
                  />
                  <svg-load v-else :name="displaySvgIcon(list2Current)" />
                </span>
                <span class="swap-token__symbol">{{ list2Current?.coin?.toLocaleUpperCase() }}</span>
                <span class="swap-token__chevron" aria-hidden="true"></span>
              </button>
              <div class="swap-panel__amount ff-num">{{ toNum || '0.00' }}</div>
            </div>
            <p class="swap-rate ff-num">
              {{ _t18('swap_rateDay') }}：1
              <span>{{ list1Current?.coin?.toLocaleUpperCase() }}</span>
              &nbsp;≈&nbsp;<span>{{ curRate }}</span>
              <span>{{ list2Current?.coin?.toLocaleUpperCase() }}</span>
            </p>
          </div>
        </section>
      </div>

      <button type="button" class="swap-confirm" @click="submit">
        {{ _t18('btnConfirm', ['bitmake']) }}
      </button>
    </main>

    <van-action-sheet
      v-model:show="showSheet"
      title=""
      class="assets-picker-sheet"
      id="sheetPopup"
      style="max-width: var(--ex-max-width); left: 50%; translate: -50%"
    >
      <div class="picker-list">
        <button
          v-for="(item, index) in action"
          :key="item.id ?? item.coin ?? index"
          type="button"
          class="picker-item"
          @click="selectCoin(item, index)"
        >
          <span class="picker-item__icon">
            <image-load
              v-if="displayIconUrl(item)"
              :filePath="displayIconUrl(item)"
              alt=""
              @error="onIconError(item?.coin)"
            />
            <svg-load v-else :name="displaySvgIcon(item)" />
          </span>
          <span class="picker-item__label">{{ item.coin?.toLocaleUpperCase() }}</span>
        </button>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { DIFF_ISFREEZE } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
const { _isFreeze } = useFreeze()
import { showToast } from 'vant'
import { _t18, _back } from '@/utils/public'
import { useToast } from '@/hook/useToast'
const { _toast } = useToast()
import { rate, toExchange } from '@/api/account'
import { debounce } from 'lodash'
import { priceFormat } from '@/utils/decimal.js'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import '../styles/picker-sheet.scss'
import { ref, computed, onMounted, watch } from 'vue'
import { useAccountStore } from '@/store/account/index'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
const accountStore = useAccountStore()
const userStore = useUserStore()
userStore.getUserInfo()
const { asset } = storeToRefs(userStore)
const { swapCoinList } = storeToRefs(accountStore)

const jiaohuanFlag = ref(true)
const flipRotation = ref(90)
const list1 = ref([])
const list2 = ref([])
const list1Current = ref({})
const list2Current = ref({})
const list1Coin = ref(0)
const list2Coin = ref(0)
const iconLoadFailedMap = ref({})

const normalizeIconName = (icon, coin) => {
  const raw = String(icon || '').trim()
  if (!raw) return String(coin || '').trim().toLowerCase()
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.includes('.svg')) {
    const m = raw.match(/([^/]+)\.svg(?:\?.*)?$/i)
    if (m && m[1]) return m[1].toLowerCase()
  }
  return raw
}

const displaySvgIcon = (item) => {
  const normalized = normalizeIconName(item?.icon, item?.coin)
  if (/^https?:\/\//i.test(normalized)) {
    return String(item?.coin || '').trim().toLowerCase()
  }
  return normalized
}

const displayIconUrl = (item) => {
  const coin = String(item?.coin || '').trim().toLowerCase()
  const normalized = normalizeIconName(item?.icon, coin)
  if (!normalized) return ''
  if (!/^https?:\/\//i.test(normalized)) return ''
  if (iconLoadFailedMap.value[coin]) {
    return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/icon/${coin}.png`
  }
  return normalized
}

const onIconError = (coin) => {
  const key = String(coin || '').trim().toLowerCase()
  if (!key) return
  iconLoadFailedMap.value = {
    ...iconLoadFailedMap.value,
    [key]: true
  }
}

const availableAmount = computed(() => {
  let data = ''
  asset.value.forEach((item, index) => {
    if (item.symbol == list1Current.value.coin && item.type == 1) {
      data = item.availableAmount
    }
  })
  return data
})

const init = async () => {
  await accountStore.getSwapCoinList()
  let template1 = []
  asset.value.forEach((item, index) => {
    let obj = {}
    if (item.type == '1') {
      obj['id'] == index + 1
      obj['amount'] = item.availableAmount
      if (item.symbol == 'usdt') {
        obj['coin'] = 'usdt'
        obj['icon'] = 'usdt'
        template1.unshift(obj)
      }
      if (item.symbol != 'usdt') {
        obj['coin'] = item.symbol?.replace('usdt', '').trim()
        obj['icon'] = normalizeIconName(item.loge, obj['coin'])
        template1.push(obj)
      }
    }
  })
  swapCoinList.value.forEach((item, index) => {
    template1.forEach((items, indexs) => {
      if (items.coin == item.coin) {
        item['amount'] = items.amount
      }
    })
  })
  list1.value = template1
  if (['gmtoin2'].includes(__config._APP_ENV)) {
    list1Current.value = template1.find((item, idx) => {
      return item.coin === 'btc'
    })
  } else {
    list1Current.value = template1[0]
  }
  list1Coin.value = list1Current.value?.coin
  list2.value = swapCoinList.value?.filter((item, index) => {
    return item.coin != list1Current.value?.coin
  })
  list2Current.value = swapCoinList.value?.filter((item, index) => {
    return item.coin != list1Current.value?.coin
  })[0]
  list2Coin.value = list2Current.value?.coin
}

const curRate = ref(0)
const getRate = (from, to) => {
  from = filterCoin(from)
  to = filterCoin(to)
  rate(from, to).then((res) => {
    if (res.code == '200') {
      let resFrom = res.data[`${from}`]
      let resTo = res.data[`${to}`]
      if (resFrom == null) {
        resFrom = 1
      }
      if (resTo == null) {
        resTo = 1
      }
      curRate.value = priceFormat(resFrom / resTo, 8)
    }
  })
}

watch([list1Coin], ([newValue], [oldValue]) => {
  if (jiaohuanFlag.value) {
    list1.value.forEach((item, index) => {
      if (item.coin == newValue) {
        list1Current.value = item
      }
    })
    list2.value = swapCoinList.value.filter((item, index) => {
      return item.coin != list1Current.value.coin
    })
    if (newValue == list2Coin.value) {
      list2Current.value = swapCoinList.value.filter((item, index) => {
        return item.coin != list1Current.value.coin
      })[0]
      list2Coin.value = list2Current.value.coin
    }
  } else {
    list1.value.forEach((item, index) => {
      if (item.coin == newValue) {
        list1Current.value = item
      }
    })
  }
})
watch([list2Coin], ([newValue], [oldValue]) => {
  if (jiaohuanFlag.value) {
    list2.value.forEach((item, index) => {
      if (item.coin == newValue) {
        list2Current.value = item
      }
    })
  } else {
    list2.value.forEach((item, index) => {
      if (item.coin == newValue) {
        list2Current.value = item
      }
    })
    list1.value = swapCoinList.value.filter((item, index) => {
      return item.coin != list2Current.value.coin
    })
    if (newValue == list2Coin.value) {
      list1Current.value = swapCoinList.value.filter((item, index) => {
        return item.coin != list2Current.value.coin
      })[0]
      list1Coin.value = list2Current.value.coin
    }
  }
})
watch(
  [list1Current, list2Current],
  (newValue, oldValue) => {
    getRate(newValue[0]?.coin, newValue[1]?.coin)
  },
  {
    deep: true
  }
)

const jiaohuan = () => {
  flipRotation.value += 180
  jiaohuanFlag.value = !jiaohuanFlag.value
  let tempList = list1.value
  list1.value = list2.value
  list2.value = tempList
  let tempCurrent = list1Current.value
  list1Current.value = list2Current.value
  list2Current.value = tempCurrent
}

const showSheet = ref(false)
const action = ref({})
const flag = ref('from')

const filterCoin = (item) => {
  return item
}

const fromNum = ref('')
const toNum = ref()
watch([fromNum, curRate], () => {
  toNum.value = priceFormat(fromNum.value * curRate.value, 8)
})

onMounted(() => {
  init()
})

const showAction = (item) => {
  if (item == 'from') {
    action.value = list1.value
  } else if (item == 'to') {
    action.value = list2.value
  }
  flag.value = item
  showSheet.value = true
}

const selectCoin = (item, index) => {
  showSheet.value = false
  if (flag.value == 'from') {
    list1Coin.value = item.coin
  } else if (flag.value == 'to') {
    list2Coin.value = item.coin
  }
}

const submitForm = debounce(() => {
  if (fromNum.value <= 0) {
    _toast('swap_minNum')
    return
  }
  if (fromNum.value > availableAmount.value) {
    _toast('swap_maxNum')
    return
  }
  let params = {
    fromSymbol: filterCoin(list1Current.value?.coin),
    toSymbol: filterCoin(list2Current.value?.coin),
    total: fromNum.value
  }
  toExchange(params).then((res) => {
    if (res.code == '200') {
      _toast('swap_success', ['aams'])
      setTimeout(() => {
        userStore.getUserInfo()
      }, 1000)
    } else {
      showToast(res.msg)
    }
  })
}, 500)

const submit = () => {
  if (DIFF_ISFREEZE.includes(__config._APP_ENV)) {
    if (_isFreeze(DIFF_ISFREEZE)) {
      submitForm()
    }
  } else {
    submitForm()
  }
}
</script>

<style lang="scss" scoped>
.page--swap {
  min-height: 100vh;
  background: #111111;
  color: #fff;
  padding-bottom: calc(79px + env(safe-area-inset-bottom, 0px));
}

.swap-header {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 22px 1fr 22px;
  align-items: center;
  min-height: 26px;
  padding: 0 12px;
}

.swap-header__back {
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

.swap-header__back-icon {
  display: block;
  width: 12px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.swap-header__title {
  grid-column: 2;
  margin: 0;
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
}

.swap-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 12px 0;
}

.swap-stack {
  display: flex;
  flex-direction: column;
}

.swap-card {
  padding: 20px 12px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.swap-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.swap-panel--to {
  gap: 12px;
}

.swap-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 17px;
}

.swap-panel__label {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.65);
}

.swap-panel__label--section {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.swap-panel__balance {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.swap-panel__balance-value,
.swap-panel__balance-unit {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.85);
}

.swap-panel__row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 9px 12px;
  border-radius: 25px;
  background: rgb(34, 34, 34);
}

.swap-token {
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
  cursor: pointer;
}

.swap-token__icon {
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

.swap-token__symbol {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  white-space: nowrap;
}

.swap-token__chevron {
  width: 5px;
  height: 5px;
  border-right: 1px solid rgba(255, 255, 255, 0.65);
  border-bottom: 1px solid rgba(255, 255, 255, 0.65);
  transform: rotate(45deg);
  margin-top: -2px;
  flex-shrink: 0;
}

.swap-panel__field {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.swap-panel__input {
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

.swap-panel__max {
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

.swap-panel__amount {
  flex: 1;
  min-width: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.85);
  text-align: right;
}

.swap-flip {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  position: relative;
  z-index: 1;
}

.swap-flip__btn {
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

.swap-flip__icon {
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

.swap-rate {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.65);
}

.swap-confirm {
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
}
</style>
