<!-- 我的跟单 -->
<template>
  <div class="my-copy-page">
    <DarkHeaderBar :title="_t18('copy_trade_my')" :border_bottom="false" />

    <div class="tabs">
      <button
        type="button"
        class="tab"
        :class="{ active: activeTab === 0 }"
        @click="switchTab(0)"
      >
        {{ _t18('copy_trade_tab_ongoing') }}
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: activeTab === 1 }"
        @click="switchTab(1)"
      >
        {{ _t18('copy_trade_tab_ended') }}
      </button>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <!-- 已结束：汇总 -->
      <div v-if="activeTab === 1 && endedSummary" class="ended-summary">
        <div class="kv">
          <span>{{ _t18('copy_trade_subscribe_time') }}</span>
          <span>{{ endedSummary.firstTime || '--' }}</span>
        </div>
        <div class="kv">
          <span>{{ _t18('copy_trade_days') }}</span>
          <span>{{ endedSummary.days }}{{ _t18('copy_trade_day_unit') }}</span>
        </div>
        <div class="kv">
          <span>{{ _t18('copy_trade_times') }}</span>
          <span>{{ endedSummary.count }}{{ _t18('copy_trade_times_unit') }}</span>
        </div>
        <div class="kv">
          <span>{{ _t18('copy_trade_total_profit') }}</span>
          <span class="ff-num is-up">{{ formatPnl(endedSummary.totalProfit) }} USDT</span>
        </div>
        <div class="kv">
          <span>{{ _t18('copy_trade_total_profit_rate') }}</span>
          <span class="ff-num is-up">{{ endedSummary.totalRate }}%</span>
        </div>
        <div class="kv">
          <span>{{ _t18('copy_trade_service_fee') }}</span>
          <span>--</span>
        </div>
        <div class="kv">
          <span>{{ _t18('copy_trade_inst_profit_share') }}</span>
          <span>--</span>
        </div>
        <div class="kv kv--no-border">
          <span>{{ _t18('copy_trade_actual_profit') }}</span>
          <span class="ff-num is-up summary-actual">--</span>
        </div>
      </div>

      <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="list.length ? _t18('no_more_data') : ''"
        :loading-text="_t18('loading')"
        @load="onLoad"
      >
        <!-- 进行中 -->
        <template v-if="activeTab === 0">
          <div
            v-for="item in list"
            :key="item.id"
            class="order-card"
            @click="goDetail(item.id)"
          >
            <div class="order-card__head">
              <img v-if="item.icon" :src="item.icon" class="avatar avatar--img" alt="" />
              <div v-else class="avatar">{{ (item.strategyName || '?')[0] }}</div>
              <div class="head-info">
                <p class="name">{{ item.strategyName }}</p>
                <span class="badge badge--ongoing">{{ item.params?.statusText || _t18('copy_trade_tab_ongoing') }}</span>
              </div>
            </div>
            <div class="kv-list">
              <div class="kv">
                <span>{{ _t18('copy_trade_amount') }}</span>
                <span class="ff-num">{{ priceFormat(item.amount) }} USDT</span>
              </div>
              <div class="kv">
                <span>{{ _t18('copy_trade_start_time') }}</span>
                <span>{{ item.startTime || '--' }}</span>
              </div>
              <div class="kv">
                <span>{{ _t18('copy_trade_current_symbol') }}</span>
                <span>{{ symbolPair(item.symbol) }}</span>
              </div>
              <div class="kv">
                <span>{{ _t18('copy_trade_today_trades') }}</span>
                <span class="ff-num">{{ item.tradeCount ?? 0 }}</span>
              </div>
              <div class="kv kv--no-border">
                <span>{{ _t18('copy_trade_current_pnl') }}</span>
                <span>{{ _t18('copy_trade_pnl_rate') }}</span>
              </div>
            </div>
            <div class="pnl-row">
              <span class="ff-num" :class="pnlClass(currentPnl(item))">{{ formatPnl(currentPnl(item)) }} USDT</span>
              <span class="ff-num" :class="pnlClass(currentPnl(item))">{{ calcPnlRate(currentPnl(item), item.amount) }}%</span>
            </div>
            <div class="card-actions" @click.stop>
              <button type="button" class="append-btn" @click="openAppend(item)">
                {{ _t18('copy_trade_append') }}
              </button>
            </div>
            <p class="detail-link">{{ _t18('copy_trade_view_detail') }} ›</p>
          </div>
        </template>

        <!-- 已结束列表 -->
        <template v-else>
          <div
            v-for="item in list"
            :key="item.id"
            class="ended-card"
            @click="goDetail(item.id)"
          >
            <div class="ended-card__head">
              <img v-if="item.icon" :src="item.icon" class="avatar avatar--img" alt="" />
              <div v-else class="avatar">{{ (item.strategyName || '?')[0] }}</div>
              <p class="name">{{ item.strategyName }}</p>
              <button class="share-btn" @click.stop="openShare(item)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
            <div class="kv-list">
              <div class="kv">
                <span>{{ _t18('copy_trade_amount') }}</span>
                <span class="ff-num">{{ priceFormat(item.amount) }} USDT</span>
              </div>
              <div class="kv">
                <span>{{ _t18('copy_trade_join_time') }}</span>
                <span>{{ item.startTime || '--' }}</span>
              </div>
              <div class="kv">
                <span>{{ _t18('copy_trade_exit_time') }}</span>
                <span>{{ item.endTime || '--' }}</span>
              </div>
              <div class="kv kv--no-border">
                <span>{{ _t18('copy_trade_period_pnl') }}</span>
                <span>{{ _t18('copy_trade_pnl_rate') }}</span>
              </div>
            </div>
            <div class="pnl-row">
              <span class="ff-num" :class="pnlClass(item.actualProfit)">{{ formatPnl(item.actualProfit) }} USDT</span>
              <span class="ff-num" :class="pnlClass(item.actualProfit)">{{ calcPnlRate(item.actualProfit, item.amount) }}%</span>
            </div>
            <p class="detail-link">{{ _t18('copy_trade_view_detail') }} ›</p>
          </div>
        </template>

        <Nodata v-if="!loading && list.length === 0 && loadedOnce" />
      </van-list>
    </van-pull-refresh>
  <ShareDialog v-model:show="shareVisible" :item="shareItem" />
  <AppendDialog
    v-model:show="appendVisible"
    :item="appendItem"
    :loading="appendLoading"
    @confirm="confirmAppend"
  />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import ShareDialog from './components/ShareDialog.vue'
import AppendDialog from './components/AppendDialog.vue'
import { _t18 } from '@/utils/public'
import { getCopyTradeList, appendCopyTrade } from '@/api/copyTrade'
import { priceFormat, _add } from '@/utils/decimal'
import { symbolPair, formatPnl, pnlClass, calcPnlRate } from './utils'
import dayjs from '@/plugin/dayjs/index'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)
const activeTab = ref(0)
const list = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const loadedOnce = ref(false)
const shareVisible = ref(false)
const shareItem = ref({})
const appendVisible = ref(false)
const appendItem = ref({})
const appendLoading = ref(false)

function currentPnl(item) {
  return item?.params?.totalSettledProfit ?? item?.actualProfit ?? 0
}

function cycleRange(item) {
  const start = item?.startTime || '--'
  const end = item?.endTime || '--'
  return `${start} ~ ${end}`
}

function cycleProgress(item) {
  const done = Number(item?.tradeCount ?? 0)
  const totalCount = Number(item?.expectedTradeCount ?? 0)
  if (!totalCount) return `${done}`
  return `${done}/${totalCount}`
}

const endedSummary = computed(() => {
  if (activeTab.value !== 1 || !list.value.length) return null
  let totalProfit = 0
  let totalAmount = 0
  let firstTime = ''
  list.value.forEach((item) => {
    const p = Number(item.actualProfit) || 0
    totalProfit = _add(totalProfit, p)
    totalAmount = _add(totalAmount, Number(item.amount) || 0)
    if (!firstTime && item.startTime) firstTime = item.startTime.split(' ')[0]
  })
  const totalRate = totalAmount ? calcPnlRate(totalProfit, totalAmount) : '0.00'
  const days =
    list.value.length && list.value[0].startTime
      ? Math.max(1, dayjs().diff(dayjs(list.value[list.value.length - 1].startTime), 'day') + 1)
      : 0
  return {
    firstTime,
    days,
    count: total.value || list.value.length,
    totalProfit,
    totalRate
  }
})

function switchTab(tab) {
  if (activeTab.value === tab) return
  activeTab.value = tab
  resetList()
}

function resetList() {
  list.value = []
  pageNum.value = 1
  finished.value = false
  loadedOnce.value = false
  onLoad()
}

async function fetchList() {
  const res = await getCopyTradeList({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    status: activeTab.value
  })
  if (res?.code == 200) {
    total.value = res.total ?? 0
    return res.rows || []
  }
  finished.value = true
  return []
}

async function onLoad() {
  if (finished.value && pageNum.value > 1) return
  loading.value = true
  try {
    const rows = await fetchList()
    list.value = [...list.value, ...rows]
    loadedOnce.value = true
    if (list.value.length >= total.value || rows.length < pageSize.value) {
      finished.value = true
    } else {
      pageNum.value++
    }
  } catch (e) {
    finished.value = true
    void e
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onRefresh() {
  list.value = []
  pageNum.value = 1
  finished.value = false
  onLoad()
}

function goDetail(id) {
  router.push({ path: '/copy-trade/detail', query: { id } })
}

function openShare(item) {
  shareItem.value = item
  shareVisible.value = true
}

function openAppend(item) {
  appendItem.value = item
  appendVisible.value = true
}

async function confirmAppend(amount) {
  appendLoading.value = true
  try {
    const res = await appendCopyTrade({ id: appendItem.value.id, amount })
    if (res?.code == 200) {
      showToast(res.msg || t18('copy_trade_append_success'))
      appendVisible.value = false
      onRefresh()
    } else {
      showToast(res?.msg)
    }
  } catch (e) {
    void e
  } finally {
    appendLoading.value = false
  }
}

onMounted(() => resetList())
</script>

<style lang="scss" scoped>
$green: #17ac74;

.my-copy-page {
  min-height: 100vh;
  background: #f6f7fa;
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
.tabs {
  display: flex;
  margin: 12px 15px;
  background: #fff;
  border-radius: 8px;
  padding: 4px;
  .tab {
    flex: 1;
    height: 36px;
    border: none;
    border-radius: 6px;
    background: transparent;
    font-size: 14px;
    color: #666;
    &.active {
      background: #2c2c2c;
      color: #fff;
      font-weight: 500;
    }
  }
}
.ended-summary {
  margin: 0 15px 12px;
  background: linear-gradient(135deg, #061a0f 0%, #0d5535 55%, #17ac74 100%);
  border-radius: 12px;
  padding: 4px 16px;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 140px; height: 140px;
    border: 22px solid rgba(255,255,255,0.05);
    border-radius: 50%;
    pointer-events: none;
  }
  &::after {
    content: '';
    position: absolute;
    top: 20px; right: 30px;
    width: 70px; height: 70px;
    border: 12px solid rgba(255,255,255,0.04);
    border-radius: 50%;
    pointer-events: none;
  }
  .kv {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    font-size: 14px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    span:first-child { color: rgba(255,255,255,0.6); }
    span:last-child { color: rgba(255,255,255,0.9); }
    &.kv--no-border { border-bottom: none; }
  }
  .is-up { color: #4dffa8 !important; }
  .summary-actual { font-size: 17px; font-weight: 600; color: #4dffa8 !important; }
}

.order-card,
.ended-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
}
.order-card__head,
.ended-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
  flex-shrink: 0;
  &--img {
    display: block;
    object-fit: cover;
    background: #f2f4f7;
  }
}
.head-info {
  .name {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 6px;
  }
}
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  &--ongoing {
    background: rgba($green, 0.12);
    color: $green;
  }
}
.kv-list .kv {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f8f8f8;
  span:first-child {
    color: #888;
  }
  .is-up {
    color: $green;
  }
  .is-down {
    color: #e8503a;
  }
}
.kv--no-border {
  border-bottom: none !important;
}
.pnl-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0 4px;
  .ff-num {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    &.is-up { color: $green; }
    &.is-down { color: #e8503a; }
  }
}
.card-actions {
  margin-top: 12px;
}
.append-btn {
  width: 100%;
  height: 36px;
  border: 1px solid $green;
  border-radius: 8px;
  background: rgba($green, 0.08);
  color: $green;
  font-size: 14px;
  font-weight: 500;
}
.order-card,
.ended-card {
  .detail-link {
    text-align: right;
    font-size: 13px;
    color: $green;
    margin: 8px 0 0;
  }
}
.ended-card {
  .name {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    flex: 1;
  }
}
.share-btn {
  background: none;
  border: none;
  padding: 4px;
  color: #999;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
:deep(.van-list) {
  padding: 0 15px;
}
</style>
