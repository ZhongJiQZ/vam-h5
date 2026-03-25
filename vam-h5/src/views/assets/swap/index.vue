<!-- 兑换 -->
<template>
  <div class="swap-page">
    <DarkHeaderBar :title="_t18('swap')" :border_bottom="false" right="" />

    <div class="swap-page__body">
      <div class="swap-page__sheet">
        <div class="swap-page__sheet-bg" aria-hidden="true" />
        <div class="swap-page__panel">
          <div class="swap-card">
            <div class="swap-box swap-box--from">
              <p class="swap-balance">
                {{ _t18('swap_available') }}
                <span class="swap-balance__num ff-num">{{ priceFormat(availableAmount || 0) }}</span>
                {{ list1Current?.coin?.toLocaleUpperCase() }}
              </p>
              <div class="swap-row">
                <input
                  v-model="fromNum"
                  type="number"
                  class="swap-input ff-num"
                  :placeholder="_t18('swap_input')"
                />
                <div class="swap-row__meta">
                  <div class="swap-all" @click="fromNum = String(list1Current?.amount || '0')">
                    {{ _t18('swap_all') }}
                  </div>
                  <span class="swap-divider">|</span>
                  <div class="swap-coin" @click="showAction('from')">
                    {{ list1Current?.coin?.toLocaleUpperCase() }}
                    <div class="swap-coin__icon">
                      <image-load
                        v-if="list1Current?.icon?.length > 10"
                        :filePath="list1Current?.icon"
                        alt=""
                        class="swap-coin__img"
                      />
                      <svg-load v-else :name="list1Current?.icon" class="swap-coin__svg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="swap-fab-wrap">
              <button type="button" class="swap-fab" aria-label="swap" @click="jiaohuan()">
                <img :src="exchangeIcon" alt="" class="swap-fab__icon" />
              </button>
            </div>

            <div class="swap-box swap-box--to">
              <div class="swap-row">
                <input
                  v-model="toNum"
                  type="number"
                  disabled
                  class="swap-input swap-input--to ff-num"
                  :placeholder="_t18('swap_number')"
                />
                <div class="swap-row__meta">
                  <div class="swap-coin swap-coin--solo" @click="showAction('to')">
                    {{ list2Current?.coin?.toLocaleUpperCase() }}
                    <div class="swap-coin__icon">
                      <image-load
                        v-if="list2Current?.icon?.length > 10"
                        :filePath="list2Current?.icon"
                        alt=""
                        class="swap-coin__img"
                      />
                      <svg-load v-else :name="list2Current?.icon" class="swap-coin__svg" />
                    </div>
                  </div>
                </div>
              </div>
              <p class="swap-rate ff-num">
                {{ _t18('swap_rateDay') }}：1
                <span>{{ list1Current?.coin?.toLocaleUpperCase() }}</span>
                &nbsp;≈&nbsp;<span>{{ curRate }}</span>
                <span>{{ list2Current?.coin?.toLocaleUpperCase() }}</span>
              </p>
            </div>
          </div>

          <div class="swap-submit" @click="submit">
            {{ _t18('btnConfirm', ['bitmake']) }}
          </div>
        </div>
      </div>
    </div>

    <van-action-sheet
      v-model:show="showSheet"
      title=""
      id="sheetPopup"
      style="max-width: var(--ex-max-width); left: 50%; translate: -50%"
    >
      <div class="coinList">
        <div
          v-for="(item, index) in action"
          :key="item.id"
          class="coinItem"
          @click="selectCoin(item, index)"
        >
          <div class="svgImg">
            <image-load v-if="item?.icon?.length > 10" :filePath="item.icon" alt="" class="iconImg" />
            <svg-load v-else :name="item.icon" class="icon" />
          </div>
          <div>
            <p>{{ item.coin?.toLocaleUpperCase() }}</p>
          </div>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { DIFF_ISFREEZE } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
const { _isFreeze } = useFreeze()
import { showToast } from 'vant'
import { _t18 } from '@/utils/public'
import { useToast } from '@/hook/useToast'
const { _toast } = useToast()
import { rate, toExchange } from '@/api/account'
import { debounce } from 'lodash'
import { priceFormat } from '@/utils/decimal.js'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import exchangeIcon from '@/assets/images/swap/exchange.png'
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
const list1 = ref([])
const list2 = ref([])
const list1Current = ref({})
const list2Current = ref({})
const list1Coin = ref(0)
const list2Coin = ref(0)

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
        obj['icon'] = item.loge
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
$swap-top: #05101a;
$swap-green: #008710;
$swap-card-bg: #f6f7fa;
$swap-input-border: #e8e8e8;
$swap-btn-bg: #050e17;

.swap-page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.swap-page__body {
  background: $swap-top;
}

.swap-page__sheet {
  position: relative;
  z-index: 0;
  min-height: calc(100vh - 64px);
  border-radius: 16px 16px 0 0;
  background: #ffffff;
}

.swap-page__sheet-bg {
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -8px 32px rgba(5, 16, 26, 0.18);
  pointer-events: none;
}

.swap-page__panel {
  position: relative;
  z-index: 1;
  background: transparent;
  padding: 8px 15px 32px;
}

.swap-card {
  background: $swap-card-bg;
  border-radius: 22px;
  padding: 22px 18px 22px;
  box-shadow: 0 2px 14px rgba(5, 16, 26, 0.06);
}

.swap-box {
  background: #ffffff;
  border: 1px solid $swap-input-border;
  border-radius: 16px;
  padding: 16px 16px 18px;
}

.swap-balance {
  margin: 0 0 12px;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.swap-balance__num {
  margin: 0 4px;
  color: #666;
  font-weight: 500;
}

.swap-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 44px;
}

.swap-input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 17px;
  font-weight: 500;
  color: #333;

  &::placeholder {
    color: #bbb;
    font-weight: 400;
  }
}

.swap-input--to {
  font-size: 22px;
  font-weight: 700;
  color: #111;
}

.swap-row__meta {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
}

.swap-all {
  font-size: 14px;
  font-weight: 500;
  color: $swap-green;
  cursor: pointer;
  white-space: nowrap;
}

.swap-divider {
  font-size: 12px;
  color: #ccc;
}

.swap-coin {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
}

.swap-coin--solo {
  margin-left: auto;
}

.swap-coin__icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.swap-coin__svg {
  font-size: 22px;
}

.swap-coin__img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.swap-fab-wrap {
  display: flex;
  justify-content: center;
  margin: -14px 0;
  padding: 4px 0;
  position: relative;
  z-index: 2;
}

.swap-fab {
  width: 38px;
  height: 38px;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.swap-fab__icon {
  display: block;
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.swap-rate {
  margin: 14px 0 0;
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}

.swap-submit {
  margin-top: 28px;
  padding: 15px 20px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: $swap-btn-bg;
  border-radius: 999px;
  cursor: pointer;
}

.coinList {
  max-height: 250px;
}

.coinItem {
  display: flex;
  align-items: center;
  padding: 15px 0;
  flex: 1;
  background: var(--ex-default-background-color);

  div {
    flex: 1;
  }

  .svgImg {
    text-align: right;

    .icon {
      text-align: right;
      font-size: 30px;
    }

    .iconImg {
      width: 30px;
    }
  }

  p {
    font-size: 16px;
    color: var(--ex-passive-font-color);
  }

  & > div:first-child {
    text-align: end;
    margin-right: 5px;
  }

  & > div:last-child {
    text-align: start;
    margin-left: 5px;
  }
}

input:disabled {
  opacity: 1;
  -webkit-text-fill-color: #111;
}
</style>
