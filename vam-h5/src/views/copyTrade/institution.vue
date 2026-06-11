<!-- 机构介绍 / 带单表现（原型 1.1 + 1.2） -->
<template>
  <div class="inst-detail-page">
    <DarkHeaderBar :title="t18('copy_trade_inst_intro_title')" :border_bottom="true" />

    <van-loading v-if="pageLoading" class="page-loading" />
    <template v-else-if="institutionId">
      <!-- 机构头部 -->
      <section class="profile">
        <div class="profile__head">
          <img v-if="detail.logo" :src="detail.logo" class="profile__avatar" alt="" />
          <div v-else class="profile__avatar profile__avatar--ph" />
          <div class="profile__meta">
            <h2 class="profile__name">{{ detail.institutionName || '--' }}</h2>
            <div class="profile__tags">
              <span class="tag tag--provider">{{ providerTag }}</span>
              <span class="tag" :class="isSubscribed ? 'tag--on' : 'tag--off'">{{ subscribeTag }}</span>
            </div>
            <p class="profile__join">
              {{ t18('copy_trade_join_date_label') }} {{ formatCopyTradeDisplayDate(detail.joinDate || detail.joinTime) }}
            </p>
          </div>
        </div>
        <p
          v-if="detail.description"
          ref="descRef"
          class="profile__desc profile__desc--fold"
          :class="{ 'profile__desc--clickable': descOverflow }"
          @click="openDescDialog"
        >
          {{ detail.description }}
          <button v-if="descOverflow" type="button" class="desc-more" @click.stop="openDescDialog">
            {{ t18('copy_trade_desc_more') }}
          </button>
        </p>
      </section>

      <!-- 信号提供商规则 -->
      <section class="rules">
        <h3 class="rules__title">{{ t18('copy_trade_rules_title') }}</h3>
        <div class="rules__grid">
          <div class="rules__cell">
            <span class="rules__label">{{ t18('copy_trade_min_amount') }}</span>
            <span class="rules__val ff-num">{{ detail.minAmount ?? '--' }} USDT</span>
          </div>
          <div class="rules__cell">
            <span class="rules__label">{{ t18('copy_trade_max_amount') }}</span>
            <span class="rules__val ff-num">{{ detail.maxAmount ?? '--' }} USDT</span>
          </div>
          <div class="rules__cell">
            <span class="rules__label">{{ t18('copy_trade_semi_share') }}</span>
            <span class="rules__val ff-num">{{ detail.normalShareRate ?? '--' }}%</span>
          </div>
          <div class="rules__cell">
            <span class="rules__label">{{ t18('copy_trade_full_share') }}</span>
            <span class="rules__val ff-num">{{ detail.forceShareRate ?? '--' }}%</span>
          </div>
          <div class="rules__cell">
            <span class="rules__label">{{ t18('copy_trade_trade_fee') }}</span>
            <span class="rules__val ff-num">{{ detail.tradeFeeRate ?? '--' }}%</span>
          </div>
          <div class="rules__cell">
            <span class="rules__label">{{ t18('copy_trade_total_followers') }}</span>
            <span class="rules__val ff-num">{{ _numberWithCommas(subscriberCount) }}</span>
          </div>
        </div>
      </section>

      <!-- Tab：机构带单表现 / 我的跟单记录 -->
      <div class="seg-tabs">
        <button
          type="button"
          class="seg-tab"
          :class="{ active: perfTab === 'institution' }"
          @click="switchPerfTab('institution')"
        >
          {{ t18('copy_trade_inst_perf') }}
        </button>
        <button
          type="button"
          class="seg-tab"
          :class="{ active: perfTab === 'my' }"
          @click="switchPerfTab('my')"
        >
          {{ t18('copy_trade_my_perf') }}
        </button>
      </div>

      <div v-if="perfLoading" class="perf-loading"><van-loading /></div>
      <div v-else class="perf-body">
        <!-- 入驻时间 / 带单天数 / 总收益率 -->
        <div class="summary-row">
          <div class="summary-item">
            <span class="summary-label">{{ t18('copy_trade_join_time_label') }}</span>
            <span class="summary-val">{{ formatCopyTradeDisplayDateTime(summaryJoinTime) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">{{ tradingDaysLabel }}</span>
            <span class="summary-val">{{ summaryTradingDays }}{{ t18('copy_trade_day_unit') }}</span>
          </div>
          <div class="summary-item summary-item--rate">
            <span class="summary-label">{{ t18('copy_trade_total_profit_rate') }}</span>
            <span class="summary-val ff-num is-up">{{ formatSignedRate(summaryTotalRate) }}%</span>
          </div>
        </div>

        <!-- ① 每日收益表现 -->
        <section class="chart-section">
          <h4 class="chart-section__title">{{ t18('copy_trade_daily_perf') }}</h4>
          <p class="chart-section__sub">
            {{ rangeRateLabel }} <span class="ff-num is-up">{{ formatSignedRate(perf.rangeTotalProfitRate) }}%</span>
          </p>
          <CopyTradePerfCharts
            :daily-series="dailySeries"
            :weekly-series="[]"
            :coin-preference="[]"
            :format-rate="formatRate"
            :show-daily-chart="true"
            :show-weekly-chart="false"
            :daily-empty-hint="hasDailyChart ? '' : t18('copy_trade_no_chart_data')"
          />
          <div class="range-row">
            <button
              v-for="r in ranges"
              :key="r"
              type="button"
              class="range-btn"
              :class="{ active: range === r }"
              @click="changeRange(r)"
            >
              {{ rangeLabel(r) }}
            </button>
          </div>
        </section>

        <!-- ② 每周收益表现 -->
        <section class="chart-section">
          <h4 class="chart-section__title">{{ t18('copy_trade_weekly_perf') }}</h4>
          <p class="chart-section__sub">
            {{ t18('copy_trade_total_profit_rate') }} <span class="ff-num is-up">{{ formatSignedRate(weeklyPerf.weeklyTotalProfitRate ?? weeklyPerf.totalProfitRate) }}%</span>
          </p>
          <CopyTradePerfCharts
            :daily-series="[]"
            :weekly-series="weeklySeries"
            :coin-preference="[]"
            :format-rate="formatRate"
            :show-daily-chart="false"
            :show-weekly-chart="true"
            :weekly-empty-hint="hasWeeklyChart ? '' : t18('copy_trade_no_chart_data')"
          />
        </section>

        <!-- ③ 币种偏好 -->
        <section class="chart-section chart-section--last">
          <h4 class="chart-section__title">{{ t18('copy_trade_coin_preference') }}</h4>
          <CopyTradePerfCharts
            :daily-series="[]"
            :weekly-series="[]"
            :coin-preference="coinPreference"
            :format-rate="formatRate"
            :show-daily-chart="false"
            :show-weekly-chart="false"
            :show-coin-chart="true"
            :coin-empty-hint="hasCoinPreference ? '' : t18('copy_trade_no_chart_data')"
          />
        </section>
      </div>

      <div class="bottom-bar">
        <button v-if="perfTab === 'my'" type="button" class="join-btn" @click="goMyCopy">
          {{ t18('copy_trade_my') }}
        </button>
        <button v-else type="button" class="join-btn" @click="goStrategies">
          {{ t18('copy_trade_join_strategy') }}
        </button>
      </div>
    </template>
    <Nodata v-else />

    <van-dialog
      v-model:show="showDescDialog"
      :title="descDialogTitle"
      confirm-button-color="#17ac74"
    >
      <p class="desc-dialog-text">{{ detail.description }}</p>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import CopyTradePerfCharts from './components/CopyTradePerfCharts.vue'
import { _t18, _numberWithCommas } from '@/utils/public'
import {
  getCopyTradeInstitutionDetail,
  getCopyTradeInstitutionDailyChart,
  getCopyTradeInstitutionWeeklyChart,
  getCopyTradeInstitutionPerformance,
  getCopyTradeMyDailyChart,
  getCopyTradeMyWeeklyChart,
  getCopyTradeMyPerformance,
  getCopyTradeInstitutionCoinPreference,
  getCopyTradeMyCoinPreference,
  getCopyTradeList
} from '@/api/copyTrade'
import {
  institutionSubscriberCount,
  isInstitutionSubscribed,
  normalizePerfData,
  normalizePerfSummary,
  normalizeCoinPreference,
  buildInstitutionChartPayload,
  formatSignedRate,
  formatCopyTradeDisplayDate,
  formatCopyTradeDisplayDateTime
} from './utils'
import { priceFormat } from '@/utils/decimal'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)

const institutionId = ref('')
const detail = ref({})
const pageLoading = ref(true)
const perfTab = ref('institution')
const range = ref('7d')
const perf = ref({})
const weeklyPerf = ref({})
const coinPerf = ref({})
const perfLoading = ref(false)
const descRef = ref(null)
const descOverflow = ref(false)
const showDescDialog = ref(false)
const ranges = ['7d', '15d', '30d', 'all']

const descDialogTitle = computed(() => {
  const label = t18('copy_trade_inst_intro').replace(/[：:]\s*$/, '')
  return detail.value.institutionName || label
})

function checkDescOverflow() {
  nextTick(() => {
    const el = descRef.value
    if (!el) {
      descOverflow.value = false
      return
    }
    descOverflow.value = el.scrollHeight > el.clientHeight + 1
  })
}

function openDescDialog() {
  if (!descOverflow.value || !detail.value.description) return
  showDescDialog.value = true
}

const subscriberCount = computed(() => institutionSubscriberCount(detail.value))
const isSubscribed = computed(() => detail.value.subscribed === true || detail.value.isSubscribed === true)
const providerTag = computed(() => detail.value.signalProviderText || t18('copy_trade_signal_provider'))
const subscribeTag = computed(() => detail.value.subscribeText || (isSubscribed.value ? t18('copy_trade_inst_subscribed') : t18('copy_trade_inst_subscribe')))

const dailySeries = computed(() => normalizePerfData(perf.value).dailySeries || [])
const weeklySeries = computed(() => {
  const w = normalizePerfData(weeklyPerf.value).weeklySeries || []
  if (w.length) return w
  return normalizePerfData(perf.value).weeklySeries || []
})
const coinPreference = computed(() => {
  const fromApi = normalizeCoinPreference(coinPerf.value)
  if (fromApi.length) return fromApi
  const fromPerf = normalizeCoinPreference(perf.value)
  if (fromPerf.length) return fromPerf
  return normalizeCoinPreference(weeklyPerf.value)
})
const hasDailyChart = computed(() => dailySeries.value.length > 0)
const hasWeeklyChart = computed(() => weeklySeries.value.length > 0)
const hasCoinPreference = computed(() => coinPreference.value.length > 0)

const summaryJoinTime = computed(() => {
  const summary = normalizePerfSummary(perf.value)
  if (perfTab.value === 'my') {
    return (
      summary.subscribeTime ||
      detail.value.subscribeTime ||
      detail.value.userSubscribeTime ||
      '--'
    )
  }
  return (
    summary.joinTime ||
    perf.value.joinTime ||
    detail.value.joinTime ||
    detail.value.joinDate ||
    '--'
  )
})
const summaryTradingDays = computed(() => {
  const summary = normalizePerfSummary(perf.value)
  if (perfTab.value === 'my') {
    return summary.copyDays != null && summary.copyDays !== '' ? summary.copyDays : '--'
  }
  return summary.tradingDays ?? perf.value.tradingDays ?? detail.value.tradingDays ?? '--'
})
const summaryTotalRate = computed(() => perf.value.totalProfitRate ?? detail.value.totalProfitRate ?? 0)
const tradingDaysLabel = computed(() =>
  perfTab.value === 'my' ? t18('copy_trade_copy_days') : t18('copy_trade_trading_days')
)

const rangeRateLabel = computed(() => {
  const map = {
    '7d': t18('copy_trade_range_7d_total'),
    '15d': t18('copy_trade_range_15d_total'),
    '30d': t18('copy_trade_range_30d_total'),
    all: t18('copy_trade_range_all_total')
  }
  return map[range.value] || t18('copy_trade_range_profit_rate')
})

function formatRate(val) {
  return formatSignedRate(val, 2)
}

function rangeLabel(r) {
  const map = {
    '7d': t18('copy_trade_range_7d'),
    '15d': t18('copy_trade_range_15d'),
    '30d': t18('copy_trade_range_30d'),
    all: t18('copy_trade_range_all')
  }
  return map[r] || r
}

async function loadDetail() {
  const id = route.query.institutionId || route.query.id
  if (!id) {
    pageLoading.value = false
    return
  }
  institutionId.value = String(id)
  pageLoading.value = true
  try {
    const res = await getCopyTradeInstitutionDetail({ institutionId: institutionId.value })
    if (res?.code == 200 && res.data) {
      if (!isInstitutionSubscribed(res.data)) {
        showToast(t18('copy_trade_inst_subscribe_first'))
        router.replace('/copy-trade')
        return
      }
      detail.value = res.data
    }
  } finally {
    pageLoading.value = false
    checkDescOverflow()
  }
}

function mergePerfData(...sources) {
  let merged = { dailySeries: [], weeklySeries: [], coinPreference: [] }
  sources.forEach((src) => {
    if (!src) return
    const norm = normalizePerfData(src)
    merged = {
      ...merged,
      ...src,
      ...norm,
      dailySeries: norm.dailySeries?.length ? norm.dailySeries : merged.dailySeries || [],
      weeklySeries: norm.weeklySeries?.length ? norm.weeklySeries : merged.weeklySeries || [],
      coinPreference: norm.coinPreference?.length ? norm.coinPreference : merged.coinPreference || []
    }
  })
  return merged
}

async function loadDailyChart() {
  if (!institutionId.value) return
  const payload = buildInstitutionChartPayload(institutionId.value, range.value)
  const isMy = perfTab.value === 'my'
  const chartRes = isMy
    ? await getCopyTradeMyDailyChart(payload)
    : await getCopyTradeInstitutionDailyChart(payload)
  let data = chartRes?.code == 200 ? chartRes.data : null

  const chartNorm = normalizePerfData(data)
  if (!chartNorm.dailySeries?.length) {
    const perfRes = isMy
      ? await getCopyTradeMyPerformance(payload)
      : await getCopyTradeInstitutionPerformance(payload)
    if (perfRes?.code == 200 && perfRes.data) {
      data = mergePerfData(perfRes.data, data)
    }
  } else {
    data = normalizePerfData(data)
  }

  if (data) {
    perf.value = mergePerfData(data, perf.value)
  }
}

async function loadWeeklyChart() {
  if (!institutionId.value) return
  const payload = buildInstitutionChartPayload(institutionId.value, range.value)
  const isMy = perfTab.value === 'my'
  const chartRes = isMy
    ? await getCopyTradeMyWeeklyChart(payload)
    : await getCopyTradeInstitutionWeeklyChart(payload)
  let data = chartRes?.code == 200 ? chartRes.data : null

  const chartNorm = normalizePerfData(data)
  if (!chartNorm.weeklySeries?.length) {
    const perfRes = isMy
      ? await getCopyTradeMyPerformance(payload)
      : await getCopyTradeInstitutionPerformance(payload)
    if (perfRes?.code == 200 && perfRes.data) {
      data = mergePerfData(perfRes.data, data)
    }
  } else {
    data = normalizePerfData(data)
  }

  if (data) {
    weeklyPerf.value = mergePerfData(data, weeklyPerf.value)
    if (!normalizePerfData(perf.value).weeklySeries?.length && data.weeklySeries?.length) {
      perf.value = mergePerfData(perf.value, { weeklySeries: data.weeklySeries })
    }
  }
}

async function loadMyRecordFallback() {
  try {
    const res = await getCopyTradeList({
      institutionId: institutionId.value,
      status: 0,
      pageNum: 1,
      pageSize: 1
    })
    if (res?.code != 200 || !Array.isArray(res.rows) || !res.rows.length) return
    const row = res.rows[0]
    const subscribeTime = row.startTime || row.subscribeTime || row.joinTime || ''
    const summary = normalizePerfSummary({ ...row, subscribeTime, startTime: row.startTime })
    perf.value = mergePerfData(
      {
        subscribeTime: summary.subscribeTime || subscribeTime,
        copyDays: summary.copyDays,
        startTime: row.startTime
      },
      perf.value
    )
  } catch (e) {
    void e
  }
}

async function loadPerfSummary() {
  if (!institutionId.value) return
  const payload = buildInstitutionChartPayload(institutionId.value, range.value)
  const isMy = perfTab.value === 'my'
  const perfRes = isMy
    ? await getCopyTradeMyPerformance(payload)
    : await getCopyTradeInstitutionPerformance(payload)
  if (perfRes?.code == 200 && perfRes.data) {
    perf.value = mergePerfData(perfRes.data, perf.value)
    if (isMy) {
      const summary = normalizePerfSummary(perf.value)
      if (!summary.subscribeTime || summary.copyDays == null) {
        await loadMyRecordFallback()
      }
    }
  } else if (isMy) {
    await loadMyRecordFallback()
  }
}

async function loadCoinPreference() {
  if (!institutionId.value) return
  const payload = buildInstitutionChartPayload(institutionId.value, range.value)
  const isMy = perfTab.value === 'my'
  const res = isMy
    ? await getCopyTradeMyCoinPreference(payload)
    : await getCopyTradeInstitutionCoinPreference(payload)
  let data = res?.code == 200 ? res.data : null
  let coins = normalizeCoinPreference(data)

  if (!coins.length) {
    const perfRes = isMy
      ? await getCopyTradeMyPerformance(payload)
      : await getCopyTradeInstitutionPerformance(payload)
    if (perfRes?.code == 200 && perfRes.data) {
      data = perfRes.data
      coins = normalizeCoinPreference(perfRes.data)
    }
  }

  if (data) {
    coinPerf.value = data
    if (coins.length) {
      perf.value = mergePerfData(perf.value, { coinPreference: coins })
    }
  }
}

async function loadPerformance() {
  if (!institutionId.value) return
  perfLoading.value = true
  try {
    await Promise.all([loadDailyChart(), loadWeeklyChart(), loadCoinPreference()])
    await loadPerfSummary()
  } finally {
    perfLoading.value = false
  }
}

function switchPerfTab(tab) {
  if (perfTab.value === tab) return
  perfTab.value = tab
  perf.value = {}
  weeklyPerf.value = {}
  coinPerf.value = {}
  loadPerformance()
}

function changeRange(r) {
  if (range.value === r) return
  range.value = r
  Promise.all([loadDailyChart(), loadCoinPreference()])
}

function goStrategies() {
  router.push({ path: '/copy-trade/strategies', query: { institutionId: institutionId.value } })
}

function goMyCopy() {
  router.push({ path: '/copy-trade/my', query: { institutionId: institutionId.value } })
}

onMounted(async () => {
  await loadDetail()
  await loadPerformance()
})

watch(
  () => route.query.institutionId,
  async () => {
    await loadDetail()
    await loadPerformance()
  }
)

watch(
  () => detail.value.description,
  () => checkDescOverflow()
)
</script>

<style lang="scss" scoped>
$green: #17ac74;
$tab-active: #3d3d3d;

.inst-detail-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
}

.page-loading,
.perf-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.profile {
  padding: 14px 15px 10px;

  &__head {
    display: flex;
    gap: 12px;
  }

  &__avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;

    &--ph {
      background: linear-gradient(135deg, #edf8f2, #d9f1e4);
    }
  }

  &__name {
    margin: 0 0 8px;
    font-size: 17px;
    font-weight: 700;
    color: #111;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
  }

  &__join {
    margin: 0;
    font-size: 12px;
    color: #6b7280;
  }

  &__desc {
    margin: 10px 0 0;
    font-size: 13px;
    color: #4b5563;
    line-height: 1.55;

    &--fold {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    &--clickable {
      cursor: pointer;
    }
  }
}

.desc-dialog-text {
  padding: 8px 16px 16px;
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.65;
  word-break: break-word;
  white-space: pre-wrap;
  max-height: 60vh;
  overflow-y: auto;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;

  &--provider {
    background: #fee2e2;
    color: #dc2626;
  }

  &--on {
    background: #edf8f2;
    color: $green;
  }

  &--off {
    background: #f3f4f6;
    color: #6b7280;
  }
}

.desc-more {
  border: none;
  background: none;
  color: $green;
  font-size: 13px;
  padding: 0;
  margin-left: 4px;
}

.rules {
  padding: 0 15px 14px;

  &__title {
    margin: 0 0 10px;
    font-size: 14px;
    font-weight: 600;
    color: #111;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  &__cell {
    background: #f8faf9;
    border-radius: 6px;
    padding: 10px 8px;
    text-align: center;
  }

  &__label {
    display: block;
    font-size: 11px;
    color: #9ca3af;
    margin-bottom: 4px;
    line-height: 1.3;
  }

  &__val {
    font-size: 13px;
    font-weight: 700;
    color: #111;
  }
}

.seg-tabs {
  display: flex;
  margin: 0 15px 12px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.seg-tab {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 8px;
  font-size: 13px;
  color: #6b7280;
  border-radius: 6px;
  transition: all 0.2s;

  &.active {
    background: $tab-active;
    color: #fff;
    font-weight: 600;
  }
}

.perf-body {
  padding: 0 15px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item {
  flex: 1;
  min-width: 0;

  &--rate .summary-val {
    color: $green;
    font-weight: 700;
  }
}

.summary-label {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.summary-val {
  font-size: 13px;
  font-weight: 600;
  color: #111;
  word-break: break-all;
}

.chart-section {
  margin-bottom: 20px;

  &--last {
    margin-bottom: 8px;
  }

  &__title {
    margin: 0 0 6px;
    font-size: 14px;
    font-weight: 600;
    color: #111;
  }

  &__sub {
    margin: 0 0 10px;
    font-size: 12px;
    color: #6b7280;
  }
}

.range-row {
  display: flex;
  gap: 0;
  margin-top: 10px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 3px;
}

.range-btn {
  flex: 1;
  border: none;
  background: transparent;
  border-radius: 6px;
  padding: 8px 4px;
  font-size: 12px;
  color: #6b7280;

  &.active {
    background: #fff;
    color: #111;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
}

.empty-hint {
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
  padding: 16px 0;
}

.is-up {
  color: $green;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 15px calc(12px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #eee;
}

.join-btn {
  width: 100%;
  border: none;
  border-radius: 10px;
  background: $green;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  padding: 14px;
}
</style>
