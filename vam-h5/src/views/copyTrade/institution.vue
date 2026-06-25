<!-- 机构介绍 / 带单表现 -->
<template>
  <div class="page page--institution-detail">
    <header class="inst-header">
      <button type="button" class="inst-header__back" aria-label="back" @click="onBack">
        <img :src="iconBack" alt="" class="inst-header__back-icon" />
      </button>
      <h1 class="inst-header__title">{{ t18('copy_trade_inst_intro_title') }}</h1>
      <span class="inst-header__spacer" aria-hidden="true"></span>
    </header>

    <van-loading v-if="pageLoading" class="page-loading" />
    <template v-else-if="institutionId">
      <main class="inst-main">
        <section class="inst-profile">
          <div class="inst-profile__card">
            <div class="inst-profile__top">
              <img
                v-if="detail.logo"
                :src="detail.logo"
                class="inst-profile__avatar"
                alt=""
              />
              <span v-else class="inst-profile__avatar inst-profile__avatar--placeholder" aria-hidden="true"></span>
              <div class="inst-profile__meta">
                <h2 class="inst-profile__name">{{ detail.institutionName || '--' }}</h2>
                <div class="inst-profile__badges">
                  <span class="inst-profile__badge" :style="{ '--badge-color': 'rgb(255,121,21)' }">
                    {{ providerTag }}
                  </span>
                  <span
                    class="inst-profile__badge"
                    :style="{ '--badge-color': isSubscribed ? 'rgb(46,189,133)' : 'rgba(255,255,255,0.45)' }"
                  >
                    {{ subscribeTag }}
                  </span>
                </div>
                <p class="inst-profile__join">
                  {{ t18('copy_trade_join_date_label') }}{{ formatCopyTradeDisplayDate(detail.joinDate || detail.joinTime, 'YYYY-MM-DD') }}
                </p>
              </div>
            </div>
            <p
              v-if="detail.description"
              ref="descRef"
              class="inst-profile__desc inst-profile__desc--fold"
              :class="{ 'inst-profile__desc--clickable': descOverflow }"
              @click="openDescDialog"
            >
              {{ detail.description }}
              <button v-if="descOverflow" type="button" class="desc-more" @click.stop="openDescDialog">
                {{ t18('copy_trade_desc_more') }}
              </button>
            </p>
          </div>
        </section>

        <section class="inst-rules">
          <h2 class="inst-section__title">{{ t18('copy_trade_rules_title') }}</h2>
          <div class="inst-rules__grid">
            <div class="inst-rules__cell">
              <span class="inst-rules__value ff-num">{{ detail.minAmount ?? '--' }} USDT</span>
              <span class="inst-rules__label">{{ t18('copy_trade_min_amount') }}</span>
            </div>
            <div class="inst-rules__cell">
              <span class="inst-rules__value ff-num">{{ detail.maxAmount ?? '--' }} USDT</span>
              <span class="inst-rules__label">{{ t18('copy_trade_max_amount') }}</span>
            </div>
            <div class="inst-rules__cell">
              <span class="inst-rules__value ff-num">{{ detail.normalShareRate ?? '--' }}%</span>
              <span class="inst-rules__label">{{ t18('copy_trade_semi_share') }}</span>
            </div>
            <div class="inst-rules__cell">
              <span class="inst-rules__value ff-num">{{ detail.forceShareRate ?? '--' }}%</span>
              <span class="inst-rules__label">{{ t18('copy_trade_full_share') }}</span>
            </div>
            <div class="inst-rules__cell">
              <span class="inst-rules__value ff-num">{{ detail.tradeFeeRate ?? '--' }}%</span>
              <span class="inst-rules__label">{{ t18('copy_trade_trade_fee') }}</span>
            </div>
            <div class="inst-rules__cell">
              <span class="inst-rules__value ff-num">{{ _numberWithCommas(subscriberCount) }}</span>
              <span class="inst-rules__label">{{ t18('copy_trade_total_followers') }}</span>
            </div>
          </div>
        </section>

        <section class="inst-perf">
          <div class="inst-tabs" role="tablist">
            <button
              type="button"
              class="inst-tabs__item"
              :class="{ 'inst-tabs__item--active': perfTab === 'institution' }"
              role="tab"
              :aria-selected="perfTab === 'institution'"
              @click="switchPerfTab('institution')"
            >
              {{ t18('copy_trade_inst_perf') }}
            </button>
            <button
              type="button"
              class="inst-tabs__item"
              :class="{ 'inst-tabs__item--active': perfTab === 'my' }"
              role="tab"
              :aria-selected="perfTab === 'my'"
              @click="switchPerfTab('my')"
            >
              {{ t18('copy_trade_my_perf') }}
            </button>
          </div>

          <div v-if="perfLoading" class="perf-loading"><van-loading /></div>
          <template v-else>
            <div
              class="inst-panel inst-panel--inst"
              :class="{ 'inst-panel--hidden': perfTab !== 'institution' }"
              role="tabpanel"
            >
              <article class="inst-card inst-card--daily">
                <div class="inst-card__head">
                  <h3 class="inst-card__title">{{ t18('copy_trade_daily_perf') }}</h3>
                  <div class="inst-time-tabs">
                    <button
                      v-for="r in ranges"
                      :key="r"
                      type="button"
                      class="inst-time-tabs__item"
                      :class="{ 'inst-time-tabs__item--active': range === r }"
                      @click="changeRange(r)"
                    >
                      {{ rangeLabel(r) }}
                    </button>
                  </div>
                </div>
                <div class="inst-card__roi">
                  <span class="inst-card__roi-label">{{ rangeRateLabel }}</span>
                  <span class="inst-card__roi-value ff-num" :class="rateToneClass(perf.rangeTotalProfitRate)">
                    {{ formatSignedRate(perf.rangeTotalProfitRate) }}%
                  </span>
                </div>
                <div class="inst-card__chart">
                  <CopyTradePerfCharts
                    v-if="chartsReady && hasDailyChart"
                    embedded
                    :daily-series="dailySeries"
                    :weekly-series="[]"
                    :coin-preference="[]"
                    :format-rate="formatRate"
                    :show-daily-chart="true"
                    :show-weekly-chart="false"
                    :show-coin-chart="false"
                  />
                  <p v-else-if="chartsReady" class="chart-empty-hint">{{ t18('copy_trade_no_chart_data') }}</p>
                </div>
              </article>

              <article class="inst-card inst-card--weekly">
                <div class="inst-card__head inst-card__head--split">
                  <h3 class="inst-card__title">{{ t18('copy_trade_weekly_perf') }}</h3>
                  <div class="inst-card__roi inst-card__roi--inline">
                    <span class="inst-card__roi-label">{{ t18('copy_trade_total_profit_rate') }}</span>
                    <span
                      class="inst-card__roi-value ff-num"
                      :class="rateToneClass(weeklyPerf.weeklyTotalProfitRate ?? weeklyPerf.totalProfitRate)"
                    >
                      {{ formatSignedRate(weeklyPerf.weeklyTotalProfitRate ?? weeklyPerf.totalProfitRate) }}%
                    </span>
                  </div>
                </div>
                <div class="inst-card__chart">
                  <CopyTradePerfCharts
                    v-if="chartsReady && hasWeeklyChart"
                    embedded
                    :daily-series="weeklyLineSeries"
                    :weekly-series="[]"
                    :coin-preference="[]"
                    :format-rate="formatRate"
                    :show-daily-chart="true"
                    :show-weekly-chart="false"
                    :show-coin-chart="false"
                  />
                  <p v-else-if="chartsReady" class="chart-empty-hint">{{ t18('copy_trade_no_chart_data') }}</p>
                </div>
              </article>

              <article class="inst-card inst-card--asset">
                <h3 class="inst-card__title">{{ t18('copy_trade_coin_preference') }}</h3>
                <div v-if="hasCoinPreference" class="inst-asset__body">
                  <div class="inst-asset__donut" :style="{ background: assetDonutGradient }" aria-hidden="true"></div>
                  <div class="inst-asset__legend">
                    <div v-for="(item, index) in assetLegend" :key="index" class="inst-asset__legend-item">
                      <span class="inst-asset__dot" :style="{ background: item.color }"></span>
                      <span class="inst-asset__symbol">{{ item.symbol }}</span>
                      <span class="inst-asset__percent ff-num">{{ item.rate }}%</span>
                    </div>
                  </div>
                </div>
                <p v-else class="chart-empty-hint">{{ t18('copy_trade_no_chart_data') }}</p>
              </article>
            </div>

            <div
              class="inst-panel inst-panel--copy"
              :class="{ 'inst-panel--hidden': perfTab !== 'my' }"
              role="tabpanel"
            >
              <article class="inst-card inst-card--copy">
                <div class="inst-copy__grid">
                  <div class="inst-copy__stat">
                    <span class="inst-copy__value">{{ summaryJoinTime }}</span>
                    <span class="inst-copy__label">{{ t18('copy_trade_join_time_label') }}</span>
                  </div>
                  <div class="inst-copy__stat">
                    <span class="inst-copy__value">{{ summaryTradingDays }}{{ t18('copy_trade_day_unit') }}</span>
                    <span class="inst-copy__label">{{ tradingDaysLabel }}</span>
                  </div>
                  <div class="inst-copy__stat">
                    <span class="inst-copy__value ff-num" :class="rateToneClass(summaryTotalRate, 'inst-copy__value')">
                      {{ formatSignedRate(summaryTotalRate) }}%
                    </span>
                    <span class="inst-copy__label">{{ t18('copy_trade_total_profit_rate') }}</span>
                  </div>
                </div>
              </article>
            </div>
          </template>
        </section>
      </main>

      <div class="inst-footer">
        <button v-if="perfTab === 'my'" type="button" class="inst-footer__btn" @click="goMyCopy">
          {{ t18('copy_trade_my') }}
        </button>
        <button v-else type="button" class="inst-footer__btn" @click="goStrategies">
          {{ t18('copy_trade_join_strategy') }}
        </button>
      </div>
    </template>
    <Nodata v-else />

    <van-dialog
      v-model:show="showDescDialog"
      :title="descDialogTitle"
      confirm-button-color="#a13cff"
    >
      <p class="desc-dialog-text">{{ detail.description }}</p>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
const CopyTradePerfCharts = defineAsyncComponent(() => import('./components/CopyTradePerfCharts.vue'))
import { _t18, _numberWithCommas, _back } from '@/utils/public'
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
  mergePerfSummaryFields,
  normalizeCoinPreference,
  buildInstitutionChartPayload,
  formatSignedRate,
  formatCopyTradeDisplayDate
} from './utils'
import { showToast } from 'vant'

const ASSET_COLORS = [
  'rgb(48,111,255)',
  'rgb(48,201,201)',
  'rgb(247,192,52)',
  'rgb(123,61,209)',
  'rgb(70,154,250)'
]

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
const perfSummary = ref({})
const weeklyPerf = ref({})
const coinPerf = ref({})
const perfLoading = ref(false)
const chartsReady = ref(false)
const descRef = ref(null)
const descOverflow = ref(false)
const showDescDialog = ref(false)
const ranges = ['7d', '15d', '30d', 'all']

function onBack() {
  _back()
}

function rateToneClass(val, prefix = 'inst-card__roi-value') {
  const n = Number(val)
  if (n > 0) return `${prefix}--positive`
  if (n < 0) return `${prefix}--negative`
  return ''
}

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
const weeklyLineSeries = computed(() =>
  weeklySeries.value.map((row, idx) => ({
    date: row.week || row.label || t18('copy_trade_week_label').replace('{n}', String(idx + 1)),
    chartValue: row.chartValue ?? row.weeklyRate ?? row.cumulativeRate ?? row.rate ?? row.value
  }))
)
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

const assetLegend = computed(() =>
  coinPreference.value.map((item, i) => ({
    symbol: item.symbol === 'Other' ? t18('copy_trade_coin_other') : item.symbol,
    rate: formatRate(item.rate),
    color: ASSET_COLORS[i % ASSET_COLORS.length]
  }))
)

const assetDonutGradient = computed(() => {
  const items = coinPreference.value
  if (!items.length) return ''
  let start = 0
  const stops = items.map((item, i) => {
    const pct = Number(item.rate) || 0
    const end = start + pct
    const slice = `${ASSET_COLORS[i % ASSET_COLORS.length]} ${start}% ${end}%`
    start = end
    return slice
  })
  return `conic-gradient(${stops.join(', ')})`
})

const activePerfSummary = computed(() =>
  mergePerfSummaryFields(perfSummary.value, normalizePerfSummary(perf.value))
)

const summaryJoinTime = computed(() => {
  const summary = activePerfSummary.value
  const raw =
    perfTab.value === 'my'
      ? summary.subscribeTime || summary.joinTime || '--'
      : summary.joinTime ||
        perf.value.joinTime ||
        detail.value.joinTime ||
        detail.value.joinDate ||
        '--'
  return formatCopyTradeDisplayDate(raw, 'YYYY-MM-DD')
})
const summaryTradingDays = computed(() => {
  const summary = activePerfSummary.value
  if (perfTab.value === 'my') {
    const days = summary.copyDays ?? summary.tradingDays
    return days != null && days !== '' ? days : '--'
  }
  return summary.tradingDays ?? perf.value.tradingDays ?? detail.value.tradingDays ?? '--'
})
const summaryTotalRate = computed(() => {
  const summary = activePerfSummary.value
  if (perfTab.value === 'my') {
    const rate = summary.totalProfitRate ?? perf.value.totalProfitRate
    return rate != null && rate !== '' ? rate : 0
  }
  return summary.totalProfitRate ?? perf.value.totalProfitRate ?? detail.value.totalProfitRate ?? 0
})
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
  let summary = {}
  sources.forEach((src) => {
    if (!src) return
    const norm = normalizePerfData(src)
    summary = mergePerfSummaryFields(summary, norm)
    merged = {
      ...merged,
      ...src,
      ...norm,
      ...summary,
      dailySeries: norm.dailySeries?.length ? norm.dailySeries : merged.dailySeries || [],
      weeklySeries: norm.weeklySeries?.length ? norm.weeklySeries : merged.weeklySeries || [],
      coinPreference: norm.coinPreference?.length ? norm.coinPreference : merged.coinPreference || []
    }
  })
  return merged
}

let perfSnapshotKey = ''
let perfSnapshotPromise = null

function resetPerfSnapshot() {
  perfSnapshotKey = ''
  perfSnapshotPromise = null
}

async function fetchPerfSnapshot(payload, isMy) {
  const key = `${isMy ? 'my' : 'inst'}:${payload.institutionId}:${payload.range || '7d'}`
  if (perfSnapshotKey === key && perfSnapshotPromise) {
    return perfSnapshotPromise
  }
  perfSnapshotKey = key
  perfSnapshotPromise = (async () => {
    const perfRes = isMy
      ? await getCopyTradeMyPerformance(payload)
      : await getCopyTradeInstitutionPerformance(payload)
    return perfRes?.code == 200 && perfRes.data ? normalizePerfData(perfRes.data) : null
  })()
  return perfSnapshotPromise
}

function scheduleChartsReady() {
  chartsReady.value = false
  requestAnimationFrame(() => {
    chartsReady.value = true
  })
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
    const snapshot = await fetchPerfSnapshot(payload, isMy)
    if (snapshot) {
      data = mergePerfData(snapshot, data)
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
    const snapshot = await fetchPerfSnapshot(payload, isMy)
    if (snapshot) {
      data = mergePerfData(snapshot, data)
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
  const snapshot = await fetchPerfSnapshot(payload, isMy)
  if (snapshot) {
    perfSummary.value = normalizePerfSummary(snapshot)
    perf.value = mergePerfData(snapshot, perf.value)
    if (isMy) {
      const summary = activePerfSummary.value
      if ((!summary.subscribeTime && !summary.joinTime) || summary.copyDays == null) {
        await loadMyRecordFallback()
        perfSummary.value = mergePerfSummaryFields(perfSummary.value, normalizePerfSummary(perf.value))
      }
    }
  } else if (isMy) {
    await loadMyRecordFallback()
    perfSummary.value = normalizePerfSummary(perf.value)
  } else {
    perfSummary.value = {}
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
    const snapshot = await fetchPerfSnapshot(payload, isMy)
    if (snapshot) {
      data = snapshot
      coins = normalizeCoinPreference(snapshot)
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
  chartsReady.value = false
  try {
    await Promise.all([loadDailyChart(), loadWeeklyChart(), loadCoinPreference()])
    await loadPerfSummary()
  } finally {
    perfLoading.value = false
    scheduleChartsReady()
  }
}

function switchPerfTab(tab) {
  if (perfTab.value === tab) return
  perfTab.value = tab
  perf.value = {}
  perfSummary.value = {}
  weeklyPerf.value = {}
  coinPerf.value = {}
  resetPerfSnapshot()
  loadPerformance()
}

function changeRange(r) {
  if (range.value === r) return
  range.value = r
  resetPerfSnapshot()
  chartsReady.value = false
  Promise.all([loadDailyChart(), loadCoinPreference()]).finally(scheduleChartsReady)
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
@use './styles/institution-detail.scss';
</style>
