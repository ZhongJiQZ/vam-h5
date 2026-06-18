<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :overlay-style="{ background: 'rgba(0,0,0,0.6)' }"
    @update:show="$emit('update:show', $event)"
  >
    <div class="share-sheet">
      <p class="sheet-title">{{ _t18('copy_trade_share_title') }}</p>

      <!-- 卡片截图区域 -->
      <div class="share-card" ref="cardRef">
        <div class="card-header">
          <img src="@/assets/copyTrade/share-logo.png" class="card-logo" alt="" />
          <div class="card-datetime">
            <span>{{ dateArr[0] }}</span>
            <span>{{ dateArr[1] }}</span>
          </div>
        </div>

        <div class="card-body">
          <!-- 几何装饰背景 -->
          <svg class="geo-bg" viewBox="0 0 320 200" preserveAspectRatio="xMaxYMin slice" xmlns="http://www.w3.org/2000/svg">
            <circle cx="280" cy="20" r="90" fill="none" stroke="rgba(23,172,116,0.10)" stroke-width="28"/>
            <circle cx="280" cy="20" r="140" fill="none" stroke="rgba(23,172,116,0.05)" stroke-width="20"/>
            <circle cx="280" cy="20" r="190" fill="none" stroke="rgba(23,172,116,0.03)" stroke-width="16"/>
            <line x1="0" y1="180" x2="120" y2="0" stroke="rgba(23,172,116,0.04)" stroke-width="1"/>
            <line x1="40" y1="200" x2="160" y2="0" stroke="rgba(23,172,116,0.03)" stroke-width="1"/>
            <line x1="80" y1="200" x2="200" y2="0" stroke="rgba(23,172,116,0.03)" stroke-width="1"/>
          </svg>

          <div class="card-top">
            <div class="card-left">
              <p class="caption">{{ _t18('copy_trade_share_caption') }}</p>
              <p class="big-rate" :class="rateClass">{{ rateStr }}%</p>
              <p class="rate-label">{{ _t18('copy_trade_share_rate_label') }}</p>
              <div class="strategy-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#17ac74" stroke-width="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                <span>{{ _t18('copy_trade_share_strategy') }}</span>
              </div>
            </div>
            <img src="@/assets/copyTrade/share-coin-bg.png" class="card-coin" alt="" />
          </div>

          <div class="card-sep" />

          <div class="card-kvs">
            <div class="card-kv">
              <span class="kv-dot" style="background:#17ac74">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </span>
              <span class="kv-label">{{ _t18('copy_trade_amount') }}</span>
              <span class="kv-val">{{ priceFormat(item.amount) }} USDT</span>
            </div>
            <div class="card-kv">
              <span class="kv-dot" style="background:#3b9ee8">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              <span class="kv-label">{{ _t18('copy_trade_join_time') }}</span>
              <span class="kv-val">{{ formatCopyTradeJoinTime(item) }}</span>
            </div>
            <div class="card-kv">
              <span class="kv-dot" style="background:#f0783c">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </span>
              <span class="kv-label">{{ _t18('copy_trade_exit_time') }}</span>
              <span class="kv-val">{{ formatCopyTradeExitTime(item) }}</span>
            </div>
            <div class="card-kv">
              <span class="kv-dot" style="background:#17ac74">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </span>
              <span class="kv-label">{{ _t18('copy_trade_period_pnl') }}</span>
              <span class="kv-val" :class="pnlClass(item.actualProfit)">{{ formatPnl(item.actualProfit) }} USDT</span>
            </div>
            <div class="card-kv">
              <span class="kv-dot" style="background:#9b6cf0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
              </span>
              <span class="kv-label">{{ _t18('copy_trade_pnl_rate') }}</span>
              <span class="kv-val" :class="pnlClass(item.actualProfit)">{{ rateStr }}%</span>
            </div>
          </div>

          <p class="card-watermark">METADOMAIN CAPITAL</p>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <button class="action-btn" @click="downloadCard" :disabled="downloading">
          <span class="action-icon">
            <van-loading v-if="downloading" size="18px" color="#fff" />
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </span>
          <span>{{ _t18('copy_trade_share_save') }}</span>
        </button>
        <button class="action-btn" @click="shareLink" :disabled="sharing">
          <span class="action-icon">
            <van-loading v-if="sharing" size="18px" color="#fff" />
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </span>
          <span>{{ _t18('copy_trade_share_link') }}</span>
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import { _t18 } from '@/utils/public'
import { priceFormat } from '@/utils/decimal'
import { formatPnl, pnlClass, calcPnlRate, formatCopyTradeJoinTime, formatCopyTradeExitTime } from '../utils'

const props = defineProps({
  show: { type: Boolean, default: false },
  item: { type: Object, default: () => ({}) }
})
defineEmits(['update:show'])

const cardRef = ref(null)
const downloading = ref(false)
const sharing = ref(false)

const dateArr = computed(() => {
  const t = formatCopyTradeExitTime(props.item, 'YYYY-MM-DD HH:mm:ss')
  if (!t || t === '--') return ['--', '']
  const parts = t.replace(/-/g, '/').split(' ')
  return [parts[0] || '--', parts[1]?.slice(0, 5) || '']
})

const rateStr = computed(() => calcPnlRate(props.item.actualProfit, props.item.amount))
const rateClass = computed(() => pnlClass(props.item.actualProfit))

async function buildCanvas() {
  const { default: html2canvas } = await import('html2canvas')
  return html2canvas(cardRef.value, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  })
}

async function downloadCard() {
  if (!cardRef.value || downloading.value) return
  downloading.value = true
  try {
    const canvas = await buildCanvas()
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `share-${Date.now()}.png`
    a.click()
  } catch (e) {
    void e
  } finally {
    downloading.value = false
  }
}

async function shareLink() {
  if (!cardRef.value || sharing.value) return
  sharing.value = true
  try {
    const canvas = await buildCanvas()
    canvas.toBlob(async (blob) => {
      if (!blob) return
      // 优先使用原生分享（移动端）
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'copy-trade-share.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: '跟单收益分享', files: [file] })
          return
        }
      }
      // 降级：生成 blob URL 复制到剪贴板提示
      const url = URL.createObjectURL(blob)
      try {
        await navigator.clipboard.writeText(url)
        showToast('链接已复制')
      } catch {
        showToast('请长按图片保存')
      }
    }, 'image/png')
  } catch (e) {
    void e
  } finally {
    sharing.value = false
  }
}
</script>

<style lang="scss" scoped>
$green: #17ac74;

.share-sheet {
  padding: 20px 16px 0;
  padding-bottom: calc(28px + env(safe-area-inset-bottom, 0));
}
.sheet-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 14px;
}

.share-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.12);
}

/* 深色渐变 header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  background: linear-gradient(120deg, #061a0f 0%, #0e6640 55%, #17ac74 100%);
}
.card-logo {
  height: 26px;
  width: auto;
  max-width: 150px;
  object-fit: contain;
  object-position: left center;
}
.card-datetime {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  span { font-size: 10px; color: rgba(255,255,255,0.75); line-height: 1.3; }
}

/* 主体 */
.card-body {
  background: linear-gradient(160deg, #f2fdf8 0%, #fff 45%);
  padding: 14px 14px 10px;
  position: relative;
  overflow: hidden;
}

/* 几何 SVG 背景 */
.geo-bg {
  position: absolute;
  top: 0; right: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  position: relative;
}
.card-left { flex: 1; min-width: 0; }
.caption { font-size: 12px; color: #999; margin: 0 0 2px; }
.big-rate {
  font-size: 40px;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 2px;
  letter-spacing: -1px;
  &.is-up { color: $green; }
  &.is-down { color: #e8503a; }
}
.rate-label { font-size: 12px; color: #aaa; margin: 0 0 10px; }
.strategy-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba($green, 0.08);
  border: 1px solid rgba($green, 0.2);
  border-radius: 4px;
  padding: 3px 7px;
  font-size: 11px;
  color: $green;
  font-weight: 500;
}
.card-coin {
  width: 155px;
  height: 155px;
  object-fit: contain;
  flex-shrink: 0;
  margin-left: 4px;
  margin-top: -18px;
  position: relative;
}
.card-sep {
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0 20%, #e0e0e0 80%, transparent);
  margin-bottom: 10px;
  position: relative;
}

/* KV 行 */
.card-kvs { display: flex; flex-direction: column; gap: 7px; position: relative; }
.card-kv {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.kv-dot {
  width: 20px; height: 20px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.kv-label { color: #555; flex: 1; }
.kv-val {
  font-weight: 500;
  color: #1a1a1a;
  &.is-up { color: $green; }
  &.is-down { color: #e8503a; }
}
.card-watermark {
  text-align: center;
  font-size: 9px;
  color: #ccc;
  letter-spacing: 2.5px;
  margin: 12px 0 0;
  position: relative;
}

/* 操作栏：只保留两个按钮 */
.action-bar {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #17ac74, #0e9462);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 14px rgba(23,172,116,0.35);
  &:disabled { opacity: 0.7; }
  &:nth-child(2) {
    background: linear-gradient(135deg, #2c2c2c, #444);
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
  }
}
.action-icon { display: flex; align-items: center; }
</style>
