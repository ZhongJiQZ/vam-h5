<template>
    <!-- 订单信息：当前委托 / 历史委托 -->
    <div class="entrust">
      <div class="entrustL">
        <div
          :class="currentEntruset === 0 ? 'entrustItem hightItem' : 'entrustItem'"
          @click="switchingEntrust(0)"
        >
          {{ _t18(`exchange_curentrust`, ['bitmake', 'ebc']) }}{{ firstNum ? `(${firstNum})` : '' }}
        </div>
  
        <div
          :class="currentEntruset === 1 ? 'entrustItem hightItem' : 'entrustItem'"
          @click="switchingEntrust(1)"
        >
          {{ _t18(`exchange_hisentrust`, ['bitmake', 'ebc']) }}{{ secondNum ? `(${secondNum})` : '' }}
        </div>
      </div>
  
      <!-- 隐藏其他币种，刷新 -->
      <div class="entrustR">
        <!-- <svg-load
          v-if="currentEye"
          name="yanjin-k"
          class="entrustRImg"
          @click="switchingEye"
        />
        <svg-load
          v-else
          name="yanjin-g"
          class="entrustRImg"
          @click="switchingEye"
        /> -->
        <svg-load name="shuaxin" class="entrustRUpdateImg" @click="toRefresh" />
      </div>
    </div>
  
    <div class="sc-order-body">
      <div v-if="historyNewList.length > 0" class="sc-order-list">
        <ContractHistory
          v-for="item in historyNewList"
          :key="item.userId"
          order-center-style
          :currentEntruset="currentEntruset"
          :itemHistroy="item"
          @recombine="remove"
          @updateRecord="updateRecord"
          @shareRevenue="shareRevenue"
        />
      </div>
      <Nodata v-else />
    </div>
  
    <div class="placeholder"></div>
  
    <!-- 分享收益 -->
    <van-overlay :show="shareShow" class="share-revenue-box" @click="shareShow = false">
      <div class="share-revenue" @click.stop="">
        <ShareCommissionDetail :historical-data="revenueDetails" />
      </div>
    </van-overlay>
  </template>
  
  <script setup>
  import { onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { showLoadingToast, closeToast } from 'vant'
  
  import ContractHistory from '@/views/trade/components/secondContract/content/contractHistory.vue'
  import ShareCommissionDetail from '@/views/trade/components/common/ShareCommissionDetail.vue'
  
  import { secondContractOrderselectOrderList } from '@/api/trade/index'
  import { formatCurrentcurrency, profitAndloss } from '@/utils/filters'
  import { _t18 } from '@/utils/public'
  
  import { useUserStore } from '@/store/user'
  import { socketDict } from '@/config/dict'
  import { getOrigin } from '@/utils/browser.js';

  import PubSub from 'pubsub-js'
  
  const $route = useRoute()
  
  /** 当前委托/历史委托 */
  const currentEntruset = ref(0)
  
  /** 眼睛：是否隐藏其他币种 */
  const currentEye = ref(true)
  
  /** 原始列表 & 过滤后列表 */
  const historyList = ref([])
  const historyNewList = ref([])
  
  /** 计数 */
  const firstNum = ref(0)
  const secondNum = ref(0)
  
  /** 当前委托/历史委托切换 */
  const switchingEntrust = (e) => {
    currentEntruset.value = e
    historyNewList.value = []
    getList(e)
  }
  
  /** 切换眼睛 */
  const switchingEye = () => {
    currentEye.value = !currentEye.value
    filterEyes()
  }
  
  const getCurrentSymbol = () => {
    const s = $route.query?.symbol || ''
    return String(s).trim().toUpperCase()
  }
  
  /** 过滤：隐藏其他币种 */
  const filterEyes = () => {
    if (currentEye.value) {
      historyNewList.value = historyList.value
    } else {
      const sym = getCurrentSymbol()
      historyNewList.value = formatCurrentcurrency(historyList.value, sym)
    }
  }
  
  /** 刷新 */
  const toRefresh = () => {
    showLoadingToast({ forbidClick: true, duration: 0 })
    updateList()
  }
  
  const updateList = () => {
    historyNewList.value = []
    getList(currentEntruset.value)
  }
  
  defineExpose({ updateList })
  
  /** 倒计时挂载 */
  const attachCountdown = (list) => {
    const now = Date.now()
    return (list || []).map((it) => {
      const ct = Number(it?.closeTime)
      if (Number.isFinite(ct) && ct > 0) {
        const leftSec = Math.floor((ct - now) / 1000)
        return { ...it, time: leftSec }
      }
      return it
    })
  }
  
  /** 过滤倒计时：只在“当前委托”过滤 time<=0 */
  const fifterTimeDown = (data) => {
    if (!Array.isArray(data) || data.length === 0) return []
    if (currentEntruset.value === 0) {
      return data.filter((item) => {
        const t = Number(item?.time)
        if (!Number.isFinite(t)) return true
        return t > 0
      })
    }
    return data
  }
  
  /** 删除某条 */
  const remove = (item, num) => {
    if (num < 0) {
      const idx = historyNewList.value.findIndex((x) => x.userId === item.userId)
      if (idx >= 0) historyNewList.value.splice(idx, 1)
    }
  }
  
  /** 更新回调 */
  const updateRecord = () => {
    getNumber(0)
    getNumber(1)
    getList(currentEntruset.value)
  }
  
  /** 拉列表 */
  const getList = async (status) => {
    try {
      const res = await secondContractOrderselectOrderList({ status })
      if (res.code === 200) {
        const result = res.data || []
        if (status) secondNum.value = result.length
        else firstNum.value = result.length
  
        historyList.value = fifterTimeDown(attachCountdown(result))
        historyNewList.value = historyList.value
        filterEyes()
      }
    } finally {
      closeToast()
    }
  }
  
  /** 拉数量 */
  const getNumber = async (status) => {
    try {
      const res = await secondContractOrderselectOrderList({ status })
      if (res.code === 200) {
        const result = res.data || []
        if (status) secondNum.value = result.length
        else firstNum.value = result.length
      }
    } catch (e) {}
  }
  
  /** 路由变化：币种切换时刷新当前 tab 数据 */
  watch(
    () => [$route.query?.symbol, $route.query?.type],
    () => {
      getList(currentEntruset.value)
    }
  )
  
  /** 眼睛变化 */
  watch(
    () => currentEye.value,
    (n) => {
      if (n) historyNewList.value = historyList.value
    }
  )
  
  /** 分享收益 */
  const shareShow = ref(false)
  const revenueDetails = ref({})
  const closePosition = _t18('Close_position')
  
  const shareRevenue = (model) => {
    const amuout = profitAndloss(model.betAmount, model.rewardAmount)
    const userStore = useUserStore()
    const userInfo = userStore.userInfo
    const sharkCode = userInfo?.user?.activeCode
  
    revenueDetails.value = {
      profitAndLossAmount: amuout > 0 ? amuout.toString() : amuout,
      TransactionType: model.coinSymbol.toUpperCase() + '/' + model.baseSymbol.toUpperCase(),
      CurrencyName: closePosition,
      OpeningPrice: model.openPrice?.toString?.() ?? '',
      ClosingPrice: model.closePrice?.toString?.() ?? '',
      type: model.type,
      QrCode: getOrigin(),//location.origin
      bgType: `1`,
      currencyUnit: model.baseSymbol.toUpperCase()
    }
  
    shareShow.value = true
  }
  
  /** 结算推送：刷新列表 + 更新用户信息 */
  const userStore = useUserStore()
  const settlementKey = ref('')
  
  const settlementNotification = () => {
    settlementKey.value = PubSub.subscribe(socketDict.SETTLEMENT, (key, data) => {
      const { type } = JSON.parse(data.date.message)
      if (type == 3) {
        getList(0)
        getList(1)
        userStore.getUserInfo()
      }
    })
  }
  
  onMounted(() => {
    getList(0)
    getNumber(1)
    settlementNotification()
  })
  
  onUnmounted(() => {
    settlementKey.value && PubSub.unsubscribe(settlementKey.value)
  })
  </script>
  
  <style lang="scss" scoped>
  .placeholder {
    height: 104px;
  }
  
  .sc-order-body {
    background: #f6f7fb;
    min-height: 200px;
  }

  .sc-order-list {
    padding: 12px 15px 0;
  }

  .sc-order-body :deep(.van-empty),
  .sc-order-body :deep(.nodata) {
    padding-top: 40px;
  }

  .entrust {
    min-height: 48px;
    display: flex;
    padding: 0 15px;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ebebeb;

    .entrustL {
      font-size: 14px;
      color: #999;
      display: flex;
      gap: 20px;

      .entrustItem {
        padding-bottom: 10px;
        margin-bottom: -11px;
        cursor: pointer;
      }

      .hightItem {
        color: #333 !important;
        font-weight: 600;
        border-bottom: 2px solid #008710;
      }
    }
  
    .entrustR {
      display: flex;
      align-items: center;
  
      .entrustRImg {
        width: 16px;
        height: 12px;
      }
  
      .entrustRUpdateImg {
        margin-left: 20px;
        width: 12px;
        height: 12px;
      }
    }
  }
  
  /* 分享弹出层 */
  .share-revenue-box {
    z-index: 99;
  
    .share-revenue {
      :deep(.share-commission) {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: var(--ex-default-background-color);
        min-width: 300px;
        border-radius: 30px;
      }
    }
  }
  </style>
  