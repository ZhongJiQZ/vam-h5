<!-- 我的跟单 -->
<template>
  <div class="my-copy-page">
    <DarkHeaderBar :title="_t18('copy_trade_my')" :border_bottom="false" />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div v-if="institutionSummary" class="ended-summary">
        <div class="kv">
          <span>{{ _t18('copy_trade_subscribe_time') }}</span>
          <span>{{ institutionSummary.firstTime || '--' }}</span>
        </div>
<!--        <div class="kv">-->
<!--          <span>{{ _t18('copy_trade_days') }}</span>-->
<!--          <span>{{ institutionSummary.days }}{{ _t18('copy_trade_day_unit') }}</span>-->
<!--        </div>-->
        <div class="kv">
          <span>{{ _t18('copy_trade_times') }}</span>
          <span>{{ institutionSummary.count }}{{ _t18('copy_trade_times_unit') }}</span>
        </div>
<!--        <div class="kv">-->
<!--          <span>{{ _t18('copy_trade_total_profit') }}</span>-->
<!--          <span class="ff-num is-up">{{ institutionSummary.totalProfit }} USDT</span>-->
<!--        </div>-->
        <div class="kv">
          <span>{{ _t18('copy_trade_total_profit_rate') }}</span>
          <span class="ff-num is-up">{{ institutionSummary.totalRate }}%</span>
        </div>
<!--        <div class="kv">-->
<!--          <span>{{ _t18('copy_trade_service_fee') }}</span>-->
<!--          <span class="ff-num">{{ institutionSummary.tradeFee }}</span>-->
<!--        </div>-->
<!--        <div class="kv">-->
<!--          <span>{{ _t18('copy_trade_inst_profit_share') }}</span>-->
<!--          <span class="ff-num">{{ institutionSummary.profitShareAmt }}</span>-->
<!--        </div>-->
        <div class="kv kv--no-border">
          <span>{{ _t18('copy_trade_actual_profit') }}</span>
          <span class="ff-num is-up summary-actual">{{ institutionSummary.netProfit }}</span>
        </div>
      </div>

      <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="list.length ? _t18('no_more_data') : ''"
        :loading-text="_t18('loading')"
        @load="onLoad"
      >
        <div v-for="group in groupedList" :key="group.date" class="date-group">
          <div class="date-divider">
            <span class="date-divider__text">{{ formatGroupDateLabel(group) }}</span>
          </div>
          <div v-for="item in group.items" :key="item.id" class="order-group">
            <div class="strategy-card" @click="goDetail(item)">
              <div class="strategy-card__head">
                <img v-if="item.icon" :src="item.icon" class="avatar avatar--img" alt="" />
                <div v-else class="avatar">{{ (item.strategyName || '?')[0] }}</div>
                <div class="head-info">
                  <p class="name">{{ item.strategyName }}</p>
                  <span class="badge" :class="copyTradeOrderBadgeClass(item)">
                    {{ copyTradeOrderStatusText(item, t18) }}
                  </span>
                </div>
                <button
                  v-if="isCopyTradeOrderEnded(item)"
                  type="button"
                  class="share-btn"
                  @click.stop="openShare(item)"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </div>

              <div class="kv-list">
                <div v-if="copyTradeHasAmount(item)" class="kv">
                  <span class="kv__label">{{ _t18('copy_trade_amount') }}</span>
                  <span class="kv__value ff-num">{{ priceFormat(item.amount) }} USDT</span>
                </div>
                <div class="kv">
                  <span class="kv__label">{{ _t18('copy_trade_strategy_start_time') }}</span>
                  <span class="kv__value">{{ formatCopyTradeTime(item, COPY_TRADE_TIME_FIELD.STRATEGY_START) }}</span>
                </div>
                <div v-if="!isCopyTradeOrderEnded(item)" class="kv">
                  <span class="kv__label">{{ _t18('copy_trade_strategy_end_time') }}</span>
                  <span class="kv__value">{{ formatCopyTradeTime(item, COPY_TRADE_TIME_FIELD.STRATEGY_END) }}</span>
                </div>
                <div v-if="isCopyTradeOrderEnded(item)" class="kv kv--last">
                  <span class="kv__label">{{ _t18('copy_trade_exit_time') }}</span>
                  <span class="kv__value">{{ formatCopyTradeTime(item, COPY_TRADE_TIME_FIELD.EXIT) }}</span>
                </div>
                <div v-if="!isCopyTradeOrderEnded(item)" class="kv">
                  <span class="kv__label">{{ _t18('copy_trade_current_symbol') }}</span>
                  <span class="kv__value">{{ copyTradePositionSymbol(item, t18) }}</span>
                </div>
                <div v-if="!isCopyTradeOrderEnded(item)" class="kv kv--last">
                  <span class="kv__label">{{ _t18('copy_trade_today_trades') }}</span>
                  <span class="kv__value ff-num">{{ copyTradeTradeCount(item) }}</span>
                </div>
              </div>

              <div class="pnl-hero">
                <div class="pnl-hero__metric">
                  <span class="pnl-hero__label">
                    {{ isCopyTradeOrderEnded(item) ? _t18('copy_trade_period_pnl') : _t18('copy_trade_pnl_usdt') }}
                  </span>
                  <span class="ff-num pnl-hero__value" :class="pnlClass(orderPnl(item))">
                    {{ formatPnl(orderPnl(item)) }} USDT
                  </span>
                </div>
                <div class="pnl-hero__metric pnl-hero__metric--right">
                  <span class="pnl-hero__label">{{ _t18('copy_trade_roi') }}</span>
                  <span class="ff-num pnl-hero__value" :class="pnlClass(copyTradeGrossProfit(item))">{{ orderPnlRate(item) }}%</span>
                </div>
              </div>

              <div
                v-if="copyTradeHasAmount(item) && !isCopyTradeFullyExited(item) && (!isCopyTradeStrategyEnded(item) || canManualExitCopyTrade(item))"
                class="card-actions"
                @click.stop
              >
                <button
                  v-if="!isCopyTradeStrategyEnded(item)"
                  type="button"
                  class="append-btn"
                  @click="openAppend(item)"
                >
                  {{ _t18('copy_trade_append') }}
                </button>
                <button
                  v-else-if="canManualExitCopyTrade(item)"
                  type="button"
                  class="stop-btn"
                  @click="openStop(item)"
                >
                  {{ _t18('copy_trade_stop') }}
                </button>
              </div>
              <div class="card-footer">
                <span class="detail-link">{{ _t18('copy_trade_view_detail') }}</span>
              </div>
            </div>
          </div>
        </div>

        <Nodata v-if="!loading && list.length === 0 && loadedOnce" />
      </van-list>
    </van-pull-refresh>

    <ShareDialog v-if="shareVisible" v-model:show="shareVisible" :item="shareItem" />
    <AppendDialog v-model:show="appendVisible" :item="appendItem" :loading="appendLoading" @confirm="confirmAppend" />
    <StopConfirmDialog
      v-model:show="stopVisible"
      :rows="stopRows"
      :loading="stopLoading"
      @confirm="confirmStop"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import AppendDialog from './components/AppendDialog.vue'
import StopConfirmDialog from './components/StopConfirmDialog.vue'
const ShareDialog = defineAsyncComponent(() => import('./components/ShareDialog.vue'))
import { _t18 } from '@/utils/public'
import { getCopyTradeList, appendCopyTrade, exitCopyTrade, getCopyTradeMyPerformance } from '@/api/copyTrade'
import { priceFormat, _add } from '@/utils/decimal'
import {
  copyTradePositionSymbol,
  formatPnl,
  pnlClass,
  copyTradeTradeCount,
  formatCopyTradeTime,
  COPY_TRADE_TIME_FIELD,
  copyTradeHasAmount,
  normalizeCopyTradeListResponse,
  copyTradeOrderBadgeClass,
  copyTradeOrderStatusText,
  isCopyTradeOrderEnded,
  isCopyTradeFullyExited,
  isCopyTradeStrategyEnded,
  canManualExitCopyTrade,
  copyTradeNetProfit,
  copyTradeGrossProfit,
  copyTradeGrossPnlRate,
  copyTradeOrderDisplayPnl,
  groupCopyTradeOrdersByDate,
  formatCopyTradeDisplayDate,
  resolveCopyTradeJoinRaw,
  resolveCopyTradeExitRaw,
  calcCopyTradeRunningDays,
  normalizePerfSummary,
  calcPnlRate
} from './utils'
import dayjs from '@/plugin/dayjs/index'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'
import 'dayjs/locale/en'
import 'dayjs/locale/id'
import 'dayjs/locale/ja'
import 'dayjs/locale/ko'
import 'dayjs/locale/vi'
import 'dayjs/locale/th'
import 'dayjs/locale/fr'
import 'dayjs/locale/de'
import 'dayjs/locale/es'
import 'dayjs/locale/pt'
import 'dayjs/locale/it'
import 'dayjs/locale/ru'
import 'dayjs/locale/ar'
import 'dayjs/locale/tr'
import 'dayjs/locale/pl'
import 'dayjs/locale/nl'
import 'dayjs/locale/da'
import 'dayjs/locale/hi'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const myPerf = ref(null)
const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)
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
const stopVisible = ref(false)
const stopItem = ref({})
const stopRows = ref([])
const stopLoading = ref(false)

const groupedList = computed(() => groupCopyTradeOrdersByDate(list.value, t18))

/** 列表卡片：盈亏用 netProfit；ROI 用毛盈利率（不含手续费/机构分润） */
function orderPnl(item) {
  return copyTradeNetProfit(item)
}

function orderPnlRate(item) {
  return copyTradeGrossPnlRate(item, 3)
}

const DAYJS_LOCALE_MAP = {
  zh: 'zh-cn',
  tw: 'zh-tw',
  en: 'en',
  id: 'id',
  ja: 'ja',
  ko: 'ko',
  vi: 'vi',
  th: 'th',
  fr: 'fr',
  de: 'de',
  es: 'es',
  pt: 'pt',
  it: 'it',
  ru: 'ru',
  ar: 'ar',
  tr: 'tr',
  pl: 'pl',
  nl: 'nl',
  da: 'da',
  hi: 'hi',
  af: 'en',
  iw: 'en',
  pk: 'en'
}

function resolveDayjsLocale() {
  const raw = String(i18n.locale.value || 'en').toLowerCase()
  if (raw.includes('tw')) return 'zh-tw'
  if (raw.startsWith('zh')) return 'zh-cn'
  const base = raw.split('-')[0]
  return DAYJS_LOCALE_MAP[base] || 'en'
}

function formatGroupDateLabel(group) {
  if (!group || group.date === 'unknown') return group?.dateLabel || ''
  const d = dayjs(group.date)
  if (!d.isValid()) return group.dateLabel
  const locale = resolveDayjsLocale()
  const lang = String(i18n.locale.value || 'en').toLowerCase().split('-')[0]
  if (lang === 'zh' || lang === 'tw') {
    return d.locale(locale).format('M月D日 ddd')
  }
  return d.locale(locale).format('YYYY.MM.DD ddd')
}

const institutionSummary = computed(() => {
  if (!route.query.institutionId || !list.value.length) return null

  let totalProfit = 0
  let totalAmount = 0
  let totalFee = 0
  let totalShare = 0
  let totalNet = 0
  let earliestJoin = ''
  let latestExit = ''

  list.value.forEach((item) => {
    const p = copyTradeOrderDisplayPnl(item)
    totalProfit = _add(totalProfit, p)
    totalAmount = _add(totalAmount, Number(item.amount) || 0)
    totalFee = _add(totalFee, Number(item.params?.tradeFee ?? item.tradeFee) || 0)
    totalShare = _add(totalShare, Number(item.params?.profitShareAmt ?? item.profitShareAmt) || 0)
    totalNet = _add(totalNet, Number(item.params?.netProfit ?? item.netProfit) || 0)

    const joinRaw = resolveCopyTradeJoinRaw(item)
    const exitRaw = resolveCopyTradeExitRaw(item)
    if (joinRaw && (!earliestJoin || dayjs(joinRaw).isBefore(dayjs(earliestJoin)))) {
      earliestJoin = joinRaw
    }
    if (exitRaw && (!latestExit || dayjs(exitRaw).isAfter(dayjs(latestExit)))) {
      latestExit = exitRaw
    }
  })

  const perfSummary = normalizePerfSummary(myPerf.value || {})
  let firstTime = earliestJoin ? formatCopyTradeDisplayDate(earliestJoin, 'YYYY-MM-DD') : ''
  let days = calcCopyTradeRunningDays(earliestJoin, latestExit) ?? 0

  if (myPerf.value) {
    const perfJoin = perfSummary.subscribeTime || perfSummary.joinTime
    if (perfJoin) {
      firstTime = formatCopyTradeDisplayDate(perfJoin, 'YYYY-MM-DD')
    }
    const perfDays = perfSummary.copyDays ?? perfSummary.tradingDays
    if (perfDays != null && perfDays !== '') {
      days = perfDays
    }
  }

  const totalRate = calcPnlRate(totalProfit, totalAmount, 3)

  return {
    firstTime,
    days,
    count: total.value || list.value.length,
    totalProfit: formatPnl(totalProfit),
    totalRate,
    tradeFee: `${formatPnl(totalFee)} USDT`,
    profitShareAmt: `${formatPnl(totalShare)} USDT`,
    netProfit: `${formatPnl(totalNet)} USDT`
  }
})

function onRefresh() {
  list.value = []
  pageNum.value = 1
  finished.value = false
  loadMyPerformance()
  onLoad()
}

function resetList() {
  list.value = []
  pageNum.value = 1
  finished.value = false
  loadedOnce.value = false
  onLoad()
}

async function loadMyPerformance() {
  const institutionId = route.query.institutionId
  if (!institutionId) {
    myPerf.value = null
    return
  }
  try {
    const res = await getCopyTradeMyPerformance({ institutionId, range: 'all' })
    if (res?.code == 200) myPerf.value = res.data
  } catch {
    myPerf.value = null
  }
}

async function fetchList() {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }
  if (route.query.institutionId) params.institutionId = route.query.institutionId
  const res = await getCopyTradeList(params)
  if (res?.code == 200) {
    const parsed = normalizeCopyTradeListResponse(res)
    total.value = parsed.total
    return parsed.rows.map(({ records, _battle, _recordGroups, ...rest }) => rest)
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

function goDetail(item) {
  const status = isCopyTradeOrderEnded(item) ? '1' : '0'
  router.push({
    path: '/copy-trade/detail',
    query: { id: item.id, status }
  })
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

function openStop(item) {
  stopItem.value = item
  stopRows.value = [
    { label: t18('copy_trade_amount'), value: `${priceFormat(item.amount, 2)} USDT`, cls: '' },
    {
      label: t18('copy_trade_trade_fee'),
      value: `${priceFormat(item.tradeFee ?? item.params?.tradeFee ?? 0, 2)} USDT`,
      cls: ''
    },
    {
      label: t18('copy_trade_profit_share_amt'),
      value: `${priceFormat(item.profitShareAmt ?? item.params?.profitShareAmt ?? 0, 2)} USDT`,
      cls: ''
    }
  ]
  stopVisible.value = true
}

async function confirmStop() {
  stopLoading.value = true
  try {
    const res = await exitCopyTrade({ id: stopItem.value.id })
    if (res?.code == 200) {
      showToast(res.msg || t18('copy_trade_exit_success'))
      stopVisible.value = false
      onRefresh()
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
  loadMyPerformance()
  resetList()
})

watch(
  () => route.query.institutionId,
  () => {
    loadMyPerformance()
    resetList()
  }
)
</script>

<style lang="scss" scoped>
$green: #17ac74;
$red: #e8503a;
$muted: #888;

.my-copy-page {
  min-height: 100vh;
  background: #f6f7fa;
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

.date-group {
  margin-bottom: 4px;

  &:first-child .date-divider {
    margin-top: 4px;
  }
}

.date-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0 12px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent);
  }

  &__text {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    letter-spacing: 0.04em;
    padding: 5px 14px;
    background: #fff;
    border-radius: 999px;
    box-shadow: 0 1px 6px rgba(15, 23, 42, 0.06);
  }
}

.ended-summary {
  margin: 12px 15px 8px;
  background: linear-gradient(135deg, #061a0f 0%, #0d5535 55%, #17ac74 100%);
  border-radius: 16px;
  padding: 6px 16px 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(23, 172, 116, 0.18);

  &::before {
    content: '';
    position: absolute;
    top: -30px;
    right: -30px;
    width: 140px;
    height: 140px;
    border: 22px solid rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 20px;
    right: 30px;
    width: 70px;
    height: 70px;
    border: 12px solid rgba(255, 255, 255, 0.04);
    border-radius: 50%;
    pointer-events: none;
  }

  .kv {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    font-size: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    span:first-child {
      color: rgba(255, 255, 255, 0.6);
    }

    span:last-child {
      color: rgba(255, 255, 255, 0.9);
    }

    &.kv--no-border {
      border-bottom: none;
    }
  }

  .is-up {
    color: #4dffa8 !important;
  }

  .summary-actual {
    font-size: 17px;
    font-weight: 600;
    color: #4dffa8 !important;
  }
}

.order-group {
  margin-bottom: 12px;
}

.strategy-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
}

.strategy-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f2f4f7;
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
  flex: 1;
  min-width: 0;

  .name {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px;
    line-height: 1.35;
  }
}

.badge {
  display: inline-block;
  font-size: 11px;
  line-height: 1;
  padding: 5px 10px;
  border-radius: 999px;
  font-weight: 500;

  &--ongoing {
    background: rgba($green, 0.1);
    color: $green;
  }

  &--settled {
    background: #f3f4f6;
    color: $muted;
  }
}

.kv-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
}

.kv-list .kv {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  font-size: 13px;
  line-height: 1.4;

  &--last {
    margin-bottom: 0;
  }
}

.kv__label {
  flex-shrink: 0;
  font-size: 12px;
  color: #8b95a5;
}

.kv__value {
  text-align: right;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  word-break: break-word;
}

.pnl-hero {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
}

.pnl-hero__metric {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--right {
    align-items: flex-end;
    text-align: right;
  }
}

.pnl-hero__label {
  font-size: 12px;
  color: #8b95a5;
}

.pnl-hero__value {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: #111827;

  &.is-up {
    color: $green;
  }

  &.is-down {
    color: #e8503a;
  }
}

.net-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #f2f4f7;
  font-size: 13px;

  &__label {
    color: #8b95a5;
  }

  &__value {
    font-weight: 600;
  }
}

.card-actions {
  margin-top: 12px;
}

.append-btn,
.stop-btn {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}

.append-btn {
  background: rgba($green, 0.1);
  color: $green;
}

.stop-btn {
  background: $green;
  color: #fff;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f2f4f7;
}

.detail-link {
  font-size: 13px;
  font-weight: 500;
  color: $green;
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
