<!-- 充值领金 · 体验券活动 -->
<template>
  <div class="gift-cert-page">
    <HeaderBar
      :current-name="t('gift_cert_title')"
      :border_bottom="false"
      :is-center="true"
      :bg-color="'var(--gift-page-bg, #eef1f6)'"
    >
      <template #footer>
        <button
          type="button"
          class="header-gift-wrap"
          :aria-label="t('gift_cert_my_codes_open')"
          @click.stop="openMyCodesPopup"
        >
          <van-icon name="gift-o" class="header-gift" size="22" />
        </button>
      </template>
    </HeaderBar>

    <van-popup
      v-model:show="myCodesPopupVisible"
      round
      position="center"
      class="gift-my-codes-popup-root"
      :close-on-click-overlay="true"
      teleport="body"
    >
      <div class="my-codes-sheet">
        <div class="my-codes-head">
          <span class="my-codes-title">{{ t('gift_cert_my_codes_title') }}</span>
          <button type="button" class="my-codes-close" :aria-label="t('utils.cancel')" @click="myCodesPopupVisible = false">
            <van-icon name="cross" size="20" />
          </button>
        </div>
        <div class="my-codes-body">
          <div v-if="myCodesLoading" class="my-codes-loading">
            <van-loading type="spinner" size="28" />
          </div>
          <template v-else>
            <p v-if="!myCodesRows.length" class="my-codes-empty">{{ t('gift_cert_my_codes_empty') }}</p>
            <ul v-else class="my-codes-list">
              <li
                v-for="(row, idx) in myCodesRows"
                :key="row.key"
                class="my-codes-row"
                :class="{ 'my-codes-row--inactive': row.inactive }"
              >
                <div class="my-codes-cell">
                  <span
                    class="my-codes-status"
                    :class="row.isCodeUsed ? 'my-codes-status--used' : 'my-codes-status--unused'"
                  >
                    {{ row.isCodeUsed ? t('gift_cert_my_code_used') : t('gift_cert_my_code_unused') }}
                  </span>
                  <span class="my-codes-code">{{ row.code }}</span>
                </div>
                <van-button
                  type="default"
                  size="small"
                  class="my-codes-copy-btn"
                  :class="{ 'my-codes-copy-btn--inactive': row.inactive }"
                  @click="copyCode(row.code)"
                >
                  {{ t('copy') }}
                </van-button>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </van-popup>

    <div class="body">
      <p v-if="batchesLoaded && !batches.length" class="empty-hint">{{ t('gift_cert_empty_activity') }}</p>

      <div v-if="primaryBatch" class="batch-pill">
        <span class="batch-pill-label">{{ t('gift_cert_current_activity') }}</span>
        <span class="batch-pill-name">{{ primaryBatch.name || t('gift_cert_voucher_name_fallback') }}</span>
      </div>

      <div class="card code-card">
        <div class="code-row">
          <van-field
            v-model="voucherCode"
            class="code-input"
            :border="false"
            :placeholder="t('gift_cert_placeholder_code')"
            clearable
          />
          <div class="code-btns">
            <van-button
              type="primary"
              size="small"
              class="btn-action"
              :class="{ 'btn-action--allocate': !hasVoucherCode }"
              :plain="!hasVoucherCode"
              :loading="actionLoading"
              :disabled="actionDisabled"
              @click="onAction"
            >
              {{ actionBtnText }}
            </van-button>
          </div>
        </div>
        <div class="progress-wrap">
          <div class="progress-label-row">
            <span class="progress-caption">{{ t('gift_cert_progress_recharged', progressTextParams) }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
          </div>
        </div>
      </div>

      <div class="card feed-card">
        <div class="feed-heading">
          <span class="feed-heading-dot" />
          <span class="feed-heading-text">{{ t('gift_cert_section_live') }}</span>
        </div>
        <div class="feed-window">
          <div
            v-if="feedLines.length"
            class="feed-marquee"
            :style="{ '--feed-duration': Math.max(feedLines.length * 4, 12) + 's' }"
          >
            <div class="feed-track">
              <p v-for="(line, idx) in feedLines" :key="`a-${idx}`" class="feed-line">{{ line }}</p>
              <p v-for="(line, idx) in feedLines" :key="`b-${idx}`" class="feed-line">{{ line }}</p>
            </div>
          </div>
          <p v-else class="feed-empty">{{ t('gift_cert_feed_empty') }}</p>
        </div>
      </div>

      <div class="card rules-card">
        <section class="rule-block">
          <h3>{{ t('gift_cert_rule_participate_title') }}</h3>
          <p>{{ t('gift_cert_rule_participate_body', { hint: conditionHint }) }}</p>
        </section>
        <section class="rule-block">
          <h3>{{ t('gift_cert_rule_guide_title') }}</h3>
          <p>{{ t('gift_cert_rule_guide_body') }}</p>
        </section>
        <section class="rule-block rule-block--last">
          <h3>{{ t('gift_cert_rule_trial_title') }}</h3>
          <p>{{ t('gift_cert_rule_trial_body') }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user/index'
import { useCopy } from '@/hook/useCopy'
import {
  giftAllocate,
  giftBatchList,
  giftClaim,
  giftClaimFeed,
  giftMyCodes,
  giftProgress
} from '@/api/giftCertificate'

const { t, locale } = useI18n()
const userStore = useUserStore()
const { _copy } = useCopy()

const myCodesPopupVisible = ref(false)
const myCodesLoading = ref(false)
const myCodesRows = ref([])

const batches = ref([])
const batchesLoaded = ref(false)
const voucherCode = ref('')
const claimLoading = ref(false)
const allocateLoading = ref(false)
const hasVoucherCode = computed(() => voucherCode.value.trim().length > 0)
const actionLoading = computed(() => (hasVoucherCode.value ? claimLoading.value : allocateLoading.value))
const actionDisabled = computed(() => (!hasVoucherCode.value ? !progress.canClaim : false))
const actionBtnText = computed(() => (hasVoucherCode.value ? t('gift_cert_redeem') : t('gift_cert_claim')))

const primaryBatch = computed(() => batches.value[0] ?? null)

const primaryBatchId = computed(() => {
  const id = primaryBatch.value?.id
  return id != null && id !== '' ? id : null
})

const feedRaw = ref([])

const progress = reactive({
  segmentProgress: 0,
  segmentTarget: 0,
  slotsEarned: 0,
  claimableRemaining: 0,
  canClaim: false,
  milestoneRepeat: 0,
  currency: '',
  conditionLimit: null,
  percent: null
})

const progressCurrency = computed(() => {
  const b = primaryBatch.value
  return progress.currency || b?.currency || b?.coin || b?.asset || 'USDC'
})

const conditionHint = computed(() => {
  const lim =
    progress.conditionLimit ??
    primaryBatch.value?.condition_limit ??
    primaryBatch.value?.conditionLimit ??
    '1000 USDC'
  return typeof lim === 'number' ? `${lim} ${progressCurrency.value}` : `${lim}`
})

const progressDisplayCur = computed(() => {
  const g = primaryBatch.value?.giftCertificateProgress
  if (g?.segmentProgress != null) return g.segmentProgress
  return progress.segmentProgress ?? g?.currentValue ?? g?.totalRecharge ?? 0
})

const progressDisplayTgt = computed(() => {
  const g = primaryBatch.value?.giftCertificateProgress
  if (g?.segmentTarget != null) return g.segmentTarget
  const t0 = progress.segmentTarget ?? g?.conditionLimit ?? primaryBatch.value?.conditionLimit
  return t0 != null && t0 !== '' ? t0 : '-'
})

const progressTextParams = computed(() => ({
  cur: progressDisplayCur.value,
  tgt: progressDisplayTgt.value,
  sym: progressCurrency.value
}))

const progressPercent = computed(() => {
  if (typeof progress.percent === 'number' && !Number.isNaN(progress.percent)) {
    return Math.min(100, Math.max(0, Math.round(progress.percent)))
  }
  const cur = Number(progressDisplayCur.value) || 0
  const tgt = Number(progressDisplayTgt.value) || 0
  if (tgt <= 0) return 0
  return Math.min(100, Math.round((cur / tgt) * 100))
})

function formatFeedLine(item, tFn) {
  if (item == null) return ''
  if (typeof item === 'string') return item
  const batchName = item.batchName ?? item.batch_name ?? ''
  const userMask =
    item.userMask ??
    item.user_mask ??
    item.maskUid ??
    item.maskedUid ??
    (item.uid != null ? String(item.uid).replace(/(\d{2})\d+(\d{2})/, '$1*****$2') : '')
  const amt = item.amount ?? item.voucherAmount ?? item.usdc ?? ''
  const cur = item.currency ?? 'USDC'
  if (item.zh || item.cn) return item.zh || item.cn
  if (item.en) return item.en
  if (batchName && userMask && amt !== '') {
    let line = tFn('gift_cert_feed_claim_line', {
      userMask,
      batchName,
      amount: amt
    })
    const claimTime = item.claimTime ?? item.claim_time
    if (claimTime) line += ` · ${claimTime}`
    return line
  }
  if (userMask && amt !== '') {
    return tFn('gift_cert_feed_congrats', { uid: userMask, amt, cur })
  }
  if (item.msg || item.message) return item.msg || item.message
  try {
    return JSON.stringify(item)
  } catch {
    return String(item)
  }
}

const feedLines = computed(() => {
  locale.value
  const list = feedRaw.value
  if (!Array.isArray(list) || !list.length) return []
  return list.map((item) => formatFeedLine(item, t)).filter(Boolean)
})

function normalizeList(res) {
  const d = res?.data
  if (Array.isArray(d)) return d
  if (Array.isArray(res?.rows)) return res.rows
  if (Array.isArray(d?.list)) return d.list
  if (Array.isArray(d?.records)) return d.records
  return []
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function makeMockClaimTime(seed) {
  const now = new Date()
  const maxOffsetMs = 30 * 24 * 60 * 60 * 1000
  const randomOffsetMs = Math.floor(Math.random() * maxOffsetMs)
  const d = new Date(now.getTime() - randomOffsetMs)
  const yyyy = d.getFullYear()
  const mm = d.getMonth() + 1
  const dd = d.getDate()
  const hh = d.getHours()
  const mi = d.getMinutes()
  return `${yyyy}-${pad2(mm)}-${pad2(dd)} ${pad2(hh)}:${pad2(mi)}`
}

function maskUidLike(seed) {
  const num = Math.floor(Math.random() * 1000)
  return `***${String(num).padStart(3, '0')}`
}

function expandFeedList(baseList, target = 100) {
  if (!Array.isArray(baseList) || !baseList.length) return []
  if (baseList.length >= target) return baseList.slice(0, target)

  const result = baseList.map((item) => ({ ...(item ?? {}) }))
  let seed = 1
  while (result.length < target) {
    const src = baseList[result.length % baseList.length]
    if (src && typeof src === 'object') {
      const row = { ...src }
      if (row.claimTime != null || row.claim_time != null) {
        row.claimTime = makeMockClaimTime(seed)
      }
      if (
        row.userMask != null ||
        row.user_mask != null ||
        row.maskUid != null ||
        row.maskedUid != null ||
        row.uid != null
      ) {
        row.userMask = maskUidLike(seed)
      }
      if (row.amount != null || row.voucherAmount != null || row.usdc != null) {
        row.amount = (Math.floor(Math.random() * 10) + 1) * 100;
      }
      result.push(row)
    } else {
      result.push(src)
    }
    seed += 1
  }
  return result
}

function applyEmbeddedProgress(batch) {
  const g = batch?.giftCertificateProgress
  if (!g) return
  const segP = g.segmentProgress
  const segT = g.segmentTarget
  if (segP != null && segT != null) {
    progress.segmentProgress = segP
    progress.segmentTarget = segT
    progress.percent = null
  } else {
    progress.segmentProgress = g.currentValue ?? g.totalRecharge ?? 0
    progress.segmentTarget = g.conditionLimit ?? batch.conditionLimit ?? 0
    progress.percent = typeof g.percent === 'number' ? g.percent : null
  }
  progress.slotsEarned = g.slotsEarned ?? 0
  progress.claimableRemaining = g.claimableRemaining ?? 0
  progress.canClaim = !!g.canClaim
  progress.milestoneRepeat = g.milestoneRepeat ?? batch.milestoneRepeat ?? 0
  progress.conditionLimit = g.conditionLimit ?? batch.conditionLimit ?? null
}

async function loadBatches() {
  try {
    const res = await giftBatchList({})
    batches.value = normalizeList(res)
    const first = batches.value[0]
    if (first) applyEmbeddedProgress(first)
    else {
      Object.assign(progress, {
        segmentProgress: 0,
        segmentTarget: 0,
        canClaim: false,
        milestoneRepeat: 0,
        percent: null,
        conditionLimit: null
      })
    }
  } finally {
    batchesLoaded.value = true
  }
}

async function loadFeed() {
  try {
    const res = await giftClaimFeed({})
    const list = normalizeList(res)
    feedRaw.value = expandFeedList(list, 100)
  } catch {
    feedRaw.value = []
  }
}

async function loadProgress() {
  const id = primaryBatchId.value
  if (id == null) {
    Object.assign(progress, {
      segmentProgress: 0,
      segmentTarget: 0,
      canClaim: false,
      milestoneRepeat: 0,
      percent: null
    })
    return
  }
  try {
    const res = await giftProgress({ batchId: id })
    const d = res?.data ?? res ?? {}
    const segP = d.segmentProgress ?? d.segment_progress
    const segT = d.segmentTarget ?? d.segment_target
    if (segP != null && segT != null) {
      progress.segmentProgress = segP
      progress.segmentTarget = segT
      progress.percent = null
    } else {
      progress.segmentProgress = d.currentValue ?? d.current ?? d.totalRecharge ?? 0
      progress.segmentTarget =
        d.conditionLimit ?? d.target ?? d.condition_limit ?? primaryBatch.value?.conditionLimit ?? 0
      progress.percent = typeof d.percent === 'number' ? d.percent : null
    }
    progress.slotsEarned = d.slotsEarned ?? 0
    progress.claimableRemaining = d.claimableRemaining ?? d.claimable_remaining ?? 0
    progress.canClaim = !!(d.canClaim ?? d.can_claim)
    progress.milestoneRepeat = d.milestoneRepeat ?? d.milestone_repeat ?? 0
    progress.currency = d.currency ?? d.coin ?? ''
    progress.conditionLimit =
      d.condition_limit ?? d.conditionLimit ?? primaryBatch.value?.conditionLimit ?? null
  } catch {
    if (primaryBatch.value) applyEmbeddedProgress(primaryBatch.value)
  }
}

function isTruthyUseTime(raw) {
  if (raw == null) return false
  if (typeof raw === 'string') return raw.trim() !== ''
  return true
}

function normalizeMyCodeRow(item, index) {
  if (typeof item === 'string') {
    return {
      code: item,
      inactive: false,
      isCodeUsed: false,
      key: `c-${index}-${item.slice(0, 12)}`
    }
  }
  const code =
    item.code ??
    item.giftCode ??
    item.certificateCode ??
    item.voucherCode ??
    item.redeemCode ??
    ''
  const useTimeRaw = item.useTime ?? item.use_time ?? item.usetime
  const isCodeUsed = isTruthyUseTime(useTimeRaw)
  const status = item.status ?? item.useStatus ?? item.state
  const inactive = !!(
    isCodeUsed ||
    item.used === true ||
    item.isUsed === true ||
    item.usedFlag === 1 ||
    item.usedFlag === '1' ||
    status === 2 ||
    status === '2' ||
    status === 'USED' ||
    status === 'used' ||
    status === 'EXPIRED' ||
    status === 'expired' ||
    item.redeemed === true ||
    item.isExpired === true
  )
  return {
    code: String(code),
    inactive,
    isCodeUsed,
    key: String(item.id ?? `${index}-${code}`.slice(0, 48))
  }
}

function normalizeMyCodesRows(res) {
  return normalizeList(res)
    .map((item, index) => normalizeMyCodeRow(item, index))
    .filter((r) => r.code)
}

async function fetchMyCodesList() {
  myCodesLoading.value = true
  myCodesRows.value = []
  try {
    const res = await giftMyCodes({})
    myCodesRows.value = normalizeMyCodesRows(res)
  } catch {
    myCodesRows.value = []
  } finally {
    myCodesLoading.value = false
  }
}

async function openMyCodesPopup() {
  if (!userStore.isSign) {
    showToast(t('gift_cert_toast_login'))
    return
  }
  myCodesPopupVisible.value = true
  await fetchMyCodesList()
}

function copyCode(text) {
  if (!text) return
  _copy(text)
}

async function onClaim() {
  const code = voucherCode.value.trim()
  if (!code) {
    showToast(t('gift_cert_toast_input_code'))
    return
  }
  if (!userStore.isSign) {
    showToast(t('gift_cert_toast_login'))
    return
  }
  claimLoading.value = true
  try {
    await giftClaim({ code })
    showToast(t('gift_cert_toast_claim_ok'))
    voucherCode.value = ''
    await loadBatches()
    await loadProgress()
    loadFeed()
  } finally {
    claimLoading.value = false
  }
}

async function onAllocate() {
  const id = primaryBatchId.value
  if (id == null) {
    showToast(t('gift_cert_toast_no_activity'))
    return
  }
  if (!userStore.isSign) {
    showToast(t('gift_cert_toast_login'))
    return
  }
  if (!progress.canClaim) {
    showToast(t('gift_cert_toast_allocate_denied'))
    return
  }
  allocateLoading.value = true
  try {
    await giftAllocate({ batchId: id })
    showToast(t('gift_cert_toast_allocate_ok'))
    await loadBatches()
    await loadProgress()
    loadFeed()
  } finally {
    allocateLoading.value = false
  }
}

function onAction() {
  if (hasVoucherCode.value) {
    onClaim()
    return
  }
  onAllocate()
}

function syncDocTitle() {
  document.title = t('gift_cert_title')
}

watch(locale, syncDocTitle)

onMounted(async () => {
  syncDocTitle()
  await loadBatches()
  await Promise.all([loadFeed(), loadProgress()])
})

</script>

<style lang="scss" scoped>
.gift-cert-page {
  --gift-page-bg: #e8ecf2;
  --gift-card: #ffffff;
  --gift-text: #1a1d24;
  --gift-muted: #6b7280;
  --gift-accent: #2563eb;
  --gift-accent-soft: #eff6ff;
  --gift-warm: #ea580c;
  min-height: 100vh;
  background: linear-gradient(180deg, var(--gift-page-bg) 0%, #f2f4f8 42%, #eef1f6 100%);
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
}

/* HeaderBar 右侧槽位默认未 flex，礼包会贴在标题侧；强制靠右与原先一致 */
.gift-cert-page :deep(header .right) {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 0;
}

.header-gift-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.header-gift { color: #f59e0b; filter: drop-shadow(0 1px 2px rgba(245, 158, 11, 0.25)); }
.gift-my-codes-popup-root {
  width: 86vw;
  max-width: 340px;
  background: transparent;
}
.my-codes-sheet {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.18);
}
.my-codes-head {
  position: relative;
  padding: 18px 44px 14px;
  text-align: center;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}
.my-codes-title {
  font-size: 17px;
  font-weight: 600;
  color: #dc2626;
  letter-spacing: 0.02em;
}
.my-codes-close {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #6b7280;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.my-codes-body {
  max-height: min(52vh, 360px);
  overflow-y: auto;
  padding: 12px 14px 16px;
}
.my-codes-loading {
  display: flex;
  justify-content: center;
  padding: 32px 0;
  color: var(--gift-accent);
}
.my-codes-empty {
  text-align: center;
  font-size: 14px;
  color: var(--gift-muted);
  padding: 28px 8px;
  margin: 0;
}
.my-codes-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.my-codes-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}
.my-codes-row:last-child {
  border-bottom: none;
}
.my-codes-cell {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.my-codes-status {
  align-self: flex-start;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 2px 8px;
  border-radius: 999px;
  line-height: 1.35;
}
.my-codes-status--unused {
  color: #047857;
  background: rgba(16, 185, 129, 0.14);
}
.my-codes-status--used {
  color: #6b7280;
  background: rgba(107, 114, 128, 0.12);
}
.my-codes-code {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  word-break: break-all;
  line-height: 1.4;
}
.my-codes-row--inactive .my-codes-code {
  color: #9ca3af;
  opacity: 0.85;
}
.my-codes-copy-btn {
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  border-color: #2563eb;
  color: #2563eb;
}
.my-codes-copy-btn--inactive {
  border-color: #d1d5db !important;
  color: #9ca3af !important;
  background: #f9fafb !important;
  opacity: 0.9;
}
:deep(.placeholder) { background: var(--gift-page-bg) !important; }
.body { padding: 14px 16px 0; max-width: var(--ex-max-width, 100%); margin: 0 auto; }
.empty-hint { text-align: center; font-size: 14px; color: var(--gift-muted); padding: 20px 12px; line-height: 1.5; }
.batch-pill {
  display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px 10px;
  padding: 12px 14px; margin-bottom: 12px; background: var(--gift-card); border-radius: 14px;
  border: 1px solid rgba(37, 99, 235, 0.08); box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
}
.batch-pill-label { font-size: 13px; font-weight: 500; color: var(--gift-muted); }
.batch-pill-name { font-size: 15px; font-weight: 600; color: var(--gift-text); letter-spacing: 0.02em; }
.card {
  background: var(--gift-card); border-radius: 16px; padding: 16px; margin-bottom: 14px;
  border: 1px solid rgba(15, 23, 42, 0.06); box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}
.code-card .code-row { display: flex; align-items: stretch; gap: 12px; }
.code-card :deep(.code-input) {
  flex: 1;
  padding: 6px 12px;
  background: var(--gift-accent-soft);
  border-radius: 12px;
  margin: 0;
  border: 1px solid rgba(37, 99, 235, 0.12);

  .van-field__control {
    font-size: 14px;
    color: var(--gift-text);
  }
}
.code-card .code-btns { display: flex; flex-direction: column; gap: 8px; justify-content: center; flex-shrink: 0; }
.code-card .code-btns .van-button { min-width: 76px; height: 38px; border-radius: 10px; font-size: 13px; font-weight: 600; }
.code-card .btn-action {
  background: linear-gradient(145deg, #3b82f6 0%, #2563eb 100%); border: none;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}
.code-card .btn-action--allocate { color: var(--gift-accent); border-color: rgba(37, 99, 235, 0.45); background: #fff; box-shadow: none; }
.code-card .progress-wrap { margin-top: 18px; }
.code-card .progress-label-row { margin-bottom: 10px; }
.code-card .progress-caption { font-size: 13px; line-height: 1.45; color: var(--gift-muted); }
.code-card .progress-track { height: 10px; border-radius: 999px; background: #e5e7eb; overflow: hidden; }
.code-card .progress-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd);
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.45);
}
.feed-card { padding-bottom: 14px; }
.feed-card .feed-heading { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.feed-card .feed-heading-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}
.feed-card .feed-heading-text { font-size: 15px; font-weight: 600; color: var(--gift-text); }
.feed-card .feed-window {
  height: 148px; overflow: hidden; border-radius: 12px;
  background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid rgba(234, 88, 12, 0.15); padding: 8px 12px;
}
.feed-card .feed-empty { padding: 32px 0; text-align: center; font-size: 13px; color: var(--gift-muted); }
.feed-card .feed-marquee {
  height: 100%; overflow: hidden;
  mask-image: linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent);
}
.feed-card .feed-track { animation: feed-scroll linear infinite; animation-duration: var(--feed-duration, 24s); }
.feed-card .feed-line {
  font-size: 13px; line-height: 1.55; padding: 8px 0; color: var(--gift-warm);
  border-bottom: 1px dashed rgba(234, 88, 12, 0.22);
}
.feed-card .feed-line:last-child { border-bottom: none; }
@keyframes feed-scroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
.rules-card { padding: 18px 16px 20px; border: 1px solid rgba(15, 23, 42, 0.05); box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04); }
.rule-block { margin-bottom: 20px; padding-left: 12px; border-left: 3px solid var(--gift-accent); margin-left: 2px; }
.rule-block--last { margin-bottom: 0; }
.rule-block h3 { font-size: 14px; font-weight: 600; color: var(--gift-text); margin: 0 0 10px 0; letter-spacing: 0.02em; }
.rule-block p { font-size: 13px; line-height: 1.7; color: var(--gift-muted); margin: 0; }
</style>
