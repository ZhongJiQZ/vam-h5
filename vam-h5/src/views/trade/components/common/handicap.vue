<template>
  <div class="handicapBox">
    <!-- title -->
    <div class="title">
      <div class="title_left">
        <div class="name">{{ _t18(`price`) }}</div>
        <div class="unit">({{ coinInfo.baseCoinUpperCase }})</div>
      </div>
      <div class="title_right">
        <div class="name">{{ _t18('vol') }}</div>
        <div class="unit">
          ({{
            coinInfo.customizeFlag === 2
              ? matchText(coinInfo.showSymbol, '/USDT')
              : coinInfo.coinUpperCase
          }})
        </div>
      </div>
    </div>

    <div class="leftList">
      <div class="itemList asks" v-show="showType.value != 2">
        <!-- 卖出盘 -->
        <div
          class="item"
          v-for="(item, index) in rows"
          @click="emits('setTradePrice', asksList[index]?.price)"
          :key="`asks${index}`"
        >
          <div class="fall fw-num">{{ priceFormat(asksList[index]?.price) }}</div>
          <div class="itemName fw-num">{{ countFormat(asksList[index]?.count) }}</div>
          <div
            class="hightItem fall rfd-bg"
            :style="`width:${_toFixed(
              _mul(_div(asksList[index]?.count || 0, maxAskCount), 100),
              2
            )}%;`"
          ></div>
        </div>
      </div>
      <div class="itemCenter">
        <div
          :class="[
            _isRFD(tradeDetailInfo?.open, tradeDetailInfo?.close, 'buy', 'rise'),
            'fw-num centername'
          ]"
          @click="emits('setTradePrice', tradeDetailInfo?.close)"
        >
          {{ priceFormat(tradeDetailInfo?.close) }}
        </div>
        <div class="">≈${{ tradeDetailInfo?.close }}</div>
      </div>
      <div class="itemList" v-show="showType.value != 1">
        <!-- 买入盘 -->
        <div
          class="item itemHight"
          v-for="(item, index) in rows"
          :key="`bids${index}`"
          @click="emits('setTradePrice', bidsList[index]?.price)"
        >
          <div class="rise fw-num">{{ priceFormat(bidsList[index]?.price) }}</div>
          <div class="itemName fw-num">{{ countFormat(bidsList[index]?.count) }}</div>
          <div
            class="hightItem rise rfd-bg"
            :style="`width:${_toFixed(
              _mul(_div(bidsList[index]?.count || 0, maxBidCount), 100),
              2
            )}%;`"
          ></div>
        </div>
      </div>
    </div>
    <div class="leftBottom">
      <!-- 盘口深度 -->
      <div class="bottomLeft" @click="showDepthPopup = true">
        <div class="fw-num">{{ showDepth?.label }}</div>
        <svg-load name="jiantou10x5-x" class="img"></svg-load>
      </div>
      <!-- 展示盘口 -->
      <div class="bottomRight" @click="showTypePopup = true">
        <!-- 默认 -->
        <svg-load :name="showType.icon" class="img"></svg-load>
      </div>
    </div>
    <!-- 选择聚合深度 -->
    <PublicPopup
      :show="showDepthPopup"
      @handelClose="showDepthPopup = false"
      :direction="`bottom`"
      :showHeader="false"
      :empty="false"
    >
      <template #emptyContentCustomize>
        <div class="bbList">
          <div
            class="item"
            v-for="item in showDepthList"
            :key="item.value"
            :style="showDepth.label === item.label ? 'color:var(--ex-font-color2)' : ''"
            @click="_checkedShowDepth(item)"
          >
            {{ item.label }}
          </div>
        </div>
      </template>
    </PublicPopup>
    <!-- 展示盘 -->
    <PublicPopup
      :show="showTypePopup"
      @handelClose="showTypePopup = false"
      :direction="`bottom`"
      :showHeader="false"
      :empty="false"
    >
      <template #emptyContentCustomize>
        <div class="bbList">
          <div
            class="item"
            v-for="item in showTypeList"
            :key="item.value"
            :style="showType.value === item.value ? 'color:var(--ex-font-color2)' : ''"
            @click="_checkedShowType(item)"
          >
            {{ item.label }}
          </div>
        </div>
      </template>
    </PublicPopup>
  </div>
</template>

<script setup>
import PublicPopup from '@/components/Popup/public.vue'
import { socketDict } from '@/config/dict'
import PubSub from 'pubsub-js'
import { _add, _sub, _div, _toFixed, _mul, countFormat, priceFormat } from '@/utils/decimal'
import _ from 'lodash'
import { _t18 } from '@/utils/public'
import { useTradeStore } from '@/store/trade'
import { watch, computed, reactive } from 'vue'
import { matchText } from '@/utils/filters'

const emits = defineEmits(['setTradePrice'])
const props = defineProps({
  coinInfo: {
    type: Object
  },
  /**
   * 行数 最大30 默认4
   */
  rows: {
    type: Number,
    default: 4
  }
})
/**
 * 盘口显示类型
 */
const showTypeList = [
  // 默认
  { label: _t18(`bb_default`), value: 0, icon: 'morenpan' },
  // 卖出盘
  { label: _t18(`bb_sell_order`), value: 1, icon: 'maichupan' },
  // 买入盘
  { label: _t18(`bb_buy_order`), value: 2, icon: 'mairupan' }
]
/**
 * 当前显示类型
 */
const showType = ref(showTypeList[0])
/**
 * 显示Popup变量
 */
const showTypePopup = ref(false)
/**
 * 显示行数
 */
const rows = computed(() => (showType.value.value != 0 ? props.rows * 2 : props.rows))
/**
 * 选中盘口显示类型
 */
const _checkedShowType = (item) => {
  if (item.value != showType.value.value) {
    showType.value = item
  }
  showTypePopup.value = false
}
/**
 * 盘口显示类型
 */
const showDepthListDict = [
  { label: '0.00000001', value: 0, min: 0.00000001 },
  { label: '0.0000001', value: 1, min: 0.0000001 },
  { label: '0.000001', value: 2, min: 0.000001 },
  { label: '0.00001', value: 3, min: 0.00001 },
  { label: '0.0001', value: 4, min: 0.0001 },
  { label: '0.001', value: 5, min: 0.001 },
  { label: '0.01', value: 6, min: 0.01 },
  { label: '0.1', value: 7, min: 0.1 },
  { label: '1', value: 8, min: 10 },
  { label: '10', value: 9, min: 100 },
  { label: '100', value: 10, min: 1000 }
]
const showDepthList = ref([])
/**
 * 当前显示类型
 */
const showDepth = reactive({})

/**
 * 显示Popup变量
 */
const showDepthPopup = ref(false)
/**
 * 选中盘口显示类型
 */
const _checkedShowDepth = (item) => {
  if (item.value != showDepth.value) {
    Object.assign(showDepth, item)
  }
  showDepthPopup.value = false
}

// 最大卖出数量
const maxAskCount = ref(0)
// 最大买入数量
const maxBidCount = ref(0)
/**
 * 买入列表
 */
const bidsList = reactive([])
/**
 * 卖出列表
 */
const asksList = reactive([])

// 生成 区间 随机整数
const getRandomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
/**
 * 获取最小单位值
 */
function getIntegerPart(number) {
  var integerPart = Math.floor(number) // 获取整数部分
  let temp = Math.pow(10, integerPart.toString().length - 1)
  if (integerPart < 10) {
    temp = Math.pow(10, 5 - number.toString().split('.')[1]?.length)
  }
  return temp
}
/**
 * 根据当前价格随机成交量
 */
const getMockDataList = () => {
  setTimeout(getMockDataListThrottle, getRandomInteger(900, 1600))

  let price = tradeDetailInfo.value?.close
  let coefficient = 1 / getIntegerPart(price)
  let aggregationFactor = showDepth?.min
  let countFactor = aggregationFactor * 1000
  if (price < 1000) {
    countFactor = aggregationFactor * 10 ** (`${price}`.length - 1)
  }

  if (!price || !Number(aggregationFactor)) {
    maxAskCount.value = 0
    maxBidCount.value = 0
    Object.assign(
      asksList,
      asksList.map((elem) => {
        elem.close = 0
        elem.count = 0
        return elem
      })
    )
    Object.assign(
      bidsList,
      asksList.map((elem) => {
        elem.price = 0
        elem.count = 0
        return elem
      })
    )
    return
  }
  // 生成数量 大 -> 小
  let tempAsksList = []
  let tempBidsList = []
  let hashCount = _mul(_mul(Math.random(), coefficient), countFactor)
  if (price < 10) {
    hashCount = _mul(_mul(Math.random(), coefficient), countFactor)
  }

  for (let i = 1; i <= props.rows * 2; i++) {
    let randomCount = _mul(Math.random(), hashCount) + _mul(Math.random(), coefficient)
    let tempObj = {
      price: _add(_add(price, i * aggregationFactor), 0),
      count: randomCount
    }
    tempAsksList.push(tempObj)
    tempAsksList = tempAsksList.sort((a, b) => a.price - b.price)
  }

  for (let i = 1; i <= props.rows * 2; i++) {
    let randomCount = _mul(Math.random(), hashCount) + _mul(Math.random(), coefficient)

    let tempObj = {
      price: _sub(_sub(price, i * aggregationFactor), 0),
      count: randomCount
    }
    tempBidsList.push(tempObj)
    tempBidsList = tempBidsList.sort((a, b) => b.price - a.price)
  }
  maxAskCount.value = Math.max(...tempAsksList.filter((e, i) => i < props.rows).map((e) => e.count))
  maxBidCount.value = Math.max(...tempBidsList.filter((e, i) => i < props.rows).map((e) => e.count))
  Object.assign(asksList, tempAsksList)
  Object.assign(bidsList, tempBidsList)
}
/**
 * 交易详情数据
 */
const tradeDetailInfo = computed(() => tradeStore.allCoinPriceInfo[props.coinInfo?.coin])
const tradeStore = useTradeStore()
watch(
  () => props.coinInfo?.coin,
  () => {
    // console.log('handicap coin change', props.coinInfo?.coin, props.rows, tradeDetailInfo.value.close)
    if (tradeDetailInfo.value?.close > 0) {
      showDepthList.value = showDepthListDict
        .filter((elem) => elem.min * 30 < tradeDetailInfo.value.close)
        .slice(-4)
      Object.assign(showDepth, showDepthList.value[0])
      getMockDataListThrottle()
      // getMockDataList()
    }
  }
)

/**
 * 更新数据 限流
 */
const getMockDataListThrottle = _.throttle(() => {
  getMockDataList()
}, 1000)

const subKey = PubSub.subscribe(socketDict.DETAIL, (key, data) => {
  if (data.symbol && data.symbol == props.coinInfo.coin) {
    if (tradeDetailInfo.value.close && showDepthList.value.length) {
      getMockDataListThrottle()
    } else {
      showDepthList.value = showDepthListDict
        .filter((elem) => elem.min * 30 < tradeDetailInfo.value.close)
        .slice(-4)
      Object.assign(showDepth, showDepthList.value[0])
      getMockDataList()
    }
  }
})

onUnmounted(() => {
  subKey && PubSub.unsubscribe(subKey)
})
</script>

<style lang="scss" scoped>
/* GXPEX 暗紫盘口 (按 2nd Figma spec)：Price | Qty + 右端 volume bar + 中价大字 */
.handicapBox {
  padding-right: 2px;
  font-variant-numeric: tabular-nums;
}

/* 列头 Price / Qty */
.title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 11px;
  font-weight: 500;
  color: #aaa5b3;
  padding: 2px 2px 10px;

  .title_left,
  .title_right {
    display: flex;
    align-items: baseline;
    gap: 3px;
  }
  .title_right { text-align: right; }

  .name {
    color: #aaa5b3;
    font-size: 11px;
    font-weight: 500;
  }
  .unit {
    margin-top: 0;
    font-size: 10px;
    color: #625d6d;
  }
}

.leftList {
  flex: 1;
  display: flex;
  flex-direction: column;

  .itemList {
    display: flex;
    flex-direction: column;
    &.asks { flex-direction: column-reverse; }

    .item {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 22px;
      margin-bottom: 2px;
      padding: 0 2px;
      font-size: 12px;
      font-family: 'Inter', 'Roboto', sans-serif;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      color: #ff435d;
      white-space: nowrap;

      &.itemHight { color: #31c48d; }

      .itemName {
        color: #f5f3f8;
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }

      .hightItem {
        position: absolute;
        right: 0;
        height: 16px;
        min-width: 3px;
        max-width: 36%;
        border-radius: 2px;
        opacity: 0.16;
        z-index: -1;
        transition: width 0.4s ease;
      }
      .hightItem.fall { background: #ff435d !important; }
      .hightItem.rise { background: #31c48d !important; }
    }
  }

  /* 中间最新价：居中 + 上下分割线 + 大字 */
  .itemCenter {
    text-align: center;
    padding: 14px 2px;
    color: #aaa5b3;
    font-size: 11px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin: 6px 0;

    .centername {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
      line-height: 1.1;
      letter-spacing: 0.2px;
      font-variant-numeric: tabular-nums;
      text-align: center;

      &.rise { color: #31c48d; }
      &.fall { color: #ff435d; }
    }
  }
}

/* 底部聚合深度 + 展示切换 */
.leftBottom {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .bottomLeft {
    display: flex;
    padding: 0 8px;
    justify-content: space-between;
    align-items: center;
    min-width: 60px;
    height: 22px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 5px;
    font-size: 11px;
    font-weight: 500;
    color: #f5f3f8;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    .img { width: 8px; height: 4px; margin-left: 4px; filter: brightness(2); }
  }

  .bottomRight {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 22px;
    height: 22px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 5px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    .img { width: 12px; height: 12px; filter: brightness(2); }
  }
}

/* 聚合精度弹窗 */
.bbList {
  background: #211b32;
  text-align: center;
  .item {
    color: #f5f3f8;
    font-size: 14px;
    padding: 18px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }
  .item:last-child { border-bottom: none; }
}
</style>
