<template>
  <div class="orderBox">
    <van-tabs
      v-model:active="curActive"
      shrink
      color="transparent"
      title-active-color="#17AC74"
      title-inactive-color="#5d626d"
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

          <Nodata v-if="!loading && showList.length === 0" />
        </div>
      </van-tab>
    </van-tabs>

    <div class="tab_right">
      <!-- <svg-load
        :name="showEye ? 'yanjin-k' : 'yanjin-g'"
        class="entrustRImg"
        @click="toggleEye"
      /> -->
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

// 复用 trade 的 item 渲染
import OrderItem from '@/views/trade/components/ustandard/content/EntrustOrderItem.vue'

// API
import { contractHistoryList, contractLossList, orderList } from '@/api/trade/index'

const route = useRoute()
const userStore = useUserStore()
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

  try {
    // 注意：trade 里 tab0/tab3 用 contractHistoryList，tab1 用 orderList，tab2 用 contractLossList
    let res = null

    if (curActive.value === 0) {
      res = await contractHistoryList({ status: 0, pageSize: pageSize.value, pageNum: pageNum.value })
      if (res?.code == '200') {
        tabList.value.find(t => t.value === 0).num = Number(res.total || 0)
      }
    } else if (curActive.value === 1) {
      res = await orderList({ status: 0, pageSize: pageSize.value, pageNum: pageNum.value })
      if (res?.code == '200') {
        tabList.value.find(t => t.value === 1).num = Number(res.total || 0)
      }
    } else if (curActive.value === 2) {
      res = await contractLossList({ pageSize: pageSize.value, pageNum: pageNum.value })
      if (res?.code == '200') {
        tabList.value.find(t => t.value === 2).num = Number(res.total || 0)
      }
    } else if (curActive.value === 3) {
      res = await contractHistoryList({ status: 1, pageSize: pageSize.value, pageNum: pageNum.value })
      if (res?.code == '200') {
        tabList.value.find(t => t.value === 3).num = Number(res.total || 0)
      }
    }

    if (res?.code == '200') {
      const rows = res.rows || []
      if (rows.length) {
        tabData.value[curActive.value].push(...rows)
        pageNum.value += 1
      }
      // finished：rows 为空 或者 已经 >= total
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
    loading.value = false
  }
}

/** van-list 上拉加载 */
const loadMore = () => {
  fetchActiveTab({ reset: false })
}

/** 刷新当前 tab */
const refreshActiveTab = () => {
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
:deep(.van-tabs__wrap) {
  border-bottom: 1px solid var(--ex-border-color);
}
:deep(.van-tabs__nav) {
  padding-right: 80px;
  background: var(--bgColor) !important;
}
.tab_right {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--bgColor) !important;
  padding: 15px 5px;

  .entrustRImg {
    padding: 10px 12px 0px 0px;
    font-size: 12px;
  }
}
.listBox {
  padding: 0;
  min-height: 300px;
}
.van-cell {
  background: var(--bgColor) !important;
  padding: 0;
  border-bottom: 1px solid var(--ex-border-color);
}
</style>
