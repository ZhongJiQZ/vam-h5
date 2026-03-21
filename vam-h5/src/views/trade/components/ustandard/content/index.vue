 <!-- ustandard/content/index.vue -->
 
 <template>
  <div>
    <div class="content">
      <!-- 盘口信息 -->
      <div class="content_left">
        <Handicap :rows="8" :coinInfo="coinInfo" @setTradePrice="setTradePrice"></Handicap>
      </div>
      <!-- 下单 -->
      <div class="content_right">
        <!-- 市价/限价委托  杠杆倍数 -->
        <div class="rightFirst">
          <div class="left firstItem">
            <van-popover v-model:show="showPopover" :show-arrow="false">
              <div class="rightScondList">
                <!-- 市价委托 -->
                <div
                  class="rightScondListItem"
                  :class="transactionLabel ? 'hightBlue' : ''"
                  @click="onSelect(1)"
                >
                  {{ _t18(`bb_market_order`) }}
                </div>
                <!-- 限价委托 -->
                <div
                  class="rightScondListItem"
                  :class="!transactionLabel ? 'hightBlue' : ''"
                  @click="onSelect(0)"
                >
                  {{ _t18(`bb_Limit_order`) }}
                </div>
              </div>
              <template #reference>
                <div class="entrustSelect left">
                  <!-- transactionLabel ? '市价委托' : '限价委托'  -->
                  <div>
                    {{ transactionLabel ? _t18(`bb_market_order`) : _t18(`bb_Limit_order`) }}
                  </div>
                  <svg-load
                    :name="showPopover ? 'jiantou10x5-s' : 'jiantou10x5-x'"
                    class="img"
                  ></svg-load>
                </div>
              </template>
            </van-popover>
          </div>
          <div class="right firstItem">
            <van-popover v-model:show="showPopoverNum" :show-arrow="false">
              <div class="rightScondListNum" v-if="numList.length > 0">
                <div
                  v-for="item in numList"
                  :key="item.id"
                  class="rightScondListItem"
                  :class="item.name === transactionNum ? 'hightBlue' : ''"
                  @click="selectNum(item)"
                >
                  {{ item.name }}
                </div>
              </div>
              <template #reference>
                <div class="entrustSelect right">
                  <div class="fw-num">{{ transactionNum }}</div>
                  <svg-load v-if="!showPopoverNum" name="jiantou10x5-x" class="img"></svg-load>
                  <svg-load v-if="showPopoverNum" name="jiantou10x5-s" class="img"></svg-load>
                </div>
              </template>
            </van-popover>
          </div>
        </div>
        <!-- 市价占位 -->
        <div class="rightThird" v-if="transactionLabel">{{ _t18(`market_price`) }}</div>
        <!-- 市价委托：数量(手lots/张lots2) -->
        <div class="rightFifth" v-if="transactionLabel">
          <input
             @input="turnoverChange"
             type="text"
             inputmode="decimal"
            v-model.trim="delegateTotal"
            class="amount"
            :placeholder="`${_t18(`metastaking_bb_count`)}(${_t18(`lots`)})`"
          />
        </div>
        <!-- 限价委托：价格，数量 -->
        <div class="rightFifth" v-if="!transactionLabel">
          <!-- 价格 -->
          <input
            type="number"
            class="amount"
            v-model.trim="delegatePrice"
            :placeholder="_t18(`price`)"
          />
        </div>
        <div class="rightFifth" v-if="!transactionLabel">
          <!-- 数量(手lots/张lots2) -->
          <input
            type="text"
            inputmode="decimal"
            v-model.trim="delegateTotal"
            class="amount"
            :placeholder="`${_t18(`metastaking_bb_count`)}(${_t18(`lots`)})`"
          />
        </div>
        <!-- slider滑动条 -->
        <div class="rightFourth">
          <div class="lineBg">
            <div
              :class="
                sliderValue === 0 ? 'node' : index * 25 > sliderValue ? 'node' : 'node active'
              "
              v-for="(item, index) in 5"
              :key="index"
            ></div>
          </div>
          <van-slider v-model="sliderValue" active-color="#515151" inactive-color="#d9d9d9">
            <template #button>
              <div class="init">
                <div
                  :class="{
                    marl: sliderValue <= 3,
                    marr: sliderValue > 98
                  }"
                >
                  <div class="initimg"></div>
                  <div class="initNum ff-num">{{ sliderValue }}%</div>
                </div>
              </div>
            </template>
          </van-slider>
        </div>
        <!-- 可用 -->
        <div class="rightSix">
          <div>{{ _t18(`account_available`) }}</div>
          <div class="number fw-num">{{ availableBalance }} USDT</div>
        </div>
        <!-- 买入(做多)按钮 -->
        <div class="rightSeven">
          <div class="maybutton" @click="buyOrSell(0)">
            {{ _t18(`purchase`) }} ({{ _t18(`going_long`) }})
          </div>
        </div>
       <!-- 可开多 -->
      <div class="nineSix">
        <p>
          <!-- {{
            ['dev'].includes(_getConfig('_APP_ENV'))
              ? _t18('paxpay_openable_more', ['paxpay'])
              : _t18('paxpay_openable_more')
          }} -->
          {{ _t18('paxpay_openable_more') }}
        </p>
        <div class="number fw-num">
          {{ bearableValue ? _toFixed(bearableValue || 0, 3) : 0 }}
          {{
            coinInfo.customizeFlag === 2
              ? matchText(coinInfo.showSymbol, '/USDT')
              : coinInfo.coin?.toUpperCase()
          }}
        </div>
      </div>

        <!-- 保证金 -->
        <div class="nineSix">
          <div>{{ _t18(`cash_deposit`) }}</div>
          <div class="number fw-num">{{ _toFixed(marginValue, 4) }} USDT</div>
        </div>
        <!-- 合约面值 das特殊-->
        <div class="nineSix">
          <div>{{ _t18(`contract_face_value`, ['aams']) }}</div>
          <div class="number fw-num">
            {{ coinInfo.shareNumber }}
            <span v-if="['das'].includes(_getConfig('_APP_ENV'))">
              {{ coinInfo.customizeFlag === 2 ? matchText(coinInfo.showSymbol, '/USDT') : 'USDT' }}
            </span>
            <span v-else>
              {{
                coinInfo.customizeFlag === 2
                  ? matchText(coinInfo.showSymbol, '/USDT')
                  : coinInfo.coin?.toUpperCase()
              }}
            </span>
            /{{ _t18(`lots`) }}
          </div>
        </div>
        <!-- 卖出(开空)按钮 type == 1 -->
        <div class="rightSeven">
          <div class="maybutton hightColorRed" @click="buyOrSell(1)">
            {{ _t18(`bb_sell1`) }} ({{ _t18(`open_short`) }})
          </div>
        </div>
        <!-- 可开空 -->
      <div class="nineSix">
        <p>
          {{
            ['paxpay'].includes(_getConfig('_APP_ENV'))
              ? _t18('paxpay_openable_less', ['paxpay'])
              : _t18('paxpay_openable_less')
          }}
        </p>
        <div class="number fw-num">
          {{ bearableValue ? _toFixed(bearableValue, 4) : 0 }}
          {{
            coinInfo.customizeFlag === 2
              ? matchText(coinInfo.showSymbol, '/USDT')
              : coinInfo.coin?.toUpperCase()
          }}
        </div>
      </div>
        <!-- 保证金 -->
        <div class="nineSix">
          <div>{{ _t18(`cash_deposit`) }}</div>
          <div class="number fw-num">{{ _toFixed(marginValue, 4) }} USDT</div>
        </div>
        <!-- 合约面值 das特殊 -->
        <div class="nineSix">
          <div>{{ _t18(`contract_face_value`, ['aams']) }}</div>
          <div class="number fw-num">
            {{ coinInfo.shareNumber }}
            <span v-if="['das'].includes(_getConfig('_APP_ENV'))">
              {{ coinInfo.customizeFlag === 2 ? matchText(coinInfo.showSymbol, '/USDT') : 'USDT' }}
            </span>
            <span v-else>
              {{
                coinInfo.customizeFlag === 2
                  ? matchText(coinInfo.showSymbol, '/USDT')
                  : coinInfo.coin?.toUpperCase()
              }}
            </span>
            /{{ _t18(`lots`) }}
          </div>
        </div>
      </div>
    </div>
    <div class="line"></div>
    <!-- 订单 -->
    <!-- 订单信息 -->
    <OrderListBox
      ref="orderListBoxRef"
      :coinInfo="coinInfo"
      :availableBalance="availableBalance"
    ></OrderListBox>
  </div>
</template>

<script setup>
import { _mul, _div, _toFixed } from '@/utils/decimal'
import { DIFF_ISFREEZE } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
const { _isFreeze } = useFreeze()

import Handicap from '../../common/handicap.vue'
import OrderListBox from './OrderList.vue'
import { _t18 } from '@/utils/public'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useToast } from '@/hook/useToast'
const { _toast } = useToast()

import { useMainStore } from '@/store/index'
const mainStore = useMainStore()

import { matchText, formatCurrentcurrency } from '@/utils/filters'
import {
  submitUcontract,
  contractHistoryList,
  contractLossList,
  orderList
} from '@/api/trade/index'

import { useTradeStore } from '@/store/trade'
const tradeStore = useTradeStore()

import { useUserStore } from '@/store/user/index'
const userStore = useUserStore()
const { asset } = storeToRefs(userStore)

import { socketDict } from '@/config/dict'
import PubSub from 'pubsub-js'

const orderListBoxRef = ref(null)

const props = defineProps({
  coinInfo: {
    type: Object,
    default: () => ({})
  }
})

const coinPriceInfo = computed(() => {
  return tradeStore.allCoinPriceInfo[props.coinInfo.coin] || {}
})

const delegateTotal = ref('') // 数量（手）
const delegatePrice = ref('') // 价格（限价）
const sliderValue = ref(0) // 滑块百分比
const marginValue = ref('0') // 保证金

/**
 * 下单数量精度
 * 如果你的后台只允许整数手，改成 0
 * 如果允许 0.001 手，保持 3
 */
const LOT_SCALE = 3

/**
 * 是否只允许整数手
 * 如果后台只允许整数，下成 true
 */
const ONLY_INTEGER_LOT = false

/**
 * 可用余额
 */
const availableBalance = computed(() => {
  const cur = asset.value.filter((item) => item.type === 3)
  if (cur.length > 0) {
    return cur[0].availableAmount
  }
  return ''
})

/**
 * 市价 / 限价
 */
const showPopover = ref(false)
const transactionLabel = ref(1) // 1 市价，0 限价

const onSelect = (item) => {
  transactionLabel.value = item
  showPopover.value = false
  delegateTotal.value = ''
  delegatePrice.value = ''
  sliderValue.value = 0
}

/**
 * 限价委托：设置交易价格
 */
const setTradePrice = (val) => {
  delegatePrice.value = !transactionLabel.value ? val : ''
}

const contractObj = ref({})

/**
 * 杠杆
 */
const showPopoverNum = ref(false)
const transactionNum = ref(null)
const numList = ref([])

const selectNum = (item) => {
  transactionNum.value = item.name
  showPopoverNum.value = false
}

/**
 * 工具函数
 */
const toNum = (val, def = 0) => {
  const n = Number(val)
  return Number.isFinite(n) ? n : def
}

const floorTo = (num, scale = 3) => {
  const n = toNum(num)
  if (!Number.isFinite(n) || n <= 0) return 0
  const factor = Math.pow(10, scale)
  return Math.floor(n * factor) / factor
}

const getLeverage = () => {
  const item = numList.value.find((e) => e.name === transactionNum.value)
  return toNum(item?.id, 0)
}

const getTradePrice = () => {
  return toNum(transactionLabel.value ? coinPriceInfo.value.close : delegatePrice.value, 0)
}

const getOpenFeeRate = () => {
  // 后端 tContractCoin.getOpenFee()
  return toNum(contractObj.value?.openFee, 0)
}

const getShareNumber = () => {
  return toNum(props.coinInfo.shareNumber || contractObj.value?.shareNumber, 0)
}

const formatLotValue = (num) => {
  if (ONLY_INTEGER_LOT) {
    return String(Math.floor(toNum(num, 0)))
  }
  return String(floorTo(num, LOT_SCALE))
}

/**
 * 数量输入限制
 * 支持：
 * - 整数
 * - 小数（最多 LOT_SCALE 位）
 */
const turnoverChange = () => {
  let val = delegateTotal.value

  if (val === '' || val === null || val === undefined) return
  val = String(val)

  // 只保留数字和小数点
  val = val.replace(/[^\d.]/g, '')

  // 只保留第一个小数点
  const firstDot = val.indexOf('.')
  if (firstDot !== -1) {
    val = val.slice(0, firstDot + 1) + val.slice(firstDot + 1).replace(/\./g, '')
  }

  if (val === '.') val = '0.'

  const dotIndex = val.indexOf('.')

  if (ONLY_INTEGER_LOT) {
    // 只允许整数
    if (dotIndex !== -1) {
      val = val.slice(0, dotIndex)
    }
    val = val.replace(/^0+(?=\d)/, '')
    delegateTotal.value = val
    return
  }

  // 小数位限制
  if (dotIndex !== -1) {
    const intPart = val.slice(0, dotIndex)
    const decPart = val.slice(dotIndex + 1).slice(0, LOT_SCALE)
    val = (intPart === '' ? '0' : intPart) + '.' + decPart
  }

  // 前导 0 处理
  if (dotIndex === -1) {
    val = val.replace(/^0+(?=\d)/, '')
  } else {
    val = val.replace(/^0+(?=\.)/, '0')
  }

  delegateTotal.value = val
}

/**
 * 切换币种：重置价格、数量、杠杆
 */
watch(
  () => props.coinInfo.coin,
  (n) => {
    delegateTotal.value = ''
    setTradePrice()
    sliderValue.value = 0
    marginValue.value = '0'

    if (tradeStore.contractCoinList.length) {
      numList.value = []
      transactionNum.value = ''
      let newcoin = {}

      tradeStore.contractCoinList.forEach((element) => {
        if (element.coin === n) {
          contractObj.value = element
          newcoin = element
        }
      })

      if (newcoin?.leverage) {
        newcoin.leverage.split(',').forEach((ele) => {
          numList.value.push({
            name: ele + 'X',
            id: ele
          })
        })
      }

      transactionNum.value = numList.value[0]?.name || ''
    }
  },
  { immediate: true }
)

/**
 * 监听价格
 */
watch(
  () => delegatePrice.value,
  (n) => {
    if (n) {
      if (!/^[1-9]\d*(\.\d{1,6})?$|^0(\.\d{1,6})?$/.test(n) || Number(n) === 0) {
        return _toast('Please_entera_price_greater')
      }
    } else {
      if (!transactionLabel.value) {
        sliderValue.value = 0
        delegateTotal.value = ''
      }
    }
  }
)

/**
 * 最大可开手数
 * 后端逻辑：
 * shareAmount = shareNumber * delegateTotal
 * totalOrderAmount = shareAmount * delegatePrice
 * marginAmount = totalOrderAmount / leverage
 * openFee = openFeeRate * totalOrderAmount
 *
 * 每1手成本：
 * oneLotCost = price * shareNumber * (1 / leverage + openFeeRate)
 */
const bearableValue = computed(() => {
  const balance = toNum(availableBalance.value, 0)
  const price = getTradePrice()
  const leverage = getLeverage()
  const shareNumber = getShareNumber()
  const openFeeRate = getOpenFeeRate()

  if (!balance || !price || !leverage || !shareNumber) return 0

  const oneLotCost = price * shareNumber * (1 / leverage + openFeeRate)
  if (oneLotCost <= 0) return 0

  if (ONLY_INTEGER_LOT) {
    return Math.floor(balance / oneLotCost)
  }

  return floorTo(balance / oneLotCost, LOT_SCALE)
})

/**
 * 滑块联动数量
 * 直接基于 bearableValue，避免和页面显示不一致
 */
watch(
  () => sliderValue.value,
  (n) => {
    const maxLots = toNum(bearableValue.value, 0)

    if (!maxLots) {
      delegateTotal.value = ''
      return
    }

    const calcLots = (maxLots * toNum(n, 0)) / 100

    if (ONLY_INTEGER_LOT) {
      delegateTotal.value = String(Math.floor(calcLots))
    } else {
      delegateTotal.value = formatLotValue(calcLots)
    }
  }
)

/**
 * 杠杆变化时，如果滑块已有值，重新带出数量
 */
watch(
  () => transactionNum.value,
  () => {
    const maxLots = toNum(bearableValue.value, 0)

    if (!getTradePrice()) {
      sliderValue.value = 0
      delegateTotal.value = ''
      return
    }

    if (!sliderValue.value) {
      delegateTotal.value = ''
      return
    }

    const calcLots = (maxLots * toNum(sliderValue.value, 0)) / 100

    if (ONLY_INTEGER_LOT) {
      delegateTotal.value = String(Math.floor(calcLots))
    } else {
      delegateTotal.value = formatLotValue(calcLots)
    }
  }
)

/**
 * 保证金
 * 保证金 = 价格 * 数量 * 合约面值 / 杠杆倍数
 * 用实际下单价：
 * - 市价：最新价
 * - 限价：delegatePrice
 */
watch(
  [() => delegateTotal.value, () => delegatePrice.value, () => transactionLabel.value, () => transactionNum.value],
  () => {
    const lots = toNum(delegateTotal.value, 0)
    const leverage = getLeverage()
    const shareNumber = getShareNumber()
    const price = getTradePrice()

    if (!lots || !leverage || !shareNumber || !price) {
      marginValue.value = '0'
      return
    }

    if (['das'].includes(__config._APP_ENV)) {
      marginValue.value = _toFixed(lots * shareNumber, 6)
      return
    }

    const margin = (price * lots * shareNumber) / leverage
    marginValue.value = _toFixed(margin, 6)
  },
  { immediate: true }
)

/**
 * 初始化杠杆倍数
 */
const init = () => {
  if (tradeStore.contractCoinList.length) {
    numList.value = []
    transactionNum.value = ''

    tradeStore.contractCoinList.forEach((element) => {
      if (element.coin === props.coinInfo.coin) {
        contractObj.value = element
        if (element.leverage) {
          element.leverage.split(',').forEach((lev) => {
            numList.value.push({
              name: lev + 'X',
              id: lev
            })
          })
        }
        transactionNum.value = numList.value[0]?.name || ''
      }
    })
  }
}

/**
 * 买入/卖出
 */
const buyOrSellForm = (type) => {
  let typeId = ''
  numList.value.forEach((element) => {
    if (element.name === transactionNum.value) {
      typeId = element.id
    }
  })

  const tradePrice = transactionLabel.value ? coinPriceInfo.value.close : delegatePrice.value

  let data = {
    symbol: props.coinInfo.coin,
    leverage: typeId,
    delegatePrice: tradePrice,
    delegateTotal: delegateTotal.value,
    type: type, // 0 买入(做多) 1 卖出(开空)
    delegateType: transactionLabel.value // 1 市价 0 限价（按你当前原逻辑保持不动）
  }

  if (
    !/^[1-9]\d*(\.\d{1,6})?$|^0(\.\d{1,6})?$/.test(String(data.delegatePrice)) ||
    Number(data.delegatePrice) === 0
  ) {
    return _toast('Please_entera_price_greater')
  }

  if (!data.delegateTotal || Number(data.delegateTotal) <= 0) {
    return _toast('quantitycan_onlyenter_integers')
  }

  if (ONLY_INTEGER_LOT) {
    if (!/^[1-9]\d*$/.test(String(data.delegateTotal))) {
      return _toast('quantitycan_onlyenter_integers')
    }
  } else {
    const reg = new RegExp(`^(?:0|[1-9]\\d*)(?:\\.\\d{1,${LOT_SCALE}})?$`)
    if (!reg.test(String(data.delegateTotal))) {
      return _toast('quantitycan_onlyenter_integers')
    }
  }

  try {
    showLoadingToast({
      forbidClick: true,
      duration: 0
    })

    submitUcontract(data).then((res) => {
      if (res.code === 200) {
        _toast('quote_addSuccess')
        orderListBoxRef.value?.handelRefresh?.()
        userStore.getUserInfo()
      } else {
        closeToast()
        showToast(res.msg)
      }
    })
  } catch (error) {
    closeToast()
  }
}

const buyOrSell = (type) => {
  if (DIFF_ISFREEZE.includes(__config._APP_ENV)) {
    if (_isFreeze(DIFF_ISFREEZE)) {
      buyOrSellForm(type)
    }
  } else {
    buyOrSellForm(type)
  }
}

onMounted(() => {
  init()
})

/**
 * 当前持仓 / 当前委托 / 止盈止损 / 历史委托
 */
const trusetList = ref([
  {
    name: _t18(`current_position`, ['latcoin']),
    num: 0,
    show: true
  },
  {
    name: _t18(`exchange_curentrust`, ['bitmake', 'ebc', 'latcoin']),
    num: 0,
    show: true
  },
  {
    name: _t18(`profit_loss`, ['paxpay', 'latcoin', 'aams']),
    num: 0,
    show: true
  },
  {
    name: ['coinsexpto'].includes(__config._APP_ENV)
      ? _t18(`exchange_hisentrust2`)
      : _t18(`exchange_hisentrust`, ['bitmake', 'ebc', 'latcoin']),
    num: 0,
    show: true
  }
])

/**
 * 更新用户
 */
const updateUser = () => {
  userStore.getUserInfo()
}

/**
 * 订单结算，更新订单和用户信息
 */
const coinOverKey = ref('')
const settlementKey = ref('')

const coinOverNotification = () => {
  coinOverKey.value = PubSub.subscribe(socketDict.POSITION, (key, data) => {
    const { position } = JSON.parse(data.date.message)
    if (position) {
      orderListBoxRef.value?.init?.()
      updateUser()
    }
  })

  settlementKey.value = PubSub.subscribe(socketDict.SETTLEMENT, (key, data) => {
    const { type } = JSON.parse(data.date.message)
    if (type == 2) {
      orderListBoxRef.value?.init?.()
      updateUser()
    }
  })
}

coinOverNotification()

onUnmounted(() => {
  settlementKey.value && PubSub.unsubscribe(settlementKey.value)
  coinOverKey.value && PubSub.unsubscribe(coinOverKey.value)
})
</script>

<style lang="scss" scoped>
.hightBlue {
  color: var(--ex-font-color2) !important;
}
.hightColorRed {
  color: var(--ex-font-color) !important;
  background-color: var(--ex-div-bgColor7) !important;
}
.content {
  display: flex;
  padding: 20px 15px;
}
.content_right {
  flex: 1;
  .rightFirst {
    height: 33px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    .firstItem {
      background: var(--ex-div-bgColor);
      border-radius: 2px 2px 2px 2px;
    }
    .left {
      width: 104px;
    }
    .right {
      width: 66px;
    }
    .entrustSelect {
      // background: var(--ex-default-background-color);
      padding: 0 10px;
      height: 33px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      color: var(--ex-default-font-color);

      .img {
        width: 10px;
        height: 5px;
      }
    }
    .entrustSelect2 {
      justify-content: center;
    }
  }
  .rightThird {
    margin-top: 10px;
    width: 180px;
    height: 33px;
    background: var(--ex-div-bgColor5);
    border-radius: 2px 2px 2px 2px;
    font-size: 12px;
    color: var(--ex-font-color1);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .rightFourth {
    margin-top: 25px;
    width: 180px;
    position: relative;
    .lineBg {
      position: absolute;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 0;
      .node {
        width: 11px;
        height: 11px;
        background: var(--ex-div-bgColor3);
        margin-top: -5px;
        transform: rotate(45deg);
      }
      .active {
        background: var(--ex-div-bgColor4);
      }
    }
    .init {
      .marl {
        margin-left: 11px;
        .initNum {
          margin-left: 22px;
        }
      }
      .marr {
        margin-right: 11px;
        .initNum {
          margin-right: 11px;
        }
      }
      .initimg {
        width: 12px;
        height: 12px;
        background: var(--ex-div-bgColor4);
        transform: scaleY(0.5) rotate(45deg) !important;
        position: relative;
      }
      .initNum {
        transform: scaleY(0.5);
        margin-top: 8px;
        font-size: 12px;
        color: var(--ex-font-color);
        padding: 3px 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ex-div-bgColor19);
        border-radius: 1px;
        position: absolute;
        top: -20px;
        left: -20px;
      }
    }
  }
  .rightFifth {
    margin-top: 10px;
    .amount {
      width: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 33px;
      background: var(--ex-div-bgColor);
      border-radius: 2px;
      font-size: 12px;
      color: var(--ex-default-font-color);
      text-align: center;
    }
    input::-webkit-input-placeholder {
      color: var(--ex-font-color1);
    }
    input::-moz-input-placeholder {
      color: var(--ex-font-color1);
    }
    input::-ms-input-placeholder {
      color: var(--ex-font-color1);
    }
  }
  .rightSix {
    margin-top: 25px;
    flex: 1;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--ex-passive-font-color);
    .number {
      color: var(--ex-default-font-color);
    }
  }
  .rightSeven {
    margin-top: 16px;
    .maybutton {
      height: 40px;
      background: var(--ex-div-bgColor1);
      border-radius: 3px 3px 3px 3px;
      font-size: 14px;
      color: var(--ex-font-color);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .nineSix {
    margin-top: 15px;
    flex: 1;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--ex-passive-font-color);
    .number {
      text-align: right;
      color: var(--ex-default-font-color);
    }
  }
}
// 市价/限价下拉框
.rightScondList {
  width: 104px;
  // margin-top: 3px;
  background-color: var(--ex-default-background-color);
  padding: 5px 0;
  font-size: 12px;
  color: var(--ex-passive-font-color);
  .rightScondListItem {
    padding: 10px 0;
    text-align: center;
  }
}
.rightScondListNum {
  width: 66px;
  // margin-top: 3px;
  background-color: var(--ex-default-background-color);
  padding: 5px 0;
  font-size: 12px;
  color: var(--ex-passive-font-color);
  .rightScondListItem {
    padding: 10px 0;
    text-align: center;
  }
}
:deep(.van-slider) {
  z-index: 2;
  height: 1px;
  top: -1px;
  .van-slider__bar {
    transform: scaleY(2);
  }
}
.line {
  height: 5px;
  background: var(--ex-div-bgColor10);
}
.entrust {
  position: relative;
}
:deep(.van-tabs__nav) {
  padding-right: 80px;
}
.entrustR {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #fff;
  padding: 15px 5px;
  .entrustRImg {
    padding: 0 8px;
    font-size: 12px;
  }
}
</style>
