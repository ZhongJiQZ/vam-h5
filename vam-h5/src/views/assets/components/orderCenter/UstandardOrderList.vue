<template>
  <div class="orderBox">
    <van-tabs
      v-model:active="curActive"
      shrink
      class="oc-u-tabs"
      :line-width="0"
    >
      <van-tab
        v-for="(t, i) in tabList"
        :key="i"
        :name="t.value"
        :title="t.num > 0 ? `${t.label}(${t.num})` : t.label"
      >
        <div class="listBox">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            :finished-text="_t18('no_more_data')"
            :loading-text="_t18('loading')"
            @load="loadMore"
          >
            <van-cell v-for="(row, idx) in showList" :key="idx" :border="false">
              <OrderItem
                :recordListItem="row"
                :currentEntruset="curActive"
                :availableBalance="availableBalance"
                @updateList="handleItemUpdate"
                @updateUser="updateUser"
              />
            </van-cell>
          </van-list>

          <div v-if="!loading && showList.length === 0" class="u-empty">
            <img :src="iconEmpty" alt="" class="u-empty__icon" />
            <p class="u-empty__text">{{ _t18('no_data') }}</p>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <div class="tab_right">
      <svg-load name="shuaxin" class="entrustRImg" @click="refreshActiveTab" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { _t18 } from '@/utils/public'
import { formatCurrentcurrency } from '@/utils/filters'
import { useUserStore } from '@/store/user/index'
import { useTradeStore } from '@/store/trade'

// 复用 trade 的 item 渲染
import OrderItem from '@/views/trade/components/ustandard/content/EntrustOrderItem.vue'

// API
import { contractHistoryList, contractLossList, orderList } from '@/api/trade/index'

import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const route = useRoute()
const userStore = useUserStore()
const tradeStore = useTradeStore()
const { asset } = storeToRefs(userStore)

/** 订单中心没有传 availableBalance：沿用你 trade 的 type===3 逻辑 */
const availableBalance = computed(() => {
  const cur = asset.value?.filter((i) => i.type === 3) || []
  return cur.length ? Number(cur[0].availableAmount || 0) : 0
})

/** 当前币种：订单中心用 query.symbol */
const currentCoin = computed(() => String(route.query?.symbol || '').trim().toLowerCase())

/** tabs：跟 trade 一致 */
const tabList = ref([
  { label: _t18('current_position', ['latcoin']), value: 0, num: 0 },
  { label: _t18('exchange_curentrust', ['bitmake', 'ebc', 'latcoin']), value: 1, num: 0 },
  { label: _t18('profit_loss', ['paxpay', 'latcoin', 'aams']), value: 2, num: 0 },
  {
    label: ['coinsexpto'].includes(__config._APP_ENV)
      ? _t18('exchange_hisentrust2')
      : _t18('exchange_hisentrust', ['bitmake', 'ebc', 'latcoin']),
    value: 3,
    num: 0
  }
])

/** rxce 特殊：只有 3 个 tab（0/1/3） */
const normalizeTabsForEnv = () => {
  if (['rxce'].includes(__config._APP_ENV)) {
    tabList.value = [
      { label: _t18('current_position'), value: 0, num: 0 },
      { label: _t18('exchange_curentrust'), value: 1, num: 0 },
      { label: _t18('exchange_hisentrust'), value: 3, num: 0 }
    ]
  }
}

const curActive = ref(0)
const showEye = ref(true)

const loading = ref(false)
const finished = ref(false)
const pageSize = ref(5)
const pageNum = ref(1)

/** 每个 tab 独立缓存（不要用 dataList 指针来回切） */
const tabData = ref({
  0: [], // 当前持仓
  1: [], // 当前委托
  2: [], // 止盈止损
  3: []  // 历史委托
})

/** 当前 tab 的原始列表 */
const activeList = computed(() => tabData.value[curActive.value] || [])

/** 是否过滤其它币种 */
const showList = computed(() => {
  const list = activeList.value
  if (showEye.value) return list
  // coin 为空时就别过滤，避免 formatCurrentcurrency 把数据过滤没
  if (!currentCoin.value) return list
  return formatCurrentcurrency(list, currentCoin.value)
})

/** 请求封装：拉第一页 or 拉更多 */
const fetchActiveTab = async ({ reset } = { reset: false }) => {
  if (loading.value) return
  loading.value = true
  finished.value = false

  if (reset) {
    pageNum.value = 1
    tabData.value[curActive.value] = []
  }

  /* watchdog：5s 后强制结束 loading，避免接口卡死时 van-list 一直转圈 */
  const watchdog = setTimeout(() => {
    if (loading.value) {
      loading.value = false
      finished.value = true
    }
  }, 5000)

  try {
    let res = null

    if (curActive.value === 0) {
      res = await contractHistoryList({ status: 0, pageSize: pageSize.value, pageNum: pageNum.value })
      if (res?.code == '200') {
        tabList.value.find((t) => t.value === 0).num = Number(res.total || 0)
      }
    } else if (curActive.value === 1) {
      res = await orderList({ status: 0, pageSize: pageSize.value, pageNum: pageNum.value })
      if (res?.code == '200') {
        tabList.value.find((t) => t.value === 1).num = Number(res.total || 0)
      }
    } else if (curActive.value === 2) {
      res = await contractLossList({ pageSize: pageSize.value, pageNum: pageNum.value })
      if (res?.code == '200') {
        tabList.value.find((t) => t.value === 2).num = Number(res.total || 0)
      }
    } else if (curActive.value === 3) {
      res = await contractHistoryList({ status: 1, pageSize: pageSize.value, pageNum: pageNum.value })
      if (res?.code == '200') {
        tabList.value.find((t) => t.value === 3).num = Number(res.total || 0)
      }
    }

    if (res?.code == '200') {
      const rows = res.rows || []
      if (rows.length) {
        tabData.value[curActive.value].push(...rows)
        pageNum.value += 1
      }
      const total = Number(res.total || 0)
      if (!rows.length || (total > 0 && tabData.value[curActive.value].length >= total)) {
        finished.value = true
      }
    } else {
      finished.value = true
    }
  } catch (e) {
    finished.value = true
  } finally {
    clearTimeout(watchdog)
    loading.value = false
  }
}

/** van-list 上拉加载 */
const loadMore = () => {
  fetchActiveTab({ reset: false })
}

/** 刷新当前 tab：行情价后台刷（不 await，避免它卡住列表 fetch），列表立即拉 */
const refreshActiveTab = () => {
  tradeStore.getCoinList().catch(() => {})
  fetchActiveTab({ reset: true })
}

/** 切换眼睛 */
const toggleEye = () => {
  showEye.value = !showEye.value
}

/** OrderItem 回调：强制刷新 */
const handleItemUpdate = (val) => {
  // val==1 急速平仓 => 历史委托；val==2 => 止盈止损
  if (val == 1) curActive.value = 3
  else if (val == 2) curActive.value = 2
  refreshActiveTab()
}

/** 更新 user */
const updateUser = () => {
  userStore.getUserInfo()
}

defineExpose({ refreshActiveTab })

/** 切 tab：直接拉第一页（不依赖 van-list 的 @load 首次触发） */
watch(
  () => curActive.value,
  () => {
    showEye.value = true
    refreshActiveTab()
  }
)

/** 切币种：同样刷新当前 tab */
watch(
  () => route.query?.symbol,
  () => {
    refreshActiveTab()
  }
)

onMounted(() => {
  normalizeTabsForEnv()
  userStore.getUserInfo()

  // rxce 默认切到当前委托
  if (['rxce'].includes(__config._APP_ENV)) curActive.value = 1

  // ✅ 关键：首屏直接拉，不等 van-list load
  refreshActiveTab()
})
</script>

<style lang="scss" scoped>
.orderBox {
  position: relative;
}

/* 子 tab — 跟 SecondContract / Spot 同款紫色短下划线
   tab 区占 80% 宽度，右侧 20% 留给刷新等小图标 */
.oc-u-tabs {
  :deep(.van-tabs__wrap) {
    width: 80% !important;
    background: transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    overflow: hidden !important;
  }

  :deep(.van-tabs__nav) {
    background: transparent !important;
    padding: 0 4px;
  }

  :deep(.van-tab) {
    flex: none;
    padding: 0;
    margin-right: 22px;
    font-size: 13px;
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

/* 右侧 20% — 放刷新/眼睛等小图标 */
.tab_right {
  position: absolute;
  top: 0;
  right: 0;
  width: 20%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  padding: 0 16px;
  background: transparent !important;
  z-index: 5;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .entrustRImg {
    width: 18px;
    height: 18px;
    opacity: 0.75;
    cursor: pointer;
    filter: brightness(0) invert(1);
    transition: opacity 0.18s ease;
    flex-shrink: 0;
  }

  .entrustRImg:hover {
    opacity: 1;
  }
}

.listBox {
  padding: 12px 4px 0;
  background: transparent;
  min-height: 300px;
}

:deep(.van-cell) {
  background: transparent !important;
  padding: 0;
  border-bottom: none;
}

/* OrderItem 卡片 deep 覆盖 — 跟 /trade U本位 mode 同款（来自 tradeUstandard.vue .u-trade-wrap deep 样式） */
:deep(.hisToryList) {
  background: #1a1626 !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 14px 10px;
  margin-bottom: 10px;
  box-shadow: none;

  .header {
    display: flex !important;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 6px;

    .headerLeft {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f5f3f8;
      font-size: 13px;
      font-weight: 600;
      flex: 1;
      min-width: 0;
    }

    /* 币对名 SOL/USDT — 与明细行同档 13px */
    .headerLeft .fw-bold {
      font-size: 13px !important;
      font-weight: 600 !important;
      color: #f5f3f8 !important;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.2px;
    }

    /* 杠杆 Nx 小 chip */
    .headerLeftIcon {
      font-size: 11px;
      font-weight: 500;
      color: #aaa5b3;
      padding: 2px 6px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      white-space: nowrap;
    }

    /* Long/Short badge */
    .name {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 7px;
      border-radius: 4px;
      white-space: nowrap;
      letter-spacing: 0.2px;
    }
    .name.bgcBlue {
      background: rgba(49, 196, 141, 0.16) !important;
      color: #31c48d !important;
    }
    .name.bgcRed {
      background: rgba(255, 67, 93, 0.16) !important;
      color: #ff435d !important;
    }

    .headerRight {
      flex-shrink: 0;
      text-align: right;
      background: transparent !important;
      border: none !important;
    }

    /* 右上盈亏率 — 16px 700 + 绿/红 + 发光（订单中心比 trade 窄，缩小一档防遮挡左侧） */
    .yield-big {
      font-family: 'Inter', 'DINOT-Medium', -apple-system, sans-serif !important;
      font-size: 16px !important;
      font-weight: 700 !important;
      line-height: 1.1 !important;
      letter-spacing: 0.2px;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      background: transparent !important;
      border: none !important;
      color: #aaa5b3 !important;
      padding-left: 8px;
    }
    .yield-big.rise {
      color: #31c48d !important;
      text-shadow: 0 0 8px rgba(49, 196, 141, 0.35);
    }
    .yield-big.fall {
      color: #ff435d !important;
      text-shadow: 0 0 8px rgba(255, 67, 93, 0.35);
    }

    /* Order History 右上角文字（完全成交 / 等待成交） — 小 chip，flex-shrink:0 + 左侧留空避免压杠杆 */
    .headerRightNobgc {
      flex-shrink: 0;
      margin-left: 12px;
      font-size: 12px !important;
      font-weight: 600 !important;
      color: #fff !important;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 3px 10px;
      letter-spacing: 0.2px;
      white-space: nowrap;
    }
  }

  /* headerLeft 子元素防溢出：长币对名截断不要把杠杆 chip 挤掉 */
  .header .headerLeft {
    overflow: hidden;
  }
  .header .headerLeft .fw-bold {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    min-width: 0 !important;
  }

  /* 详情行 — 紧凑 */
  .list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .list .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #8c8696 !important;
    padding: 5px 0;
    gap: 8px;
    min-height: 20px;

    > div:first-child {
      flex-shrink: 0;
      font-weight: 400;
    }

    .numItem {
      color: #ebe7f0 !important;
      font-weight: 500;
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-size: 12px;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      letter-spacing: 0.1px;
    }
  }
}

/* 操作按钮（撤单 / 平仓 等） — 紫色胶囊 */
:deep(.hisToryList .bottomList) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  .itemBotton {
    margin: 0 !important;
    height: 30px;
    padding: 0 10px;
    background: rgba(161, 60, 255, 0.12);
    border: 1px solid rgba(161, 60, 255, 0.4);
    color: #c47cff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    min-width: 0;
  }
}

/* 空态 */
.u-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0 24px;
}

.u-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.u-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
