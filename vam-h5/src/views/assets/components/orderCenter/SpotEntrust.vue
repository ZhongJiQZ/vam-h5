<template>
    <div class="orderBox">
      <!-- tab切换：当前委托 / 历史委托 -->
      <van-tabs
        shrink
        class="oc-spot-tabs"
        color="#008710"
        title-active-color="#000000"
        title-inactive-color="#999999"
        @click-tab="clickTab"
      >
        <van-tab
          v-for="(item, index) in tabList"
          :key="index"
          :title="item.num > 0 ? item.label + '(' + item.num + ')' : item.label"
          :name="item.value"
        >
          <div class="listBox">
            <div v-if="dataNewList?.length > 0">
              <van-list
                :finished="finished"
                :finished-text="_t18(`no_more_data`)"
                :loading-text="_t18(`loading`)"
                @load="onLoad"
                v-model:loading="loading"
              >
                <van-cell v-for="(row, idx) in dataNewList" :key="idx" :border="false">
                  <EntrustOrderItem :data="row" @reduceOrderNum="reduceOrderNum" />
                </van-cell>
              </van-list>
            </div>
  
            <Nodata v-if="loading === false && (dataNewList?.length || 0) <= 0" />
          </div>
        </van-tab>
      </van-tabs>
  
      <!-- 右侧：眼睛 + 刷新 -->
      <div class="tab_right">
        <!-- <svg-load
          :name="showEye ? 'yanjin-k' : 'yanjin-g'"
          class="entrustRImg"
          @click="handelEye"
        /> -->
        <svg-load name="shuaxin" class="entrustRImg" @click="refresh" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router'
  
  import { formatCurrentcurrency } from '@/utils/filters'
  import { _t18 } from '@/utils/public'
  import EntrustOrderItem from '@/views/trade/components/bbTrading/content/EntrustOrderItem.vue'
  import { getOrderListCurrencyApi } from '@/api/trade/index'
  import { useUserStore } from '@/store/user/index'
  
  const userStore = useUserStore()
  const $route = useRoute()
  
  /** tab */
  const tabList = ref([
    { label: _t18(`exchange_curentrust`, ['bitmake', 'ebc']), value: 0, num: 0 },
    { label: _t18(`exchange_hisentrust`, ['bitmake', 'ebc', 'rxce']), value: 1, num: 0 }
  ])
  
  /** 订单数据 */
  const showEye = ref(true)
  const loading = ref(false)
  const finished = ref(false)
  const total = ref(0)
  
  const pageSize = ref(10)
  const pageNum = ref(1)
  
  const dataList = ref([])
  const dataNewList = ref([])
  
  /** 当前 tab：0当前 / 1历史 */
  const orderType = ref(0)
  
  /** 从路由拿币种（订单中心没有 coinInfo） */
  const getCurrentCoin = () => {
    // 你订单中心如果传的是 symbol=btc 或 BTCUSDT，按你 formatCurrentcurrency 的预期来
    const s = $route.query?.symbol || ''
    return String(s).trim().toLowerCase()
  }
  
  /** 上拉加载分页 */
  const onLoad = () => {
    loading.value = true
    getOrderList(orderType.value)
  }
  
  const getOrderList = async (status) => {
    loading.value = true
    finished.value = false
  
    const params = `isAsc=desc&orderByColumn=updateTime&status=${status}&pageSize=${pageSize.value}&pageNum=${pageNum.value}`
    const res = await getOrderListCurrencyApi(params)
  
    if (res.code == '200') {
      loading.value = false
      res.rows && dataList.value.push(...res.rows)
  
      filterEyes(getCurrentCoin())
  
      total.value = res.total || 0
      if (dataList.value.length >= total.value) finished.value = true
      pageNum.value++
  
      if (status == 0) tabList.value[0].num = total.value
      if (status == 1) tabList.value[1].num = total.value
    } else {
      loading.value = false
    }
  }
  
  const getNum = async (status) => {
    const params = `isAsc=desc&orderByColumn=updateTime&status=${status}&pageSize=${pageSize.value}&pageNum=1`
    const res = await getOrderListCurrencyApi(params)
    if (res.code == '200') {
      if (status == 0) tabList.value[0].num = res.total || 0
      if (status == 1) tabList.value[1].num = res.total || 0
    }
  }
  
  /** 切换 tab */
  const clickTab = (e) => {
    dataList.value = []
    dataNewList.value = []
    pageNum.value = 1
  
    // van-tabs click-tab 里 e.name 就是 van-tab 的 name
    orderType.value = Number(e?.name ?? 0)
    getOrderList(orderType.value)
  }
  
  /** 刷新 */
  const refresh = () => {
    dataList.value = []
    dataNewList.value = []
    pageNum.value = 1
  
    if (orderType.value == 0) {
      getOrderList(0)
      getNum(1)
    } else {
      getOrderList(1)
      getNum(0)
    }
  }
  
  /** 撤单回调 */
  const reduceOrderNum = () => {
    refresh()
    userStore.getUserInfo()
  }
  
  /** 点击小眼睛 */
  const handelEye = () => {
    showEye.value = !showEye.value
    filterEyes(getCurrentCoin())
  }
  
  /** 过滤当前币种订单 */
  const filterEyes = (coin) => {
    if (showEye.value) {
      dataNewList.value = dataList.value
    } else {
      dataNewList.value = formatCurrentcurrency(dataList.value, coin)
    }
  }
  
  defineExpose({ refresh })
  
  const init = () => {
    getOrderList(0)
    getNum(1)
  }
  
  onMounted(() => init())
  
  /** 订单中心切换币种（route.query.symbol 变化）时，重新过滤或刷新 */
  watch(
    () => $route.query?.symbol,
    () => {
      // 只重新过滤也行；为了防止列表本来就不是这个币的数据，建议直接 refresh
      refresh()
    }
  )
  </script>
  
  <style lang="scss" scoped>
  .orderBox {
    position: relative;
  }

  .oc-spot-tabs {
    :deep(.van-tabs__wrap) {
      border-bottom: 1px solid #ebebeb;
    }

    :deep(.van-tabs__nav) {
      padding-right: 80px;
      background: #fff !important;
    }

    :deep(.van-tab--active .van-tab__text) {
      font-weight: 600;
    }

    :deep(.van-tabs__line) {
      display: none !important;
    }
  }

  .tab_right {
    position: absolute;
    top: 0;
    right: 0;
    background: #fff !important;
    padding: 15px 5px;

    .entrustRImg {
      padding: 0 12px;
      font-size: 12px;
      margin-top: 10px;
      color: #666;
    }
  }

  .listBox {
    padding: 10px 12px 0;
    background: #fff;
    min-height: 200px;
  }

  :deep(.van-cell) {
    background: transparent !important;
    padding: 0;
    border-bottom: none;
  }
  </style>
  