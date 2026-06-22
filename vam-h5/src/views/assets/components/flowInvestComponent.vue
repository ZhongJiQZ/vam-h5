<!-- src/views/assets/components/flowInvestComponent.vue -->
<template>
  <div class="flow-invest">
    <van-tabs
      shrink
      v-model:active="statusActive"
      class="flow-invest__status-tabs"
      :line-width="0"
      @click-tab="onClickStatusTab"
    >
      <van-tab :title="_t18('records.total')" name="" />
    </van-tabs>

    <div class="list-wrap">
      <van-pull-refresh
        v-model="refreshing"
        :pulling-text="_t18('loading')"
        :loosing-text="_t18('release_refresh') || _t18('loading')"
        :loading-text="_t18('loading')"
        :success-text="''"
        @refresh="onRefresh"
      >
        <van-list
          v-model:loading="loading"
          :finished="finished"
          :finished-text="list.length ? (_t18('utils.noMore') || _t18('no_more_data')) : ''"
          :loading-text="_t18('loading')"
          :error-text="_t18('error') || ''"
          @load="onLoad"
        >
          <template v-if="list.length">
            <div class="card" v-for="row in list" :key="row.id">
              <div class="kv">
                <div class="k">{{ _t18('assets.name') }}</div>
                <div class="v">{{ row.planTitle || '-' }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.dayProfitRate') }}</div>
                <div class="v v--accent">{{ toNumber(row.avgRate) }}%</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.investAmount') }} (USDT)</div>
                <div class="v">{{ row.amount }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.estimatedRevenue') }}</div>
                <div class="v">
                  {{ calPriceFormat(calcEstimatedRevenue(row), 4) }} USDT
                </div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('financial_current_income') }}</div>
                <div class="v v--profit">{{ formatAccumulaEarnDisplay(row) }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.paymentDate') }}</div>
                <div class="v">
                  {{
                    calcReceiptTime(row.settlementType, row.days, row.createTime) === 'daily_settlement'
                      ? (_t18('assets.daily_settlement') || '每日结算')
                      : calcReceiptTime(row.settlementType, row.days, row.createTime)
                  }}
                </div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.beginTime') }}</div>
                <div class="v">{{ formatAssetRecordTime(row, 'begin') }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.endTime') }}</div>
                <div class="v">{{ formatAssetRecordTime(row, 'end') }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.status') }}</div>
                <div class="v">
                  <span class="status-chip" :class="statusChipClass(row.status)">
                    {{ formatStatus(row.status) }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <div v-else-if="!loading && !refreshing" class="fi-empty">
            <img :src="iconEmpty" alt="" class="fi-empty__icon" />
            <p class="fi-empty__text">{{ _t18('utils.noData') || _t18('no_data') }}</p>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { _t18 } from '@/utils/public'
import { formatAssetRecordTime } from '@/utils/time'
import { priceFormat } from '@/utils/decimal'
import { getRecordList } from '@/api/assets'
import { redemption } from '@/api/pledge'
import { useI18n } from 'vue-i18n'
import { onMounted } from "vue";
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

onMounted(() => {
  // 进页面直接拉第一页
  fetchList({ reset: true });
});

const { t: i18nT } = useI18n()

const statusActive = ref('')
const pageNum = ref(1)
const pageSize = 10

const list = ref([])
const total = ref(0)

const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

/* ===== util ===== */
const toNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const calPriceFormat = (num, digits = 4) => {
  const n = Number(num)
  if (!Number.isFinite(n)) return '0'
  return n.toFixed(digits)
}

const calcEstimatedRevenue = (row) => {
  const amount = toNumber(row?.amount)
  const days = toNumber(row?.days)
  const rate = toNumber(row?.avgRate)
  return (amount * days * rate) / 100
}

/** 当前收益：接口字段 accumulaEarn */
const formatAccumulaEarnDisplay = (row) => {
  const v = row?.accumulaEarn
  if (v === null || v === undefined || v === '') return '--'
  const n = Number(String(v).replace(/,/g, ''))
  if (!Number.isFinite(n)) return '--'
  return `${priceFormat(n, 4)} USDT`
}

const formatStatus = (s) => {
  if (String(s) === '0') return _t18('records.inProgress')
  if (String(s) === '1') return _t18('records.completed')
  return _t18('records.redeemed')
}

const statusChipClass = (s) => {
  if (String(s) === '0') return 'status-chip--progress'
  if (String(s) === '1') return 'status-chip--done'
  return 'status-chip--redeemed'
}

const calcReceiptTime = (settlementType, days, createTime) => {
  if (!settlementType) return '-'
  if (settlementType === 'daily_settlement') return 'daily_settlement'
  return '-'
}

/* ===== list ===== */
const fetchList = async ({ reset = false } = {}) => {
  try {
    if (reset) {
      pageNum.value = 1
      finished.value = false
      list.value = []
    }

    loading.value = true

    const status = statusActive.value === '' ? '' : Number(statusActive.value)

    const res = await getRecordList(
      {
        pageNum: pageNum.value,
        pageSize,
        status,
      },
      'order'
    )

    const payload = res?.data ? res.data : res
    const rows = payload?.rows || []
    const t = Number(payload?.total || 0)

    total.value = t

    list.value =
      pageNum.value === 1 ? rows : list.value.concat(rows)

    if (list.value.length >= t || rows.length < pageSize) {
      finished.value = true
    }

    pageNum.value += 1
  } catch (e) {
    showToast(e?.message || 'load failed')
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onLoad = () => fetchList()
const onRefresh = () => {
  refreshing.value = true
  fetchList({ reset: true })
}
const onClickStatusTab = () => fetchList({ reset: true })

const onRedeem = async (row) => {
  if (!row?.id) return

  try {
    await showConfirmDialog({
      title: i18nT('records.redemption'),
      message: i18nT('utils.confirm') || '确认赎回？',
    })

    const res = await redemption({ id: row.id })
    const payload = res?.data ? res.data : res

    if (payload?.code === 200) {
      showToast(payload?.msg || 'success')
      fetchList({ reset: true })
    } else {
      showToast(payload?.msg || 'failed')
    }
  } catch (e) {}
}
</script>
<style scoped lang="scss">
.flow-invest {
  width: 100%;
}

/* 状态子 tab — 跟 Mining Records 同款 */
.flow-invest__status-tabs {
  :deep(.van-tabs__wrap) {
    height: 40px;
    background: transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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

.list-wrap {
  padding: 14px 4px 24px;
  background: transparent;
}

:deep(.van-pull-refresh) {
  background: transparent;
}

:deep(.van-list__finished-text),
:deep(.van-list__loading-text) {
  color: rgba(255, 255, 255, 0.45);
}

/* 暗紫卡 */
.card {
  background: #1a1626;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 14px 10px;
  margin-bottom: 12px;
}

.kv {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  min-height: 24px;
}

.k {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  flex: 0 0 45%;
}

.v {
  font-size: 13px;
  color: #fff;
  font-weight: 500;
  text-align: right;
  flex: 1;
  word-break: break-all;
  font-variant-numeric: tabular-nums;
}

.v--accent {
  color: rgb(196, 124, 255);
  font-weight: 600;
}

.v--profit {
  color: #5fd5a4;
  font-weight: 600;
}

/* status chip */
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
  letter-spacing: 0.2px;
}

.status-chip--progress {
  background: rgba(78, 166, 255, 0.16);
  color: #4ea6ff;
}

.status-chip--done {
  background: rgba(95, 213, 164, 0.16);
  color: #5fd5a4;
}

.status-chip--redeemed {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
}

/* 空态 */
.fi-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0 24px;
}

.fi-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.fi-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>

