<!-- 跟单详情 -->
<template>
  <div class="copy-detail-page">
    <DarkHeaderBar :title="pageTitle" :border_bottom="true" />

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
              <span>{{ formatCopyTradeTime(order, COPY_TRADE_TIME_FIELD.STRATEGY_START) }}</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_strategy_end_time') }}</span>
              <span>{{ formatCopyTradeTime(order, COPY_TRADE_TIME_FIELD.STRATEGY_END) }}</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_join_time') }}</span>
              <span>{{ formatCopyTradeTime(order, COPY_TRADE_TIME_FIELD.JOIN) }}</span>
            </div>
            <div v-if="isCopyTradeOrderEnded(order)" class="kv">
              <span>{{ _t18('copy_trade_exit_time') }}</span>
              <span>{{ formatCopyTradeTime(order, COPY_TRADE_TIME_FIELD.EXIT) }}</span>
            </div>
            <div v-if="!isCopyTradeOrderEnded(order)" class="kv">
              <span>{{ _t18('copy_trade_current_symbol') }}</span>
              <span>{{ copyTradePositionSymbol(order, t18) }}</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_today_trades') }}</span>
              <span class="ff-num">{{ copyTradeTradeCount(order) }}</span>
            </div>
            <div v-if="isCopyTradeOrderEnded(order)" class="kv">
              <span>{{ _t18('copy_trade_exit_method') }}</span>
              <span>{{ order.exitTypeText || '--' }}</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_profit_share_rate') }}</span>
              <span>{{ profitShareRateText(order.profitShareRate) }}</span>
            </div>
            <div class="kv">
              <span>{{ _t18('copy_trade_trade_fee') }}</span>
              <span class="ff-num">{{ priceFormat(order.tradeFee ?? 0, 2) }} USDT</span>
            </div>
            <div class="kv kv--no-border">
              <span>{{ _t18('copy_trade_profit_share_amt') }}</span>
              <span class="ff-num">{{ priceFormat(order.profitShareAmt ?? 0, 2) }} USDT</span>
            </div>
            <!-- <div v-if="isCopyTradeOrderEnded(order)" class="kv kv--no-border">
              <span>{{ _t18('copy_trade_period_pnl') }}</span>
              <span>{{ _t18('copy_trade_pnl_rate') }}</span>
            </div> -->
          </div>
          <div v-if="isCopyTradeOrderEnded(order)" class="pnl-row">
            <div class="pnl-cell">
              <span class="pnl-cell__label">{{ _t18('copy_trade_pnl_rate') }}</span>
              <span class="ff-num" :class="pnlClass(copyTradeGrossProfit(order))">{{ orderPnlRate(order) }}%</span>
            </div>
            <div class="pnl-cell pnl-cell--right">
              <span class="pnl-cell__label">{{ _t18('copy_trade_net_profit') }}</span>
              <span class="ff-num" :class="pnlClass(orderNetProfit(order))">{{ formatPnl(orderNetProfit(order)) }} USDT</span>
            </div>
          </div>
        </div>

        <div v-if="shouldShowRecordsSection(order)" class="records-wrap">
          <div class="records-section">
            <div class="section-title-row">
              <div class="section-title-left">
                <h3 class="section-title">{{ _t18('copy_trade_records_title') }}</h3>
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

            <template v-if="order._recordGroups?.holding?.length">
              <h4 class="subsection-title">{{ _t18('copy_trade_position_holding') }}</h4>
              <PositionRecordCard
                v-for="(rec, idx) in order._recordGroups.holding"
                :key="rec.orderNo || `h-${idx}`"
                :record="rec"
                :parent-symbol="copyTradeRunningSymbol(order)"
                masked
                :closed="false"
              />
            </template>

            <template v-if="order._recordGroups?.closed?.length">
              <h4 class="subsection-title subsection-title--history">{{ _t18('copy_trade_history_positions') }}</h4>
              <PositionRecordCard
                v-for="(rec, idx) in order._recordGroups.closed"
                :key="rec.orderNo || `c-${idx}`"
                :record="rec"
                :parent-symbol="copyTradeRunningSymbol(order)"
                :masked="false"
                closed
              />
            </template>
          </div>
        </div>
      </div>

      <div
        v-if="primaryOrder.id && !isCopyTradeFullyExited(primaryOrder) && (!isCopyTradeStrategyEnded(primaryOrder) || canManualExitCopyTrade(primaryOrder))"
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
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
  formatProfitShareRate,
  copyTradeNetProfit,
  copyTradeGrossProfit,
  copyTradeGrossPnlRate,
  copyTradeTradeCount,
  copyTradePnlRate,
  copyTradePositionSymbol,
  copyTradeRunningSymbol,
  formatCopyTradeTime,
  COPY_TRADE_TIME_FIELD,
  mergeCopyTradeDetailResponses,
  copyTradeOrderBadgeClass,
  copyTradeOrderStatusText,
  isCopyTradeStrategyEnded,
  isCopyTradeOrderEnded,
  isCopyTradeFullyExited,
  copyTradeOrderDisplayPnl,
  canManualExitCopyTrade
} from './utils'
import { showToast } from 'vant'
import { useTradeStore } from '@/store/trade/index'

const tradeStore = useTradeStore()

const route = useRoute()
const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)

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

const pageTitle = computed(() => {
  const name = String(
    primaryOrder.value?.strategyName || meta.value?.strategy?.strategyName || meta.value?.strategyName || ''
  ).trim()
  if (!name) return t18('copy_trade_detail_title')
  const suffix = t18('copy_trade_detail_suffix')
  const tail = suffix && suffix !== 'copy_trade_detail_suffix' ? suffix : ' Details'
  return `${name}${tail}`
})

function orderProfit(order) {
  return copyTradeOrderDisplayPnl(order)
}

function orderNetProfit(order) {
  return copyTradeNetProfit(order)
}

function orderPnlRate(order) {
  if (isCopyTradeOrderEnded(order)) {
    return copyTradeGrossPnlRate(order)
  }
  return copyTradePnlRate(order)
}

function profitShareRateText(rate) {
  return formatProfitShareRate(rate, t18('copy_trade_profit_share_rate_none'))
}

function shouldShowRecordsSection(order) {
  if (!order) return false
  const holding = order._recordGroups?.holding?.length
  const closed = order._recordGroups?.closed?.length
  if (holding || closed) return true
  return !isCopyTradeOrderEnded(order)
}

async function fetchDetailMerged() {
  const id = route.query.id
  if (!id) return { meta: {}, orders: [] }
  const [res0, res1] = await Promise.all([getCopyTradeDetail(id, 0), getCopyTradeDetail(id, 1)])
  return mergeCopyTradeDetailResponses(
    res0?.code == 200 ? res0 : null,
    res1?.code == 200 ? res1 : null
  )
}

async function loadDetail() {
  pageLoading.value = true
  try {
    const merged = await fetchDetailMerged()
    meta.value = merged.meta
    orders.value = merged.orders
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
    await tradeStore.getCoinList()
    const merged = await fetchDetailMerged()
    meta.value = merged.meta
    orders.value = merged.orders
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
  tradeStore.getCoinList()
  loadDetail()
})
</script>

<style lang="scss" scoped>
$green: #17ac74;

.copy-detail-page {
  min-height: 100vh;
  background: #f6f7fa;
  padding-bottom: 80px;
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
.subsection-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;

  &--history {
    margin-top: 4px;
  }
}
.pnl-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0 4px;
  border-top: 1px dashed #eee;
  margin-top: 4px;
}
.pnl-cell {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--right {
    align-items: flex-end;
    text-align: right;
  }

  &__label {
    font-size: 13px;
    color: #888;
  }

  .ff-num {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a1a;
    &.is-up { color: $green; }
    &.is-down { color: #e8503a; }
  }
}
.records-wrap {
  margin-top: 4px;
}
.records-section {
  padding: 0 15px;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
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
