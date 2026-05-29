<!-- 跟单详情 -->
<template>
  <div class="copy-detail-page">
    <DarkHeaderBar :title="_t18('copy_trade_detail_title')" :border_bottom="true" />

    <van-loading v-if="pageLoading" class="page-loading" />
    <template v-else-if="detail.id">
      <div class="summary-card">
        <div class="summary-card__head">
          <img v-if="detail.icon" :src="detail.icon" class="avatar avatar--img" alt="" />
          <div v-else class="avatar">{{ (detail.strategyName || '?')[0] }}</div>
          <div>
            <p class="name">{{ detail.strategyName }}</p>
            <span class="badge" :class="detail.status === 0 ? 'badge--ongoing' : 'badge--settled'">
              {{ statusText }}
            </span>
          </div>
        </div>
        <div class="kv-list">
          <div class="kv">
            <span>{{ _t18('copy_trade_amount') }}</span>
            <span class="ff-num">{{ priceFormat(detail.amount) }} USDT</span>
          </div>
          <div class="kv">
            <span>{{ _t18('copy_trade_join_time') }}</span>
            <span>{{ detail.startTime || '--' }}</span>
          </div>
          <div class="kv">
            <span>{{ _t18('copy_trade_time_range') }}</span>
            <span>{{ cycleRangeText }}</span>
          </div>
          <div v-if="detail.status === 1" class="kv">
            <span>{{ _t18('copy_trade_exit_time') }}</span>
            <span>{{ detail.endTime || '--' }}</span>
          </div>
          <div v-if="detail.status === 0" class="kv">
            <span>{{ _t18('copy_trade_today_trades') }}</span>
            <span class="ff-num">{{ detail.tradeCount ?? 0 }}</span>
          </div>
          <div class="kv">
            <span>{{ _t18('copy_trade_cycle_progress') }}</span>
            <span class="ff-num">{{ cycleProgressText }}</span>
          </div>
          <div class="kv">
            <span>{{ _t18('copy_trade_target_profit') }}</span>
            <span class="ff-num">{{ priceFormat(detail.targetProfit ?? 0) }} USDT</span>
          </div>
          <div class="kv">
            <span>{{ _t18('copy_trade_win_lose') }}</span>
            <span class="ff-num">{{ winLoseText }}</span>
          </div>
          <div class="kv">
            <span>{{ _t18('copy_trade_profit_loss_breakdown') }}</span>
            <span class="ff-num">
              +{{ priceFormat(detail.params?.totalProfitAmt ?? 0) }}/-{{ priceFormat(detail.params?.totalLossAmt ?? 0) }}
            </span>
          </div>
          <div v-if="detail.status === 1" class="kv">
            <span>{{ _t18('copy_trade_exit_method') }}</span>
            <span>{{ _t18('copy_trade_exit_normal') }}</span>
          </div>
          <div class="kv">
            <span>{{ _t18('copy_trade_inst_profit_share') }}</span>
            <span>{{ detail.profitRate ?? '--' }}%</span>
          </div>
        </div>
        <div class="pnl-block">
          <div class="pnl-item">
            <span class="label">{{ _t18('copy_trade_period_pnl') }}</span>
            <span class="value ff-num" :class="pnlClass(displayProfit)">
              {{ formatPnl(displayProfit) }} USDT
            </span>
          </div>
          <div class="pnl-item">
            <span class="label">{{ _t18('copy_trade_pnl_rate') }}</span>
            <span class="value ff-num" :class="pnlClass(displayProfit)">
              {{ calcPnlRate(displayProfit, detail.amount) }}%
            </span>
          </div>
          <div v-if="detail.status === 1" class="pnl-actual">
            <span class="label">{{ _t18('copy_trade_actual_profit') }}</span>
            <span class="value ff-num" :class="pnlClass(detail.actualProfit)">
              {{ formatPnl(detail.actualProfit) }} USDT
            </span>
          </div>
        </div>
      </div>

      <div v-if="records.length" class="records-section">
        <h3 class="section-title">{{ _t18('copy_trade_history_positions') }}</h3>
        <PositionRecordCard
          v-for="(rec, idx) in records"
          :key="rec.orderNo || idx"
          :record="rec"
          :parent-symbol="detail.symbol"
          closed
        />
      </div>
      <p v-else-if="detail.status === 0" class="empty-hint">{{ _t18('copy_trade_no_positions_hint') }}</p>
      <Nodata v-else />

      <button
        v-if="detail.status === 0"
        type="button"
        class="stop-btn"
        @click="openStop"
      >
        {{ _t18('copy_trade_stop') }}
      </button>
    </template>

    <StopConfirmDialog
      v-model:show="stopVisible"
      :warn-open="Number(detail.tradeCount) > 0"
      :rows="stopRows"
      :loading="stopLoading"
      @confirm="confirmStop"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import PositionRecordCard from './components/PositionRecordCard.vue'
import StopConfirmDialog from './components/StopConfirmDialog.vue'
import { _t18 } from '@/utils/public'
import { getCopyTradeDetail, exitCopyTrade } from '@/api/copyTrade'
import { priceFormat } from '@/utils/decimal'
import { formatPnl, pnlClass, calcPnlRate } from './utils'
import { showToast } from 'vant'

const route = useRoute()
const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)
const detail = ref({})
const records = ref([])
const pageLoading = ref(true)

const stopVisible = ref(false)
const stopLoading = ref(false)
const stopRows = ref([])

const statusText = computed(() => {
  if (detail.value.status === 0) return detail.value.params?.statusText || t18('copy_trade_tab_ongoing')
  return t18('copy_trade_settled')
})

const displayProfit = computed(() => {
  if (detail.value.status === 1) return detail.value.actualProfit
  return detail.value.params?.totalSettledProfit ?? detail.value.actualProfit ?? 0
})

const cycleRangeText = computed(() => {
  const start = detail.value?.startTime || '--'
  const end = detail.value?.endTime || '--'
  return `${start} ~ ${end}`
})

const cycleProgressText = computed(() => {
  const done = Number(detail.value?.tradeCount ?? 0)
  const totalCount = Number(detail.value?.expectedTradeCount ?? 0)
  if (!totalCount) return `${done}`
  return `${done}/${totalCount}`
})

const winLoseText = computed(() => {
  const win = Number(detail.value?.params?.winCount ?? 0)
  const lose = Number(detail.value?.params?.loseCount ?? 0)
  return `${win}/${lose}`
})

async function loadDetail() {
  pageLoading.value = true
  try {
    const res = await getCopyTradeDetail(route.query.id)
    if (res?.code == 200 && res.data) {
      detail.value = res.data
      records.value = res.data.records || []
    }
  } catch (e) {
    void e
  } finally {
    pageLoading.value = false
  }
}

function openStop() {
  const pnl = displayProfit.value
  stopRows.value = [
    { label: t18('copy_trade_amount'), value: `${priceFormat(detail.value.amount)} USDT`, cls: '' },
    {
      label: t18('copy_trade_current_pnl'),
      value: `${formatPnl(pnl)} USDT`,
      cls: pnlClass(pnl)
    },
    {
      label: t18('copy_trade_pnl_rate'),
      value: `${calcPnlRate(pnl, detail.value.amount)}%`,
      cls: pnlClass(pnl)
    },
    {
      label: t18('copy_trade_actual_profit'),
      value: `${formatPnl(pnl)} USDT`,
      cls: pnlClass(pnl)
    }
  ]
  stopVisible.value = true
}

async function confirmStop() {
  stopLoading.value = true
  try {
    const res = await exitCopyTrade({ id: detail.value.id })
    if (res?.code == 200) {
      showToast(res.msg || t18('copy_trade_exit_success'))
      stopVisible.value = false
      await loadDetail()
    } else {
      showToast(res.msg)
    }
  } catch (e) {
    void e
  } finally {
    stopLoading.value = false
  }
}

onMounted(loadDetail)
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
  span:first-child {
    color: #888;
  }
}
.pnl-block {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
}
.pnl-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
  .is-up {
    color: $green;
  }
  .is-down {
    color: #e8503a;
  }
}
.pnl-actual {
  margin-top: 12px;
  text-align: center;
  .label {
    display: block;
    font-size: 13px;
    color: #888;
    margin-bottom: 6px;
  }
  .value {
    font-size: 28px;
    font-weight: 700;
    &.is-up {
      color: $green;
    }
    &.is-down {
      color: #e8503a;
    }
  }
}
.records-section {
  padding: 0 15px;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px;
}
.empty-hint {
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 24px;
}
.stop-btn {
  position: fixed;
  left: 15px;
  right: 15px;
  bottom: calc(16px + env(safe-area-inset-bottom, 0));
  max-width: calc(var(--ex-max-width, 100%) - 30px);
  margin: 0 auto;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: $green;
  color: #fff;
  font-size: 16px;
}
</style>
