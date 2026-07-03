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
            <div class="entrustSelect right leverage-trigger" @click="openLeveragePicker">
              <div class="fw-num">{{ leverageValue }}X</div>
              <svg-load name="jiantou10x5-x" class="img"></svg-load>
            </div>
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
            @input="turnoverChange"
            type="text"
            inputmode="decimal"
            v-model.trim="delegateTotal"
            class="amount"
            :placeholder="`${_t18(`metastaking_bb_count`)}(${_t18(`lots`)})`"
          />
        </div>
        <!-- slider滑动条 -->
        <div class="rightFourth">
          <div class="slider-fixed-percent">{{ sliderValue }}%</div>
          <div class="lineBg">
            <div
              :class="
                sliderValue === 0 ? 'node' : index * 25 > sliderValue ? 'node' : 'node active'
              "
              v-for="(item, index) in 5"
              :key="index"
            ></div>
          </div>
          <van-slider
            v-model="sliderValue"
            active-color="#515151"
            inactive-color="#d9d9d9"
            :step="1"
            @drag-start="onSliderDragStart"
            @drag-end="onSliderDragEnd"
            @change="onSliderChangeCommit"
          >
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

    <!-- 杠杆拖动选择 -->
    <van-popup v-model:show="showLeveragePicker" position="bottom" round>
      <div class="leverage-sheet">
        <div class="leverage-sheet__head">
          <span>{{ _t18('paxpay_trade_top_tab5') }}</span>
          <button type="button" class="leverage-sheet__close" @click="showLeveragePicker = false">×</button>
        </div>
        <div class="leverage-sheet__value-row">
          <button type="button" class="leverage-step-btn" :disabled="leverageDraft <= minLeverage" @click="stepLeverage(-1)">−</button>
          <p class="leverage-sheet__value ff-num">{{ leverageDraft }}X</p>
          <button type="button" class="leverage-step-btn" :disabled="leverageDraft >= maxLeverage" @click="stepLeverage(1)">+</button>
        </div>
        <div class="leverage-sheet__range ff-num">{{ minLeverage }}X — {{ maxLeverage }}X</div>
        <div class="leverage-sheet__slider-wrap">
          <van-slider
            v-model="leverageDraft"
            :min="minLeverage"
            :max="maxLeverage"
            :step="1"
            active-color="#9b4dff"
            inactive-color="rgba(255, 255, 255, 0.12)"
            @change="applyLeverageDraft"
          >
            <template #button>
              <div class="leverage-slider-btn"></div>
            </template>
          </van-slider>
          <div class="leverage-sheet__marks">
            <button
              v-for="mark in leverageScaleMarks"
              :key="mark"
              type="button"
              class="leverage-sheet__mark"
              :class="{ active: leverageDraft === mark }"
              :style="{ left: leverageMarkLeft(mark) }"
              @click="setLeverageDraft(mark)"
            >
              {{ mark }}x
            </button>
          </div>
        </div>
        <div class="leverage-sheet__presets">
          <button
            v-for="mark in leveragePresets"
            :key="'preset-' + mark"
            type="button"
            class="leverage-preset-btn"
            :class="{ active: leverageDraft === mark }"
            @click="setLeverageDraft(mark)"
          >
            {{ mark }}X
          </button>
        </div>
        <button type="button" class="leverage-sheet__confirm" @click="confirmLeverage">
          {{ _t18('btnConfirm') }}
        </button>
      </div>
    </van-popup>
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
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import { useToast } from '@/hook/useToast'
import { useI18n } from 'vue-i18n'
const { _toast } = useToast()
const { t: i18nT } = useI18n()

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
/** 当 slider 由用户手动输入数量推出来时打开，跳过 sliderValue watch 中对 delegateTotal 的反算，避免覆盖用户输入 */
const sliderFromInput = ref(false)

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
 * 工具函数
 */
const toNum = (val, def = 0) => {
  const n = Number(val)
  return Number.isFinite(n) ? n : def
}

/** 拖动轴 step=1；点击轨道时吸附 0/25/50/75/100（change 在拖动过程中仅在结束时触发，且先于 drag-end，配合 drag-start 区分点击轨与拖动） */
const sliderDragActive = ref(false)
const onSliderDragStart = () => {
  sliderDragActive.value = true
}
const onSliderDragEnd = () => {
  sliderDragActive.value = false
}
const onSliderChangeCommit = (val) => {
  if (sliderDragActive.value) return
  const n = toNum(val, 0)
  const snapped = Math.min(100, Math.max(0, Math.round(n / 25) * 25))
  if (snapped !== n) {
    sliderValue.value = snapped
  }
}

const floorTo = (num, scale = 3) => {
  const n = toNum(num)
  if (!Number.isFinite(n) || n <= 0) return 0
  const factor = Math.pow(10, scale)
  return Math.floor(n * factor) / factor
}

function parseLeverageConfig(leverageStr) {
  const raw = String(leverageStr || '').trim()
  const tokens = raw
    ? raw.includes(',')
      ? raw.split(',')
      : /\d+\.\d+\.\d+/.test(raw)
        ? raw.split('.')
        : [raw]
    : []
  const presets = tokens
    .map((s) => Number(String(s).trim().replace(/x$/i, '')))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)
  if (!presets.length) {
    return { min: 1, max: 1, presets: [1] }
  }
  return {
    min: presets[0],
    max: presets[presets.length - 1],
    presets
  }
}

function buildLeverageScaleMarks(min, max) {
  const step = 25
  const lo = toNum(min, 1)
  const hi = toNum(max, lo)
  if (hi <= lo) return [lo]
  if (hi < step) return [lo, hi].filter((v, i, arr) => arr.indexOf(v) === i)

  const marks = []
  for (let v = step; v < hi; v += step) {
    if (v >= lo) marks.push(v)
  }
  if (!marks.length || marks[marks.length - 1] !== hi) {
    marks.push(hi)
  }
  return marks
}

function snapToLeveragePreset(val, presets) {
  const list = presets?.length ? presets : [1]
  const n = Number(val)
  const num = Number.isFinite(n) ? n : list[0]
  if (list.includes(num)) return num
  let nearest = list[0]
  let minDiff = Math.abs(num - nearest)
  for (const p of list) {
    const diff = Math.abs(num - p)
    if (diff < minDiff) {
      minDiff = diff
      nearest = p
    }
  }
  return nearest
}

function applyLeverageFromCoin(coinItem) {
  const { min, max, presets } = parseLeverageConfig(coinItem?.leverage)
  minLeverage.value = min
  maxLeverage.value = max
  leveragePresets.value = presets
  const current = toNum(leverageValue.value, 0)
  leverageValue.value = snapToLeveragePreset(
    !current || current < min || current > max ? presets[0] : current,
    presets
  )
  leverageDraft.value = leverageValue.value
}

/**
 * 杠杆（拖动选择 1 ~ 后台最大杠杆）
 */
const showLeveragePicker = ref(false)
const leverageValue = ref(1)
const leverageDraft = ref(1)
const minLeverage = ref(1)
const maxLeverage = ref(1)
const leveragePresets = ref([1])

const leverageScaleMarks = computed(() =>
  buildLeverageScaleMarks(minLeverage.value, maxLeverage.value)
)

const openLeveragePicker = () => {
  leverageDraft.value = leverageValue.value
  showLeveragePicker.value = true
}

const setLeverageDraft = (val) => {
  const n = Math.min(maxLeverage.value, Math.max(minLeverage.value, toNum(val, minLeverage.value)))
  leverageDraft.value = n
}

const stepLeverage = (delta) => {
  setLeverageDraft(leverageDraft.value + delta)
}

const applyLeverageDraft = (val) => {
  setLeverageDraft(val)
}

const confirmLeverage = () => {
  leverageValue.value = leverageDraft.value
  showLeveragePicker.value = false
}

const leverageMarkLeft = (mark) => {
  const min = minLeverage.value
  const max = maxLeverage.value
  if (max <= min) return '0%'
  const pct = ((toNum(mark, min) - min) / (max - min)) * 100
  return `calc(${pct}% - 12px)`
}

const getLeverage = () => toNum(leverageValue.value, 0)

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
    const maxLotsInt = toNum(bearableValue.value, 0)
    const numValInt = toNum(val, 0)
    if (maxLotsInt > 0 && numValInt > maxLotsInt) {
      val = formatLotValue(maxLotsInt)
    } else if (maxLotsInt <= 0 && numValInt > 0) {
      val = ''
    }
    delegateTotal.value = val
    // 输入数量 → 自动算滑块
    const lotsInt = toNum(val, 0)
    if (maxLotsInt > 0 && lotsInt > 0) {
      const pct = Math.round((lotsInt / maxLotsInt) * 100)
      const clamped = Math.min(100, Math.max(0, pct))
      if (clamped !== sliderValue.value) {
        sliderFromInput.value = true
        sliderValue.value = clamped
      }
    } else if (lotsInt === 0 && sliderValue.value !== 0) {
      sliderFromInput.value = true
      sliderValue.value = 0
    }
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

  const maxLots = toNum(bearableValue.value, 0)
  const numVal = toNum(val, 0)
  if (maxLots > 0 && numVal > maxLots) {
    val = formatLotValue(maxLots)
  } else if (maxLots <= 0 && numVal > 0) {
    val = ''
  }

  delegateTotal.value = val

  // 输入数量 → 自动算滑块百分比 (打 sliderFromInput 标，让 watch 跳过反算保留原值)
  const lotsForRatio = toNum(val, 0)
  if (maxLots > 0 && lotsForRatio > 0) {
    const pct = Math.round((lotsForRatio / maxLots) * 100)
    const clamped = Math.min(100, Math.max(0, pct))
    if (clamped !== sliderValue.value) {
      sliderFromInput.value = true
      sliderValue.value = clamped
    }
  } else if (lotsForRatio === 0 && sliderValue.value !== 0) {
    sliderFromInput.value = true
    sliderValue.value = 0
  }
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
      let newcoin = {}

      tradeStore.contractCoinList.forEach((element) => {
        if (element.coin === n) {
          contractObj.value = element
          newcoin = element
        }
      })

      if (newcoin?.coin) {
        applyLeverageFromCoin(newcoin)
      }
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
    // 由用户手动输入数量推出来的 slider 变化：跳过反算，保留用户原值
    if (sliderFromInput.value) {
      sliderFromInput.value = false
      return
    }
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
  () => leverageValue.value,
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
  [() => delegateTotal.value, () => delegatePrice.value, () => transactionLabel.value, () => leverageValue.value],
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
    tradeStore.contractCoinList.forEach((element) => {
      if (element.coin === props.coinInfo.coin) {
        contractObj.value = element
        applyLeverageFromCoin(element)
      }
    })
  }
}

/**
 * 买入/卖出
 */
const buyOrSellForm = async (type) => {
  const pickMsg = (obj) =>
    obj?.msg || obj?.data?.msg || obj?.response?.data?.msg || obj?.message || ''
  let loadingToast = null

  const tradePrice = transactionLabel.value ? coinPriceInfo.value.close : delegatePrice.value

  const data = {
    symbol: props.coinInfo.coin,
    leverage: String(leverageValue.value),
    delegatePrice: tradePrice,
    delegateTotal: delegateTotal.value,
    type: type, // 0 买入(做多) 1 卖出(开空)
    delegateType: transactionLabel.value, // 1 市价 0 限价（按你当前原逻辑保持不动）
    confirmPriceChange: false
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
    loadingToast = showLoadingToast({
      forbidClick: true,
      duration: 0
    })
    const res = await submitUcontract(data)
    if (Number(res?.code) === 200) {
      _toast('quote_addSuccess')
      orderListBoxRef.value?.handelRefresh?.()
      userStore.getUserInfo()
      return
    }

    const needPriceConfirm = Number(res?.code) === 601
    if (!needPriceConfirm) {
      showToast({
        message: pickMsg(res) || '下单失败',
        duration: 4000
      })
      return
    }

    loadingToast?.close?.()
    loadingToast = null
    await showConfirmDialog({
      title: _t18('contract_price_confirm_title'),
      message: pickMsg(res),
      className: 'uc-price-confirm-dialog',
      width: '320px',
      showCancelButton: true,
      confirmButtonText: i18nT('utils.confirm') || '确认',
      cancelButtonText: i18nT('utils.cancel') || '取消'
    })

    loadingToast = showLoadingToast({
      forbidClick: true,
      duration: 1500
    })
    const confirmRes = await submitUcontract({
      ...data,
      confirmPriceChange: true
    })
    if (Number(confirmRes?.code) === 200) {
      _toast('quote_addSuccess')
      orderListBoxRef.value?.handelRefresh?.()
      userStore.getUserInfo()
      return
    }
    showToast({
      message: pickMsg(confirmRes) || '下单失败',
      duration: 2000
    })
  } catch (error) {
    // 用户主动取消确认弹窗，不提示
    const isCancelAction = error === 'cancel' || error?.message === 'cancel'
    if (isCancelAction) return
    const errRes = error?.data || error?.response?.data
    const needPriceConfirmInCatch = Number(errRes?.code) === 601
    if (needPriceConfirmInCatch) {
      loadingToast?.close?.()
      loadingToast = null
      try {
        await showConfirmDialog({
          title: _t18('contract_price_confirm_title'),
          message: pickMsg(errRes),
          className: 'uc-price-confirm-dialog',
          width: '320px',
          showCancelButton: true,
          confirmButtonText: i18nT('utils.confirm') || '确认',
          cancelButtonText: i18nT('utils.cancel') || '取消'
        })
        loadingToast = showLoadingToast({
          forbidClick: true,
          duration: 1500
        })
        const confirmRes = await submitUcontract({
          ...data,
          confirmPriceChange: true
        })
        if (Number(confirmRes?.code) === 200) {
          _toast('quote_addSuccess')
          orderListBoxRef.value?.handelRefresh?.()
          userStore.getUserInfo()
          return
        }
        showToast({
          message: pickMsg(confirmRes) || '下单失败',
          duration: 2000
        })
      } catch (confirmError) {}
      return
    }
    const errMsg = pickMsg(error)
    showToast({
      message: errMsg || '下单失败',
      duration: 4000
    })
  } finally {
    loadingToast?.close?.()
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

.leverage-trigger {
  cursor: pointer;
}
</style>

<!-- 杠杆弹层 (van-popup Teleport 到 body，需全局样式) -->
<style lang="scss">
.leverage-sheet {
  padding: 16px 16px calc(20px + env(safe-area-inset-bottom, 0px));
  color: #f5f3f8;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #f5f3f8;
  }

  &__close {
    border: none;
    background: transparent;
    font-size: 24px;
    line-height: 1;
    color: #aaa5b3;
    padding: 0 4px;
  }

  &__value-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 6px;
  }

  &__value {
    margin: 0;
    min-width: 72px;
    text-align: center;
    font-size: 32px;
    font-weight: 700;
    color: #9b4dff;
  }

  &__range {
    text-align: center;
    font-size: 12px;
    color: #aaa5b3;
    margin-bottom: 18px;
  }

  &__slider-wrap {
    position: relative;
    padding: 8px 8px 28px;
    margin-bottom: 14px;

    .van-slider {
      height: 4px;
    }
  }

  &__marks {
    position: relative;
    height: 22px;
    margin-top: 10px;
    padding: 0 4px;
  }

  &__mark {
    position: absolute;
    transform: translateX(-50%);
    border: none;
    background: transparent;
    font-size: 10px;
    color: #625d6d;
    padding: 0 2px;
    white-space: nowrap;

    &.active {
      color: #9b4dff;
      font-weight: 600;
    }
  }

  &__presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__confirm {
    width: 100%;
    height: 44px;
    border: none;
    border-radius: 8px;
    background: #9b4dff;
    color: #fff;
    font-size: 15px;
    font-weight: 600;

    &:active {
      background: #8a3de8;
    }
  }
}

.leverage-step-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #171225;
  font-size: 20px;
  line-height: 1;
  color: #f5f3f8;

  &:disabled {
    opacity: 0.4;
  }

  &:active:not(:disabled) {
    background: rgba(155, 77, 255, 0.16);
    border-color: rgba(155, 77, 255, 0.35);
  }
}

.leverage-preset-btn {
  min-width: 52px;
  height: 32px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #171225;
  font-size: 12px;
  color: #aaa5b3;

  &.active {
    border-color: #9b4dff;
    color: #9b4dff;
    background: rgba(155, 77, 255, 0.16);
  }
}

.leverage-slider-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #9b4dff;
  border: 2px solid #211b32;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}
</style>

<!-- 价格波动二次确认弹窗 — vant teleport 到 body，全局 + className 限定 -->
<style lang="scss">
.uc-price-confirm-dialog.van-dialog {
  background: transparent !important;
  border-radius: 18px !important;
  overflow: hidden !important;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(160, 65, 237, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
}

.uc-price-confirm-dialog .van-dialog__header {
  padding: 22px 20px 8px;
  background:
    radial-gradient(120% 110% at 100% 0%, rgba(160, 65, 237, 0.28) 0%, rgba(160, 65, 237, 0) 60%),
    linear-gradient(155deg, rgba(60, 26, 110, 0.65) 0%, rgba(30, 21, 48, 0.95) 60%);
  color: #fff !important;
  font-size: 17px !important;
  font-weight: 600 !important;
  text-align: center;
  letter-spacing: 0.01em;
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
}

.uc-price-confirm-dialog .van-dialog__content {
  padding: 8px 22px 22px;
  background:
    linear-gradient(155deg, rgba(60, 26, 110, 0.55) 0%, rgba(30, 21, 48, 0.92) 60%);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
}

.uc-price-confirm-dialog .van-dialog__message {
  color: rgba(255, 255, 255, 0.82) !important;
  font-size: 13px !important;
  line-height: 1.65 !important;
  text-align: center !important;
  padding: 0 !important;
  word-break: break-word;
}

.uc-price-confirm-dialog .van-dialog__footer {
  background: rgba(30, 21, 48, 0.92);
  border-top: none !important;
  padding: 12px 16px;
  display: flex;
  gap: 10px;
}

.uc-price-confirm-dialog .van-dialog__footer::before,
.uc-price-confirm-dialog .van-dialog__footer::after,
.uc-price-confirm-dialog .van-hairline--top::after,
.uc-price-confirm-dialog .van-hairline--top-bottom::after {
  display: none !important;
  border: none !important;
  background: transparent !important;
}

.uc-price-confirm-dialog .van-dialog__cancel {
  flex: 1;
  height: 44px !important;
  border-radius: 999px !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  background: transparent !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

.uc-price-confirm-dialog .van-dialog__confirm {
  flex: 1;
  height: 44px !important;
  border-radius: 999px !important;
  border: none !important;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%) !important;
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.32) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #fff !important;
}

.uc-price-confirm-dialog .van-hairline--left::after {
  display: none !important;
}
</style>
