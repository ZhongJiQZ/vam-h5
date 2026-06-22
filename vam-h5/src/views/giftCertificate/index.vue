<!-- 充值领金 · 体验券活动 (GXPEX 暗紫主题) -->
<template>
  <div class="gift-cert-page">
    <div class="bg-glow bg-glow--1"></div>
    <div class="bg-glow bg-glow--2"></div>

    <header class="gc-header">
      <button type="button" class="gc-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="gc-header__back-icon" />
      </button>
      <h1 class="gc-header__title">{{ t('gift_cert_title') }}</h1>
      <button
        type="button"
        class="gc-header__action"
        aria-label="service"
        @click.stop="goService"
      >
        <img :src="iconService" alt="" class="gc-header__action-icon" />
      </button>
    </header>

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

      <!-- Hero: 整张 icon-gift-hero 图占满整行作 banner；标题文字垂直居中叠在图左侧 -->
      <div class="hero-banner">
        <img :src="iconGiftHero" alt="" class="hero-banner__img" />
        <div class="hero-text">
          <span class="hero-label">{{ t('gift_cert_current_activity') }}</span>
          <h2 class="hero-name">{{ t('gift_cert_voucher_name_fallback') }}</h2>
        </div>
      </div>

      <!-- Claim 输入 + 进度 -->
      <div class="claim-card">
        <div class="claim-row">
          <van-field
            v-model="voucherCode"
            class="claim-input"
            :border="false"
            :placeholder="t('gift_cert_placeholder_code')"
            clearable
          />
          <van-button
            type="primary"
            size="small"
            class="claim-btn"
            :loading="actionLoading"
            :disabled="actionDisabled"
            @click="onAction"
          >
            {{ actionBtnText }}
          </van-button>
        </div>
        <div class="progress-wrap">
          <span class="progress-caption">{{ t('gift_cert_progress_recharged', progressTextParams) }}</span>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
          </div>
        </div>
      </div>

      <!-- Latest Records -->
      <h3 class="section-title">{{ t('gift_cert_section_live') }}</h3>
      <div class="feed-card">
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

      <!-- Rules -->
      <section class="rule-block">
        <h3 class="rule-title">{{ t('gift_cert_rule_participate_title') }}</h3>
        <p class="rule-body">{{ t('gift_cert_rule_participate_body', { hint: conditionHint }) }}</p>
      </section>
      <section class="rule-block">
        <h3 class="rule-title">{{ t('gift_cert_rule_guide_title') }}</h3>
        <p class="rule-body">{{ t('gift_cert_rule_guide_body') }}</p>
      </section>
      <section class="rule-block">
        <h3 class="rule-title">{{ t('gift_cert_rule_trial_title') }}</h3>
        <p class="rule-body">{{ t('gift_cert_rule_trial_body') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user/index'
import { useCopy } from '@/hook/useCopy'
import { _back } from '@/utils/public'
import { dispatchCustomEvent } from '@/utils'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'
import iconGiftHero from '@/assets/images/gxpex/gift/icon-gift-hero.png'

const goService = () => dispatchCustomEvent('event_serviceChange')
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
  position: relative;
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  overflow-x: hidden;
  font-family: 'Inter', 'PingFang SC', sans-serif;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #a642ec 0%, #802bda 60%, transparent 100%);
  filter: blur(60px);
  opacity: 0.18;
  pointer-events: none;
  z-index: 0;

  &--1 {
    top: -60px;
    right: -50px;
    width: 240px;
    height: 240px;
  }
  &--2 {
    top: 300px;
    left: -100px;
    width: 220px;
    height: 220px;
  }
}

/* Header */
.gc-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.gc-header__back {
  position: absolute;
  left: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.gc-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.gc-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.gc-header__action {
  position: absolute;
  right: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.gc-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
}

/* Body */
.body {
  position: relative;
  z-index: 1;
  padding: 12px 14px 0;
  max-width: var(--ex-max-width, 100%);
  margin: 0 auto;
}

.empty-hint {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  padding: 20px 12px;
  line-height: 1.5;
}

/* Hero card */
/* Hero banner — 图片占满整行，从 body padding 里 bleed 出去到屏幕两边 */
.hero-banner {
  position: relative;
  margin: 0 -14px 18px;
}

.hero-banner__img {
  display: block;
  width: 100%;
  height: auto;
  position: relative;
  z-index: 0;
}

.hero-text {
  position: absolute;
  top: 50%;
  left: 26px;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 55%;
  pointer-events: none;
}

.hero-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.04em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.hero-name {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.15;
  white-space: pre-line;
  word-break: break-word;
  color: #fff;
  background: linear-gradient(135deg, #fff 0%, #fff 35%, rgb(196, 124, 255) 70%, rgb(160, 65, 237) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}


/* Claim 卡 — 一个卡片里包邀请码 + 进度，叠在 hero 图底部，紫色荧光描边在卡上 */
.claim-card {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 14px 18px;
  margin-top: -30px;
  margin-bottom: 22px;
  border-radius: 16px;
  background: rgba(30, 21, 48, 0.92);
  border: 1px solid rgba(160, 65, 237, 0.45);
  /* 卡片整体的紫色淡淡荧光描边 */
  box-shadow:
    0 0 0 1px rgba(160, 65, 237, 0.15),
    0 0 24px rgba(160, 65, 237, 0.28),
    0 8px 24px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
}

.claim-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 6px 6px 6px 16px;
  border-radius: 999px;
  background: rgb(34, 34, 34);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.claim-card :deep(.claim-input) {
  flex: 1;
  padding: 0;
  background: transparent;
  margin: 0;
  border: none;

  .van-cell {
    background: transparent;
    padding: 0;
  }

  .van-field__body {
    background: transparent;
  }

  .van-field__control {
    font-size: 14px;
    color: #fff;

    &::placeholder {
      color: rgba(255, 255, 255, 0.45);
    }
  }
}

.claim-card :deep(.claim-btn) {
  flex-shrink: 0;
  min-width: 80px;
  height: 36px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35);
  font-size: 14px;
  font-weight: 500;
  color: #fff;

  &.van-button--disabled {
    opacity: 0.55;
  }

  .van-button__text {
    color: #fff;
  }
}

.progress-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 6px;
}

.progress-caption {
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.65);
}

.progress-track {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgb(127, 43, 218) 0%, rgb(196, 124, 255) 100%);
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(160, 65, 237, 0.55);
}

/* Section title */
.section-title {
  margin: 0 0 12px;
  padding: 0 2px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

/* Latest Records feed */
.feed-card {
  margin-bottom: 22px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(30, 21, 48, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.feed-window {
  height: 132px;
  overflow: hidden;
  mask-image: linear-gradient(180deg, transparent 0, #000 14%, #000 86%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 14%, #000 86%, transparent 100%);
}

.feed-marquee {
  height: 100%;
  overflow: hidden;
}

.feed-track {
  animation: feed-scroll linear infinite;
  animation-duration: var(--feed-duration, 24s);
}

.feed-line {
  margin: 0;
  padding: 6px 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.75);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-line:last-child {
  border-bottom: none;
}

.feed-empty {
  padding: 28px 0;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
}

@keyframes feed-scroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

/* Rules sections */
.rule-block {
  margin-bottom: 20px;
}

.rule-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.01em;
}

.rule-body {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.6);
}

/* My Codes popup — 适配暗紫主题 */
.gift-my-codes-popup-root {
  width: 86vw;
  max-width: 340px;
  background: transparent;
}

.my-codes-sheet {
  background: rgba(30, 21, 48, 0.96);
  border: 1px solid rgba(160, 65, 237, 0.25);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.55);
}

.my-codes-head {
  position: relative;
  padding: 18px 44px 14px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.my-codes-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
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
  color: rgba(255, 255, 255, 0.7);
  padding: 0;
  cursor: pointer;
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
  color: rgb(160, 65, 237);
}

.my-codes-empty {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
  color: #5fd5a4;
  background: rgba(95, 213, 164, 0.15);
}

.my-codes-status--used {
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.my-codes-code {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  word-break: break-all;
  line-height: 1.4;
}

.my-codes-row--inactive .my-codes-code {
  color: rgba(255, 255, 255, 0.4);
  opacity: 0.85;
}

.my-codes-copy-btn {
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid rgba(160, 65, 237, 0.55);
  background: transparent;
  color: rgb(196, 124, 255);
}

.my-codes-copy-btn--inactive {
  border-color: rgba(255, 255, 255, 0.15) !important;
  color: rgba(255, 255, 255, 0.4) !important;
  background: transparent !important;
  opacity: 0.85;
}
</style>
