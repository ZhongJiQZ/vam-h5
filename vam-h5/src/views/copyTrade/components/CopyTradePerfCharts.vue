<template>
  <div class="perf-charts">
    <!-- 每日收益折线图 -->
    <div v-if="showDaily" class="chart-box">
      <svg
        class="chart-svg"
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient :id="`${uid}-area`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#17ac74" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#17ac74" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <polygon v-if="areaPath" :points="areaPath" :fill="`url(#${uid}-area)`" />
        <polyline
          v-if="linePath"
          :points="linePath"
          fill="none"
          stroke="#17ac74"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
        <circle
          v-for="(p, i) in plotPoints"
          :key="'dot-' + i"
          :cx="p.x"
          :cy="p.y"
          r="3"
          fill="#17ac74"
        />
      </svg>
      <div class="chart-labels">
        <span v-for="(p, i) in dailyPoints" :key="i" class="chart-label">{{ p.label }}</span>
      </div>
    </div>

    <p v-else-if="dailyEmptyHint" class="chart-empty">{{ dailyEmptyHint }}</p>

    <!-- 每周收益柱状图 -->
    <div v-if="showWeekly" class="chart-box chart-box--bar">
      <svg class="chart-svg chart-svg--bar" :viewBox="`0 0 ${width} ${barHeight}`" preserveAspectRatio="none">
        <rect
          v-for="(b, i) in weeklyBars"
          :key="i"
          :x="b.x"
          :y="b.y"
          :width="b.w"
          :height="b.h"
          rx="2"
          fill="#17ac74"
          opacity="0.85"
        />
      </svg>
      <div class="chart-labels">
        <span v-for="(b, i) in weeklyBars" :key="'w' + i" class="chart-label">{{ b.label }}</span>
      </div>
    </div>
    <p v-else-if="weeklyEmptyHint" class="chart-empty">{{ weeklyEmptyHint }}</p>

    <!-- 币种偏好环形图 -->
    <div v-if="showCoin" class="donut-wrap">
      <svg class="donut-svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="42" fill="#f3f4f6" />
        <circle
          v-for="(s, i) in coinSlices"
          :key="i"
          cx="60"
          cy="60"
          r="34"
          fill="transparent"
          :stroke="s.color"
          stroke-width="14"
          :stroke-dasharray="s.dash"
          :stroke-dashoffset="s.offset"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <ul class="donut-legend">
        <li v-for="(c, i) in coinSlices" :key="'c' + i">
          <i class="dot" :style="{ background: c.color }" />
          <span class="sym">{{ c.symbol === 'Other' ? coinOtherLabel : c.symbol }}</span>
          <span class="pct ff-num">{{ formatRate(c.rate) }}%</span>
        </li>
      </ul>
    </div>
    <p v-else-if="coinEmptyHint" class="chart-empty">{{ coinEmptyHint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { _t18 } from '@/utils/public'
const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)
const coinOtherLabel = computed(() => t18('copy_trade_coin_other'))

const props = defineProps({
  dailySeries: { type: Array, default: () => [] },
  weeklySeries: { type: Array, default: () => [] },
  coinPreference: { type: Array, default: () => [] },
  formatRate: { type: Function, default: (v) => String(v) },
  dailyEmptyHint: { type: String, default: '' },
  weeklyEmptyHint: { type: String, default: '' },
  coinEmptyHint: { type: String, default: '' },
  showDailyChart: { type: Boolean, default: true },
  showWeeklyChart: { type: Boolean, default: true },
  showCoinChart: { type: Boolean, default: true }
})

const uid = `ct${Math.random().toString(36).slice(2, 8)}`
const width = 320
const height = 140
const barHeight = 120

const DONUT_COLORS = ['#8fd9a8', '#17ac74', '#2dd4bf', '#60a5fa', '#3b82f6', '#9ca3af']

const dailyPoints = computed(() => {
  return (props.dailySeries || []).map((row) => ({
    label: formatDayLabel(row.date || row.day || row.week),
    value: Number(row.chartValue ?? row.cumulativeRate ?? row.dailyRate ?? row.rate ?? row.value) || 0
  }))
})

const showDaily = computed(
  () => props.showDailyChart && dailyPoints.value.length > 0
)
const showWeekly = computed(
  () => props.showWeeklyChart && weeklyBars.value.length > 0
)
const showCoin = computed(
  () => props.showCoinChart && coinSlices.value.length > 0
)

const plotPoints = computed(() => buildPlotPoints(dailyPoints.value, width, height))
const linePath = computed(() => plotPoints.value.map((p) => `${p.x},${p.y}`).join(' '))
const areaPath = computed(() => buildAreaPathFromPlot(plotPoints.value, width, height))

const weeklyBars = computed(() => {
  const list = (props.weeklySeries || []).map((row, idx) => ({
    label: row.week || row.label || t18('copy_trade_week_label').replace('{n}', String(idx + 1)),
    value: Number(row.chartValue ?? row.weeklyRate ?? row.cumulativeRate ?? row.rate ?? row.value) || 0
  }))
  if (!list.length) return []
  const max = Math.max(...list.map((x) => Math.abs(x.value)), 0.01)
  const pad = 8
  const gap = 6
  const barW = Math.max((width - pad * 2 - gap * (list.length - 1)) / list.length, 4)
  return list.map((item, i) => {
    const h = Math.max((Math.abs(item.value) / max) * (barHeight - 24), 3)
    return {
      label: item.label,
      x: pad + i * (barW + gap),
      y: barHeight - 16 - h,
      w: barW,
      h
    }
  })
})

const coinSlices = computed(() => {
  const list = (props.coinPreference || []).filter(
    (c) => Number(c.rate) > 0 || Number(c.count) > 0
  )
  if (!list.length) return []
  const r = 34
  const c = 2 * Math.PI * r
  let offset = 0
  return list.map((item, i) => {
    const pct = Number(item.rate) / 100
    const dash = `${c * pct} ${c * (1 - pct)}`
    const slice = {
      symbol: item.symbol,
      rate: item.rate,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
      dash,
      offset: -offset
    }
    offset += c * pct
    return slice
  })
})

function formatDayLabel(raw) {
  if (!raw) return '--'
  const s = String(raw)
  if (s.includes('/')) return s.slice(s.indexOf('/') + 1)
  if (s.length >= 10) return s.slice(5).replace('-', '/')
  return s
}

function buildPlotPoints(points, w, h) {
  if (!points.length) return []
  const vals = points.map((p) => p.value)
  const min = Math.min(...vals, 0)
  const max = Math.max(...vals, min + 0.01)
  const padX = 8
  const padY = 12
  const innerW = w - padX * 2
  const innerH = h - padY * 2
  return points.map((p, i) => {
    const x = padX + (i / Math.max(points.length - 1, 1)) * innerW
    const y = padY + innerH - ((p.value - min) / (max - min)) * innerH
    return { x, y, label: p.label, value: p.value }
  })
}

function buildAreaPathFromPlot(plotPts, w, h) {
  if (!plotPts.length) return ''
  const line = plotPts.map((p) => `${p.x},${p.y}`).join(' ')
  const first = plotPts[0]
  const last = plotPts[plotPts.length - 1]
  const baseY = h - 4
  return `${first.x},${first.y} ${line} ${last.x},${baseY} ${first.x},${baseY}`
}
</script>

<style lang="scss" scoped>
.perf-charts {
  width: 100%;
}

.chart-box {
  background: #fafbfc;
  border-radius: 8px;
  padding: 12px 8px 4px;
  margin-bottom: 8px;

  &--bar {
    padding-bottom: 0;
  }
}

.chart-svg {
  width: 100%;
  height: 140px;
  display: block;

  &--bar {
    height: 120px;
  }
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 4px 2px 0;
  font-size: 10px;
  color: #9ca3af;
}

.chart-label {
  flex: 1;
  text-align: center;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-empty {
  margin: 0;
  padding: 28px 0;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  background: #fafbfc;
  border-radius: 8px;
}

.donut-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.donut-svg {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.donut-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    margin-bottom: 8px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .sym {
    flex: 1;
    font-weight: 600;
    color: #374151;
  }

  .pct {
    color: #17ac74;
    font-weight: 600;
  }
}
</style>
