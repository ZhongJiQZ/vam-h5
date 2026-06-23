<!-- 跟单详情 -->
<template>
  <div class="copy-detail-page">
    <CopyTradeHeader :title="_t18('copy_trade_detail_title')" :border-bottom="true" />

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
              <span class="badge" :class="copyTradeOrderBadgeClass(order)">
                {{ copyTradeOrderStatusText(order, t18) }}
              </span>
            </div>
          </div>
          <div class="kv-list">
            <div class="kv">
              <span>{{ _t18('copy_trade_amount') }}</span>
              <span class="ff-num">{{ priceFormat(order.amount, 2) }} USDT</span>
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
              <span>{{ formatCopyTradeExitTime(order) }}</span>
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
              <span>{{ order.exitTypeText }}</span>
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
              <span class="ff-num">{{ priceFormat(order.profitShareAmt ?? 0, 2) }} USDT</span>
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
          v-if="activeTab === 0 || (activeTab === 1 && order._recordGroups?.closed?.length)"
          class="records-wrap"
        >
          <div v-if="activeTab === 0" class="records-section">
            <div class="section-title-row">
              <div class="section-title-left">
                <h3 class="section-title">{{ _t18('copy_trade_position_holding') }}</h3>
                <button type="button" class="section-info-btn" @click.stop="showExplain = true">
                  <img src="@/assets/images/Frame 10711.png" alt="" class="section-info-icon" />
                </button>
              </div>
              <button
                type="button"
                class="section-refresh-btn"
                :disabled="sectionRefreshing"
                @click="refreshOrderFromList"
              >
                <img
                  src="@/assets/images/copy-trade-refresh.png"
                  alt=""
                  class="section-refresh-icon"
                  :class="{ 'is-spinning': sectionRefreshing }"
                />
              </button>
            </div>
            <PositionRecordCard
              v-for="(rec, idx) in order._recordGroups?.holding || []"
              :key="rec.orderNo || `h-${idx}`"
              :record="rec"
              :parent-symbol="copyTradeRunningSymbol(order)"
              masked
              :closed="false"
            />
          </div>
          <div v-if="activeTab === 1 && order._recordGroups?.closed?.length" class="records-section">
            <h3 class="section-title">{{ _t18('copy_trade_history_positions') }}</h3>
            <PositionRecordCard
              v-for="(rec, idx) in order._recordGroups.closed"
              :key="rec.orderNo || `c-${idx}`"
              :record="rec"
              :parent-symbol="copyTradeRunningSymbol(order)"
              :masked="false"
              closed
            />
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 0 && primaryOrder.id && primaryOrder.status === 0 && (!isCopyTradeStrategyEnded(primaryOrder) || canManualExitCopyTrade(primaryOrder))"
        class="action-bar"
      >
        <button v-if="!isCopyTradeStrategyEnded(primaryOrder)" type="button" class="append-btn" @click="openAppend">
          {{ _t18('copy_trade_append') }}
        </button>
        <button
          v-if="canManualExitCopyTrade(primaryOrder)"
          type="button"
          class="stop-btn"
          @click="openStop"
        >
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
    <CopyTradeMaskExplainPopup v-model:show="showExplain" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CopyTradeHeader from './components/CopyTradeHeader.vue'
import PositionRecordCard from './components/PositionRecordCard.vue'
import StopConfirmDialog from './components/StopConfirmDialog.vue'
import AppendDialog from './components/AppendDialog.vue'
import CopyTradeMaskExplainPopup from './components/CopyTradeMaskExplainPopup.vue'
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
  formatCopyTradeExitTime,
  normalizeCopyTradeDetailResponse,
  attachCopyTradeOrderViewModelForDetailTab,
  copyTradeOrderBadgeClass,
  copyTradeOrderStatusText,
  isCopyTradeStrategyEnded,
  canManualExitCopyTrade
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
const sectionRefreshing = ref(false)

const stopVisible = ref(false)
const stopLoading = ref(false)
const stopRows = ref([])
const appendVisible = ref(false)
const appendLoading = ref(false)
const showExplain = ref(false)

const primaryOrder = computed(() => {
  const anchorId = route.query.id
  if (anchorId != null) {
    const matched = orders.value.find((o) => String(o.id) === String(anchorId))
    if (matched) return matched
  }
  return orders.value[0] || {}
})

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

function profitShareRateText(rate) {
  return formatProfitShareRate(rate, t18('copy_trade_profit_share_rate_none'))
}

function mapOrdersForActiveTab(orders) {
  return (Array.isArray(orders) ? orders : []).map((order) =>
    attachCopyTradeOrderViewModelForDetailTab(order, activeTab.value)
  )
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
      orders.value = mapOrdersForActiveTab(parsed.orders)
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

async function refreshOrderFromList() {
  if (sectionRefreshing.value || pageLoading.value) return

  sectionRefreshing.value = true
  try {
    const res = await getCopyTradeDetail(route.query.id, activeTab.value)
    if (res?.code == 200) {
      const parsed = normalizeCopyTradeDetailResponse(res)
      meta.value = parsed.meta
      orders.value = mapOrdersForActiveTab(parsed.orders)
    }
  } catch (e) {
    void e
  } finally {
    sectionRefreshing.value = false
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
    { label: t18('copy_trade_amount'), value: `${priceFormat(order.amount, 2)} USDT`, cls: '' },
    {
      label: t18('copy_trade_trade_fee'),
      value: `${priceFormat(order.tradeFee ?? 0, 2)} USDT`,
      cls: ''
    },
    {
      label: t18('copy_trade_profit_share_amt'),
      value: `${priceFormat(order.profitShareAmt ?? 0, 2)} USDT`,
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
@use './styles/theme.scss' as ct;

.copy-detail-page {
  @include ct.ct-page-bg;
  padding-bottom: 80px;
}

.tabs {
  @include ct.ct-pill-tabs;
  margin: 12px 15px 0;

  .tab {
    height: 36px;
    font-size: 14px;
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
  @include ct.ct-card;
  margin: 12px 15px;
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
    @include ct.ct-avatar-ph;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: ct.$ct-text-secondary;
    flex-shrink: 0;

    &--img {
      display: block;
      object-fit: cover;
      background: ct.$ct-card-bg;
    }
  }

  .name {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 6px;
    color: ct.$ct-text-primary;
  }

  .badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;

    &--ongoing {
      @include ct.ct-badge-on;
    }

    &--settled {
      @include ct.ct-badge-off;
    }
  }
}

.kv-list .kv {
  @include ct.ct-kv-row;
  padding: 8px 0;
  border-bottom: 1px solid ct.$ct-divider;

  &.kv--no-border {
    border-bottom: none;
  }
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.section-info-btn {
  border: none;
  background: none;
  padding: 0;
  line-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-info-icon {
  width: 18px;
  height: 18px;
  display: block;
}

.section-refresh-btn {
  width: 32px;
  height: 32px;
  padding: 6px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.55;
  }
}

.section-refresh-icon {
  width: 20px;
  height: 20px;
  display: block;

  &.is-spinning {
    animation: copy-trade-refresh-spin 0.8s linear infinite;
  }
}

@keyframes copy-trade-refresh-spin {
  to {
    transform: rotate(360deg);
  }
}

.pnl-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0 4px;

  .ff-num {
    font-size: 18px;
    font-weight: 600;
    color: ct.$ct-text-primary;

    &.is-up {
      @include ct.ct-is-up;
    }

    &.is-down {
      @include ct.ct-is-down;
    }
  }
}

.pnl-actual {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed ct.$ct-divider;

  .label {
    font-size: 14px;
    color: ct.$ct-text-secondary;
  }

  .ff-num {
    font-size: 20px;
    font-weight: 700;

    &.is-up {
      @include ct.ct-is-up;
    }

    &.is-down {
      @include ct.ct-is-down;
    }
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
  margin: 0;
  color: ct.$ct-text-primary;
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
  border-radius: 999px;
  font-size: 16px;
  border: none;
}

.append-btn {
  @include ct.ct-btn-outline;
}

.stop-btn {
  @include ct.ct-btn-primary;
}
</style>
