<template>
  <div class="orderBox">
    <!-- tab切换：当前持仓，当前委托，止盈止损，历史委托 -->
    <van-tabs
      v-model:active="curActive"
      shrink
      class="us-order-tabs"
      color="#008710"
      title-active-color="#000000"
      title-inactive-color="#999999"
    >
      <van-tab
        v-for="(item, index) in tabList"
        :key="index"
        :name="item.value"
        :title="item.num > 0 ? item.label + '(' + item.num + ')' : item.label"
      >
        <div class="listBox">
          <div>
            <van-list
              :finished="finished"
              :finished-text="_t18(`no_more_data`)"
              :loading-text="_t18(`loading`)"
              @load="onLoad"
              v-model:loading="loading"
            >
              <van-cell v-for="(items, indexs) in dataNewList" :key="indexs" :border="false">
                <OrderItem
                  :recordListItem="items"
                  :currentEntruset="curActive"
                  :availableBalance="availableBalance"
                  @updateList="updateList"
                  @updateUser="updateUser"
                ></OrderItem>
              </van-cell>
            </van-list>
          </div>
          <!-- <Nodata /> -->
        </div>
      </van-tab>
    </van-tabs>
    <!-- 隐藏其他币种，刷新 (Figma icons) -->
    <div class="tab_right">
      <img
        :src="iconEye"
        :class="['entrustRImg', { 'entrustRImg--off': !showEye }]"
        @click="handelEye"
        alt=""
      />
      <img :src="iconRefresh" class="entrustRImg" @click="handelRefresh" alt="" />
    </div>
  </div>
</template>

<script setup>
import OrderItem from './EntrustOrderItem.vue'
import { formatCurrentcurrency } from '@/utils/filters'
import { _t18 } from '@/utils/public'
import { onMounted } from 'vue'
import {
  submitUcontract,
  contractHistoryList,
  contractLossList,
  orderList
} from '@/api/trade/index'
import { useTradeStore } from '@/store/trade'
import iconEye from '@/assets/images/gxpex/trade/icon-order-filter2.svg'
import iconRefresh from '@/assets/images/gxpex/trade/icon-order-filter1.svg'
const props = defineProps({
  coinInfo: {
    type: Object,
    default: () => {}
  },
  availableBalance: {
    type: Number
  }
})
const tabList = ref([
  { label: _t18(`current_position`, ['latcoin']), value: 0, num: 0 },
  { label: _t18(`exchange_curentrust`, ['bitmake', 'ebc', 'latcoin']), value: 1, num: 0 },
  { label: _t18(`profit_loss`, ['paxpay', 'latcoin', 'aams']), value: 2, num: 0 },
  {
    label: ['coinsexpto'].includes(__config._APP_ENV)
      ? _t18(`exchange_hisentrust2`)
      : _t18(`exchange_hisentrust`, ['bitmake', 'ebc', 'latcoin']),
    value: 3,
    num: 0
  }
])
/**
 * 订单数据
 */
// 数据列表
const showEye = ref(true)
const loading = ref(false)
const finished = ref(false)
const total0 = ref(0)
const total1 = ref(0)
const total2 = ref(0)
const total3 = ref(0)
const pageSize = ref(5)
/** 各 tab 分页独立；共用一个 pageNum 会导致多 tab 并行请求时互相污染，误把第一页当「翻页」而 push 重复 */
const pageNumByTab = ref([1, 1, 1, 1])
/** 同 tab 并发请求时丢弃过期响应（避免与 requestedPage 组合出错） */
const fetchGenByTab = ref([0, 0, 0, 0])
const dataList = ref()
const dataNewList = ref([])
const dataTab0 = ref([])
const dataTab1 = ref([])
const dataTab2 = ref([])
const dataTab3 = ref([])
const updateList = (val) => {
  handelRefresh()
  if (val == 1) {
    // 急速平仓
    // getTab3()
  } else if (val == 2) {
    // 止盈止损
    // getTab2()
  }
}
import { useUserStore } from '@/store/user/index'
const userStore = useUserStore()
const tradeStore = useTradeStore()
/** 更新user */
const updateUser = () => {
  userStore.getUserInfo()
}
// 切换列表
const curActive = ref(0)
// 上拉加载分页
const onLoad = () => {
  loading.value = true
  if (curActive.value == 0) {
    getTab0()
  }
  if (curActive.value == 1) {
    getTab1()
  }
  if (curActive.value == 2) {
    getTab2()
  }
  if (curActive.value == 3) {
    getTab3()
  }
}
// 当前持仓
const getTab0 = async () => {
  const tab = 0
  const g = [...fetchGenByTab.value]
  g[tab]++
  fetchGenByTab.value = g
  const myGen = g[tab]
  const requestedPage = pageNumByTab.value[tab]
  loading.value = true
  finished.value = false
  const data = {
    status: 0,
    pageSize: pageSize.value,
    pageNum: requestedPage
  }
  const res = await contractHistoryList(data)
  if (res.code != '200') {
    loading.value = false
    return
  }
  if (myGen !== fetchGenByTab.value[tab]) return
  loading.value = false
  if (requestedPage === 1) {
    dataTab0.value = res.rows ? [...res.rows] : []
  } else {
    res.rows && dataTab0.value.push(...res.rows)
  }
  filterDataList(curActive.value)
  filterEyes()
  total0.value = res.total
  if (dataTab0.value.length >= total0.value) {
    finished.value = true
  } else {
    const nextPage = [...pageNumByTab.value]
    nextPage[tab]++
    pageNumByTab.value = nextPage
  }
  tabList.value[0].num = res.total
}
// 当前委托
const getTab1 = async () => {
  const tab = 1
  const g = [...fetchGenByTab.value]
  g[tab]++
  fetchGenByTab.value = g
  const myGen = g[tab]
  const requestedPage = pageNumByTab.value[tab]
  loading.value = true
  finished.value = false
  const data = {
    status: 0,
    pageSize: pageSize.value,
    pageNum: requestedPage
  }
  const res = await orderList(data)
  if (res.code != '200') {
    loading.value = false
    return
  }
  if (myGen !== fetchGenByTab.value[tab]) return
  loading.value = false
  if (requestedPage === 1) {
    dataTab1.value = res.rows ? [...res.rows] : []
  } else {
    res.rows && dataTab1.value.push(...res.rows)
  }
  filterDataList(curActive.value)
  filterEyes()
  total1.value = res.total
  if (dataTab1.value.length >= total1.value) {
    finished.value = true
  } else {
    const nextPage = [...pageNumByTab.value]
    nextPage[tab]++
    pageNumByTab.value = nextPage
  }
  tabList.value[1].num = res.total
}
// 止盈止损
const getTab2 = async () => {
  const tab = 2
  const g = [...fetchGenByTab.value]
  g[tab]++
  fetchGenByTab.value = g
  const myGen = g[tab]
  const requestedPage = pageNumByTab.value[tab]
  loading.value = true
  finished.value = false
  const data = {
    pageSize: pageSize.value,
    pageNum: requestedPage
  }
  const res = await contractLossList(data)
  if (res.code != '200') {
    loading.value = false
    return
  }
  if (myGen !== fetchGenByTab.value[tab]) return
  loading.value = false
  if (requestedPage === 1) {
    dataTab2.value = res.rows ? [...res.rows] : []
  } else {
    res.rows && dataTab2.value.push(...res.rows)
  }
  filterDataList(curActive.value)
  filterEyes()
  total2.value = res.total
  if (dataTab2.value.length >= total2.value) {
    finished.value = true
  } else {
    const nextPage = [...pageNumByTab.value]
    nextPage[tab]++
    pageNumByTab.value = nextPage
  }
  tabList.value[2].num = res.total
}
// 历史委托
const getTab3 = async (status) => {
  const tab = 3
  const g = [...fetchGenByTab.value]
  g[tab]++
  fetchGenByTab.value = g
  const myGen = g[tab]
  const requestedPage = pageNumByTab.value[tab]
  loading.value = true
  finished.value = false
  const data = {
    status: 1,
    pageSize: pageSize.value,
    pageNum: requestedPage
  }
  const res = await contractHistoryList(data)
  if (res.code != '200') {
    loading.value = false
    return
  }
  if (myGen !== fetchGenByTab.value[tab]) return
  loading.value = false
  if (requestedPage === 1) {
    dataTab3.value = res.rows ? [...res.rows] : []
  } else {
    res.rows && dataTab3.value.push(...res.rows)
  }
  filterDataList(curActive.value)
  filterEyes()
  total3.value = res.total
  if (dataTab3.value.length >= total3.value) {
    finished.value = true
  } else {
    const nextPage = [...pageNumByTab.value]
    nextPage[tab]++
    pageNumByTab.value = nextPage
  }
  tabList.value[3].num = res.total
}

const filterDataList = (n) => {
  switch (n) {
    case 0:
      dataList.value = dataTab0.value
      return
    case 1:
      dataList.value = dataTab1.value
      return
    case 2:
      dataList.value = dataTab2.value
      return
    case 3:
      dataList.value = dataTab3.value
      return
    default:
      break
  }
}
const init = () => {
  pageNumByTab.value = [1, 1, 1, 1]
  getTab0()
  getTab1()
  getTab2()
  getTab3()
}
// 刷新：同步最新行情（盈亏依赖 allCoinPriceInfo.close）+ 重拉当前 tab 列表
const handelRefresh = async () => {
  const next = [...pageNumByTab.value]
  next[curActive.value] = 1
  pageNumByTab.value = next
  finished.value = false
  try {
    await tradeStore.getCoinList()
  } catch (e) {}
  if (curActive.value == 0) {
    await getTab0()
  }
  if (curActive.value == 1) {
    await getTab1()
  }
  if (curActive.value == 2) {
    await getTab2()
  }
  if (curActive.value == 3) {
    await getTab3()
  }
  filterDataList(curActive.value)
}

watch(
  curActive,
  (n) => {
    showEye.value = true
    loading.value = false
    finished.value = false
    handelRefresh()
    filterDataList(n)
  },
  { immediate: true }
)

onMounted(() => {
  if (['rxce'].includes(__config._APP_ENV)) {
    // 当前持仓，当前委托，历史委托
    tabList.value = [
      { label: _t18(`current_position`), value: 0, num: 0 },
      { label: _t18(`exchange_curentrust`), value: 1, num: 0 },
      {},
      {
        label: _t18(`exchange_hisentrust`),
        value: 3,
        num: 0
      }
    ]
  }
  getTab1()
  getTab2()
  getTab3()
})
// 撤单
const reduceOrderNum = () => {
  getTab2()
}
/**
 * 点击小眼睛
 */
const handelEye = () => {
  showEye.value = !showEye.value
  filterEyes()
}
// 过滤当前币种订单
const filterEyes = () => {
  if (showEye.value) {
    dataNewList.value = dataList.value
  } else {
    dataNewList.value = formatCurrentcurrency(dataList.value, props.coinInfo.coin)
  }
}
defineExpose({
  init,
  handelRefresh
})
</script>

<style lang="scss" scoped>
.orderBox {
  position: relative;
}

/* 暗主题覆盖在 tradeUstandard.vue 的 :deep 里 */
.us-order-tabs {
  :deep(.van-tab--active .van-tab__text) {
    font-weight: 600;
  }
}

/* 暗主题覆盖在 tradeUstandard.vue 的 :deep 里，这里清空原浅色样式 */
.tab_right {
  position: absolute;
  top: 0;
  right: 0;
}

/* 暗主题覆盖在 tradeUstandard.vue 的 :deep 里 */
.listBox {
  padding: 10px 0 0;
}

:deep(.van-cell) {
  background: transparent !important;
  padding: 0;
  border-bottom: none;
}
</style>
