<template>
    <div class="orderBox">
      <!-- tab切换：当前委托 / 历史委托 -->
      <van-tabs
        shrink
        class="oc-spot-tabs"
        :line-width="0"
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

            <div v-if="loading === false && (dataNewList?.length || 0) <= 0" class="sp-empty">
              <img :src="iconEmpty" alt="" class="sp-empty__icon" />
              <p class="sp-empty__text">{{ _t18('no_data') }}</p>
            </div>
          </div>
        </van-tab>
      </van-tabs>

      <!-- 右侧：刷新 -->
      <div class="tab_right">
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
  import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'
  
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

  /* 子 tab — 跟 SecondContractEntrust 同款紫色短下划线 */
  .oc-spot-tabs {
    :deep(.van-tabs__wrap) {
      background: transparent !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    :deep(.van-tabs__nav) {
      background: transparent !important;
      padding: 0 4px;
      padding-right: 60px;
    }

    :deep(.van-tab) {
      flex: none;
      padding: 0;
      margin-right: 22px;
      font-size: 13px;
      font-weight: 500;
      background: transparent !important;
      color: rgba(255, 255, 255, 0.55) !important;
    }

    :deep(.van-tab__text) {
      font-weight: 500;
    }

    :deep(.van-tab--active .van-tab__text) {
      color: #fff !important;
      font-weight: 600;
    }

    :deep(.van-tab--active::after) {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 6px;
      transform: translateX(-50%);
      width: 18px;
      height: 3px;
      background: #a13cff;
      border-radius: 2px;
    }

    :deep(.van-tabs__line) {
      display: none !important;
    }
  }

  /* 右侧刷新图标 */
  .tab_right {
    position: absolute;
    top: 4px;
    right: 4px;
    background: transparent !important;
    padding: 8px;
    z-index: 5;

    .entrustRImg {
      width: 18px;
      height: 18px;
      opacity: 0.75;
      cursor: pointer;
      filter: brightness(0) invert(1);
      transition: opacity 0.18s ease;
    }

    .entrustRImg:hover {
      opacity: 1;
    }
  }

  /* 列表容器 */
  .listBox {
    padding: 12px 4px 0;
    background: transparent;
    min-height: 200px;
  }

  :deep(.van-cell) {
    background: transparent !important;
    padding: 0;
    border-bottom: none;
  }

  /* 空态 */
  .sp-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 64px 0 24px;
  }

  .sp-empty__icon {
    display: block;
    width: 140px;
    height: 140px;
    object-fit: contain;
  }

  .sp-empty__text {
    margin: 10px 0 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.45);
  }
  </style>
  