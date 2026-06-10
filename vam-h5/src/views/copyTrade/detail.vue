<!-- 跟单详情 -->
<template>
  <div class="copy-detail-page">
    <DarkHeaderBar :title="_t18('copy_trade_detail_title')" :border_bottom="true" />

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

    <van-loading v-if="pageLoading" class="page-loading" />
    <template v-else-if="orders.length">
      <div v-for="order in orders" :key="order.id" class="order-block">
        <div class="summary-card">
          <div class="summary-card__head">
            <img v-if="order.icon" :src="order.icon" class="avatar avatar--img" alt="" />
            <div v-else class="avatar">{{ (order.strategyName || meta.strategyName || '?')[0] }}</div>
            <div>
              <p class="name">{{ order.strategyName || meta.strategyName }}</p>
              <span class="badge" :class="order.status === 0 ? 'badge--ongoing' : 'badge--settled'">
                {{ orderStatusText(order) }}
              </span>
            </div>
          </div>
          <div class="kv-list">
            <div class="kv">
              <span>{{ _t18('copy_trade_amount') }}</span>
              <span class="ff-num">{{ priceFormat(order.amount) }} USDT</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_strategy_start_time') }}</span>
              <span>{{ formatCopyTradeStrategyStartTime(order) }}</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_strategy_end_time') }}</span>
              <span>{{ formatCopyTradeStrategyEndTime(order) }}</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_join_time') }}</span>
              <span>{{ formatCopyTradeJoinTime(order) }}</span>
            </div>
            <div v-if="order.status === 1" class="kv">
              <span>{{ _t18('copy_trade_exit_time') }}</span>
              <span>{{ order.endTime || '--' }}</span>
            </div>
            <div v-if="order.status === 0" class="kv">
              <span>{{ _t18('copy_trade_current_symbol') }}</span>
              <span>{{ copyTradePositionSymbol(order, t18) }}</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_today_trades') }}</span>
              <span class="ff-num">{{ copyTradeTradeCount(order) }}</span>
            </div>
            <div v-if="order.status === 1" class="kv">
              <span>{{ _t18('copy_trade_exit_method') }}</span>
              <span>{{ _t18('copy_trade_exit_normal') }}</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_profit_share_rate') }}</span>
              <span>{{ profitShareRateText(order.profitShareRate) }}</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_trade_fee') }}</span>
              <span class="ff-num">{{ priceFormat(order.tradeFee ?? 0, 2) }} USDT</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_profit_share_amt') }}</span>
              <span class="ff-num">{{ priceFormat(order.profitShareAmt ?? 0) }} USDT</span>
            </div>
            <template v-if="order.status === 1">
              <div class="kv kv--no-border">
                <span>{{ _t18('copy_trade_period_pnl') }}</span>
                <span>{{ _t18('copy_trade_pnl_rate') }}</span>
              </div>
            </template>
          </div>
          <template v-if="order.status === 1">
            <div class="pnl-row">
              <span class="ff-num" :class="pnlClass(orderProfit(order))">{{ formatPnl(orderProfit(order)) }} USDT</span>
              <span class="ff-num" :class="pnlClass(orderProfit(order))">{{ orderPnlRate(order) }}%</span>
            </div>
            <div class="pnl-actual">
              <span class="label">{{ _t18('copy_trade_net_profit') }}</span>
              <span class="ff-num" :class="pnlClass(orderNetProfit(order))">{{ formatPnl(orderNetProfit(order)) }} USDT</span>
            </div>
          </template>
        </div>

        <div
          v-if="getRecordGroups(order).holding.length || getRecordGroups(order).closed.length"
          class="records-wrap"
        >
          <div v-if="getRecordGroups(order).holding.length" class="records-section">
            <h3 class="section-title">{{ _t18('copy_trade_position_holding') }}</h3>
            <PositionRecordCard
              v-for="(rec, idx) in getRecordGroups(order).holding"
              :key="rec.orderNo || `h-${idx}`"
              :record="rec"
              :parent-symbol="copyTradeRunningSymbol(order)"
              masked
              :closed="false"
            />
          </div>
          <div v-if="getRecordGroups(order).closed.length" class="records-section">
            <h3 class="section-title">{{ _t18('copy_trade_history_positions') }}</h3>
            <PositionRecordCard
              v-for="(rec, idx) in getRecordGroups(order).closed"
              :key="rec.orderNo || `c-${idx}`"
              :record="rec"
              :parent-symbol="copyTradeRunningSymbol(order)"
              :masked="false"
              closed
            />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 0 && primaryOrder.id && primaryOrder.status === 0" class="action-bar">
        <button type="button" class="append-btn" @click="openAppend">
          {{ _t18('copy_trade_append') }}
        </button>
        <button type="button" class="stop-btn" @click="openStop">
          {{ _t18('copy_trade_stop') }}
        </button>
      </div>
    </template>
    <Nodata v-else />

    <StopConfirmDialog
      v-model:show="stopVisible"
      :rows="stopRows"
      :loading="stopLoading"
      @confirm="confirmStop"
    />
    <AppendDialog
      v-model:show="appendVisible"
      :item="primaryOrder"
      :loading="appendLoading"
      @confirm="confirmAppend"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import PositionRecordCard from './components/PositionRecordCard.vue'
import StopConfirmDialog from './components/StopConfirmDialog.vue'
import AppendDialog from './components/AppendDialog.vue'
import { _t18 } from '@/utils/public'
import { getCopyTradeDetail, exitCopyTrade, appendCopyTrade } from '@/api/copyTrade'
import { priceFormat } from '@/utils/decimal'
import {
  formatPnl,
  pnlClass,
  calcPnlRate,
  formatProfitShareRate,
  copyTradeNetProfit,
  copyTradeTradeCount,
  copyTradePnlRate,
  copyTradePositionSymbol,
  copyTradeRunningSymbol,
  formatCopyTradeStrategyStartTime,
  formatCopyTradeStrategyEndTime,
  formatCopyTradeJoinTime,
  normalizeCopyTradeDetailResponse,
  splitCopyTradeRecords
} from './utils'
import { showToast } from 'vant'

const route = useRoute()
const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)

function resolveDetailTab(query = {}) {
  const raw = query.status ?? query.tab
  const tab = Number(raw)
  return tab === 1 ? 1 : 0
}

const activeTab = ref(resolveDetailTab(route.query))
const meta = ref({})
const orders = ref([])
const pageLoading = ref(true)

const stopVisible = ref(false)
const stopLoading = ref(false)
const stopRows = ref([])
const appendVisible = ref(false)
const appendLoading = ref(false)

const primaryOrder = computed(() => {
  const anchorId = route.query.id
  if (anchorId != null) {
    const matched = orders.value.find((o) => String(o.id) === String(anchorId))
    if (matched) return matched
  }
  return orders.value[0] || {}
})

function orderStatusText(order) {
  if (order?.params?.statusText) return order.params.statusText
  if (order?.status === 0) return t18('copy_trade_tab_ongoing')
  return t18('copy_trade_settled')
}

function orderProfit(order) {
  if (order?.status === 1) return order.actualProfit
  return copyTradeNetProfit(order)
}

function orderNetProfit(order) {
  return copyTradeNetProfit(order)
}

function orderPnlRate(order) {
  if (order?.status === 1) return calcPnlRate(orderProfit(order), order.amount)
  return copyTradePnlRate(order)
}

function getRecordGroups(order) {
  return splitCopyTradeRecords(order?.records)
}

function profitShareRateText(rate) {
  return formatProfitShareRate(rate, t18('copy_trade_profit_share_rate_none'))
}

function switchTab(tab) {
  if (activeTab.value === tab) return
  activeTab.value = tab
  loadDetail()
}

async function loadDetail() {
  pageLoading.value = true
  try {
    const res = await getCopyTradeDetail(route.query.id, activeTab.value)
    if (res?.code == 200) {
      const parsed = normalizeCopyTradeDetailResponse(res)
      meta.value = parsed.meta
      orders.value = parsed.orders
    } else {
      meta.value = {}
      orders.value = []
    }
  } catch (e) {
    meta.value = {}
    orders.value = []
    void e
  } finally {
    pageLoading.value = false
  }
}

function openAppend() {
  appendVisible.value = true
}

async function confirmAppend(amount) {
  appendLoading.value = true
  try {
    const res = await appendCopyTrade({ id: primaryOrder.value.id, amount })
    if (res?.code == 200) {
      showToast(res.msg || t18('copy_trade_append_success'))
      appendVisible.value = false
      await loadDetail()
    } else {
      showToast(res?.msg)
    }
  } catch (e) {
    void e
  } finally {
    appendLoading.value = false
  }
}

function openStop() {
  const order = primaryOrder.value
  stopRows.value = [
    { label: t18('copy_trade_amount'), value: `${priceFormat(order.amount)} USDT`, cls: '' },
    {
      label: t18('copy_trade_trade_fee'),
      value: `${priceFormat(order.tradeFee ?? 0, 2)} USDT`,
      cls: ''
    },
    {
      label: t18('copy_trade_profit_share_amt'),
      value: `${priceFormat(order.profitShareAmt ?? 0)} USDT`,
      cls: ''
    }
  ]
  stopVisible.value = true
}

async function confirmStop() {
  stopLoading.value = true
  try {
    const res = await exitCopyTrade({ id: primaryOrder.value.id })
    if (res?.code == 200) {
      showToast(res.msg || t18('copy_trade_exit_success'))
      stopVisible.value = false
      await loadDetail()
    } else {
      showToast(res?.msg)
    }
  } catch (e) {
    void e
  } finally {
    stopLoading.value = false
  }
}

onMounted(() => {
  activeTab.value = resolveDetailTab(route.query)
  loadDetail()
})

watch(
  () => route.query.status,
  () => {
    const tab = resolveDetailTab(route.query)
    if (activeTab.value === tab) return
    activeTab.value = tab
    loadDetail()
  }
)
</script>

<style lang="scss" scoped>
$green: #17ac74;

.copy-detail-page {
  min-height: 100vh;
  background: #f6f7fa;
  padding-bottom: 80px;
}
.tabs {
  display: flex;
  margin: 12px 15px 0;
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
.page-loading {
  display: flex;
  justify-content: center;
  padding: 48px;
}
.order-block {
  margin-bottom: 8px;
}
.summary-card {
  margin: 12px 15px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  &__head {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 14px;
  }
  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #666;
    flex-shrink: 0;
    &--img {
      display: block;
      object-fit: cover;
      background: #f2f4f7;
    }
  }
  .name {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 6px;
  }
  .badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    &--ongoing {
      background: rgba($green, 0.12);
      color: $green;
    }
    &--settled {
      background: #f2f2f2;
      color: #888;
    }
  }
}
.kv-list .kv {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid #f8f8f8;
  span:first-child { color: #888; }
  &.kv--no-border { border-bottom: none; }
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
.pnl-actual {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
  .label { font-size: 14px; color: #888; }
  .ff-num {
    font-size: 20px;
    font-weight: 700;
    &.is-up { color: $green; }
    &.is-down { color: #e8503a; }
  }
}
.records-wrap {
  margin-top: 4px;
}
.records-section {
  padding: 0 15px;
  & + .records-section {
    margin-top: 12px;
  }
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px;
}
.action-bar {
  position: fixed;
  left: 15px;
  right: 15px;
  bottom: calc(16px + env(safe-area-inset-bottom, 0));
  max-width: calc(var(--ex-max-width, 100%) - 30px);
  margin: 0 auto;
  display: flex;
  gap: 10px;
}
.append-btn,
.stop-btn {
  flex: 1;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  border: none;
}
.append-btn {
  background: #fff;
  border: 1px solid $green;
  color: $green;
}
.stop-btn {
  background: $green;
  color: #fff;
}
</style>
