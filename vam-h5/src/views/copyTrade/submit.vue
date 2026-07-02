<!-- 加入策略 / 发起跟单 -->
<script setup>
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import InstitutionSubscribeDialog from './components/InstitutionSubscribeDialog.vue'
import CopyTradeDocumentDrawer from './components/CopyTradeDocumentDrawer.vue'
import { DIFF_ISFREEZE } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
import { _t18, _getConfig } from '@/utils/public'
import {
  submitCopyTrade,
  getCopyTradeStrategyDetail,
  getCopyTradeDocuments,
  getCopyTradeInstitutionDetail,
  subscribeCopyTradeInstitution
} from '@/api/copyTrade'
import { isInstitutionSubscribed, patchInstitutionSubscribed, isInstitutionSecretLocked, isSecretKeyLockMessage, setInstitutionSecretLock, normalizeStrategyDetail, resolveStrategyAmountRange, parseAmountRangeText, parseCopyTradeStrategyQuery, getStrategyJoinBlockMessage, formatCopyTradeDisplayDate, formatCopyTradeAmountRangeTip, formatCopyTradeAmountPlaceholder, validateCopyTradeSubmitAmount, getCopyTradeAmountValidationMessage, resolveCopyTradeFillAmount, normalizeCopyTradeAmount, formatCopyTradeBalance, COPY_TRADE_SUBMIT_CODE, isCopyTradeSubmitJoinClosedCode, isCopyTradeSubmitJoinNotOpenCode, parseCopyTradeSubmitResponse, shouldLeaveSubmitPageOnJoinBlock, isStrategyFollowing } from './utils'
import { getCopyTradeAgreementDoc, getCopyTradeRiskDoc, resolveCopyTradeDoc } from './documents'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { computed, reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getResponseErrorMsg } from '@/utils/request'

const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)

const { _isFreeze } = useFreeze()
const route = useRoute()
const router = useRouter()
function initStrategyFromRoute() {
  const fromQuery = parseCopyTradeStrategyQuery(route.query.data)
  const strategyId = route.query.strategyId || fromQuery?.id
  if (fromQuery) return normalizeStrategyDetail({ ...fromQuery, id: fromQuery.id || strategyId })
  if (strategyId) return { id: strategyId }
  return {}
}

const strategy = reactive(initStrategyFromRoute())

const userStore = useUserStore()
const { asset } = storeToRefs(userStore)
const institution = ref({})
const amount = ref('')
const secretKey = ref('')
const agreed = ref(false)
const pageLoading = ref(!!route.query.strategyId)
const agreementDoc = ref(null)
const riskDoc = ref(null)
const showSubscribe = ref(false)
const subscribeLoading = ref(false)
const showDocDrawer = ref(false)
const activeDoc = ref(null)
const submitLoading = ref(false)

const isSubscribed = computed(() => isInstitutionSubscribed(institution.value) || isInstitutionSubscribed(strategy))

const displayName = computed(
  () =>
    institution.value.institutionName ||
    strategy.institutionName ||
    strategy.strategyName ||
    '--'
)

const displayLogo = computed(
  () => institution.value.logo || strategy.icon || strategy.logo || ''
)

const joinDateText = computed(
  () => institution.value.joinDate || institution.value.joinTime || strategy.joinDate || strategy.joinTime || '--'
)

const providerTag = computed(
  () => institution.value.signalProviderText || strategy.signalProviderText || t18('copy_trade_signal_provider')
)

const subscribeTag = computed(() => {
  const fromApi = institution.value.subscribeText || strategy.subscribeText
  if (fromApi) return fromApi
  return isSubscribed.value ? t18('copy_trade_inst_subscribed') : t18('copy_trade_inst_subscribe')
})

/** 合约可用余额：仅用资产接口原始值，策略详情里的 contractBalance 可能已四舍五入 */
const contractBalance = computed(() => {
  const cur = asset.value?.filter((item) => item.type === 3) || []
  return cur[0]?.availableAmount ?? 0
})

const feeRows = computed(() => {
  const tradeFee = institution.value.tradeFeeRate ?? strategy.tradeFeeRate
  const semiShare = institution.value.normalShareRate ?? strategy.normalShareRate
  const fullShare = institution.value.forceShareRate ?? strategy.forceShareRate
  return [
    {
      label: t18('copy_trade_trade_fee'),
      value: tradeFee != null && tradeFee !== '' ? `${tradeFee}%` : '--'
    },
    {
      label: t18('copy_trade_inst_semi_share'),
      value: semiShare != null && semiShare !== '' ? `${semiShare}%` : '--'
    },
    {
      label: t18('copy_trade_inst_full_share'),
      value: fullShare != null && fullShare !== '' ? `${fullShare}%` : '--'
    },
    {
      label: t18('copy_trade_profit_share_method'),
      value: t18('copy_trade_profit_share_rate_desc')
    },
    {
      label: t18('copy_trade_loss_share'),
      value: t18('copy_trade_loss_share_no')
    }
  ]
})

const amountLimits = computed(() => {
  const limits = resolveStrategyAmountRange(strategy, institution.value, { strategyOnly: true })
  if (limits.minAmount != null && limits.maxAmount != null) return limits
  const parsed = parseAmountRangeText(strategy.amountRangeText)
  return {
    minAmount: limits.minAmount ?? parsed.minAmount ?? null,
    maxAmount: limits.maxAmount ?? parsed.maxAmount ?? null
  }
})

const amountRangeTip = computed(() =>
  formatCopyTradeAmountRangeTip(amountLimits.value.minAmount, amountLimits.value.maxAmount, t18, i18n)
)

const amountPlaceholder = computed(() =>
  formatCopyTradeAmountPlaceholder(amountLimits.value.minAmount, amountLimits.value.maxAmount, t18, i18n)
)

const amountFieldError = computed(() => {
  if (!amount.value) return ''
  const check = validateCopyTradeSubmitAmount(
    amount.value,
    amountLimits.value,
    contractBalance.value
  )
  return check.ok ? '' : getCopyTradeAmountValidationMessage(check, t18, i18n)
})

const canSubmit = computed(
  () => agreed.value && !pageLoading.value && !submitLoading.value && !amountFieldError.value
)

function applyAmountLimits(extra = {}) {
  const limits = resolveStrategyAmountRange({ ...strategy, ...extra }, {}, { strategyOnly: true })
  if (limits.minAmount != null) strategy.minAmount = limits.minAmount
  if (limits.maxAmount != null) strategy.maxAmount = limits.maxAmount
}

function setMax() {
  amount.value = resolveCopyTradeFillAmount(contractBalance.value, amountLimits.value)
}

async function loadStrategyDetail(options = {}) {
  const silent = options.silent === true
  const strategyId = route.query.strategyId || strategy.id
  if (!strategyId) return
  if (!silent) pageLoading.value = true
  try {
    const res = await getCopyTradeStrategyDetail({ strategyId })
    if (res?.code == 200 && res.data) {
      Object.assign(strategy, normalizeStrategyDetail(res.data), { id: res.data.id || strategyId })
      if (!silent) {
        handleJoinBlockedIfNeeded()
      }
    }
    const institutionId = route.query.institutionId || strategy.institutionId
    if (institutionId) {
      const [instRes, agreementRes, riskRes] = await Promise.all([
        getCopyTradeInstitutionDetail({ institutionId }),
        getCopyTradeDocuments({ type: 'agreement', institutionId }),
        getCopyTradeDocuments({ type: 'risk', institutionId })
      ])
      if (instRes?.code == 200 && instRes.data) institution.value = instRes.data
      agreementDoc.value = resolveCopyTradeDoc(
        agreementRes?.code == 200 ? agreementRes.data : null,
        getCopyTradeAgreementDoc(t18)
      )
      riskDoc.value = resolveCopyTradeDoc(
        riskRes?.code == 200 ? riskRes.data : null,
        getCopyTradeRiskDoc(t18)
      )
    } else {
      agreementDoc.value = getCopyTradeAgreementDoc(t18)
      riskDoc.value = getCopyTradeRiskDoc(t18)
    }
    applyAmountLimits()
  } finally {
    if (!silent) pageLoading.value = false
  }
}

async function refreshStrategyAndOrders() {
  await Promise.all([loadStrategyDetail({ silent: true }), userStore.getUserInfo()])
}

function leaveSubmitPage(item = strategy) {
  if (isStrategyFollowing(item)) {
    router.replace('/copy-trade/my')
    return
  }
  if (window.history.length > 1) {
    router.back()
    return
  }
  const institutionId = route.query.institutionId || strategy.institutionId || institution.value.id
  if (institutionId) {
    router.replace({ path: '/copy-trade/strategies', query: { institutionId } })
    return
  }
  router.replace({ path: '/copy-trade' })
}

function handleJoinBlockedIfNeeded(item = strategy) {
  if (item?.canJoin !== false) return
  showToast(getStrategyJoinBlockMessage(item, t18))
  if (shouldLeaveSubmitPageOnJoinBlock(item)) {
    leaveSubmitPage(item)
  }
}

async function handleSubmitJoinClosed(msg) {
  showToast(msg || t18('copy_trade_unjoinable'))
  try {
    await refreshStrategyAndOrders()
  } catch (_) {
    /* 刷新失败仍应离开加入页 */
  }
  leaveSubmitPage()
}

function showDocument(doc) {
  if (!doc?.content) return
  activeDoc.value = doc
  showDocDrawer.value = true
}

function onSubscribeTagClick() {
  const institutionId = route.query.institutionId || strategy.institutionId || institution.value.id
  if (!institutionId) return
  if (isSubscribed.value) {
    router.push({ path: '/copy-trade/institution', query: { institutionId } })
    return
  }
  if (isInstitutionSecretLocked(institutionId)) {
    showToast(t18('copy_trade_inst_locked'))
    return
  }
  showSubscribe.value = true
}

function handleSubscribeFail(msg, institutionId) {
  const text = String(msg || '').trim() || t18('error')
  showToast(text)
  if (isSecretKeyLockMessage(text)) setInstitutionSecretLock(institutionId)
}

async function onSubscribeConfirm({ institutionId, secretKey: key }) {
  if (!institutionId || !key) return
  subscribeLoading.value = true
  try {
    const res = await subscribeCopyTradeInstitution({ institutionId, secretKey: key })
    if (res?.code == 200) {
      showToast(res.msg || t18('copy_trade_inst_sub_ok'))
      institution.value = patchInstitutionSubscribed([institution.value], institutionId, res.data || {})[0] || {
        ...institution.value,
        subscribed: true,
        isSubscribed: true
      }
      Object.assign(strategy, { subscribed: true, isSubscribed: true })
      showSubscribe.value = false
    } else {
      handleSubscribeFail(res?.msg, institutionId)
    }
  } catch (e) {
    handleSubscribeFail(getResponseErrorMsg(e, ''), institutionId)
  } finally {
    subscribeLoading.value = false
  }
}

onMounted(() => {
  agreementDoc.value = getCopyTradeAgreementDoc(t18)
  riskDoc.value = getCopyTradeRiskDoc(t18)
  userStore.getUserInfo()
  applyAmountLimits()
  if (route.query.strategyId || strategy.id) loadStrategyDetail()
})

async function submitForm() {
  if (!agreed.value) return
  if (strategy?.canJoin === false) {
    handleJoinBlockedIfNeeded(strategy)
    return
  }
  const amountCheck = validateCopyTradeSubmitAmount(
    amount.value,
    amountLimits.value,
    contractBalance.value
  )
  if (!amountCheck.ok) {
    showToast(getCopyTradeAmountValidationMessage(amountCheck, t18, i18n))
    return
  }
  const val = normalizeCopyTradeAmount(amount.value)
  if (!val) {
    showToast(getCopyTradeAmountValidationMessage({ ok: false, key: 'copy_trade_amount_required' }, t18, i18n))
    return
  }
  const inviteCode = String(secretKey.value || '').trim()
  if (!inviteCode) {
    showToast(t18('copy_trade_submit_invite_required'))
    return
  }
  const payload = { strategyId: strategy.id, amount: val, secretKey: inviteCode }
  submitLoading.value = true
  try {
    const res = await submitCopyTrade(payload)
    const code = Number(res?.code)
    const msg = String(res?.msg || '').trim()

    if (code === COPY_TRADE_SUBMIT_CODE.SUCCESS) {
      showToast(msg || t18('copy_trade_submit_success'))
      setTimeout(() => router.replace('/copy-trade/my'), 500)
      return
    }

    if (isCopyTradeSubmitJoinClosedCode(code)) {
      await handleSubmitJoinClosed(msg)
      return
    }

    if (isCopyTradeSubmitJoinNotOpenCode(code)) {
      showToast(msg || getStrategyJoinBlockMessage(strategy, t18))
      await refreshStrategyAndOrders()
      return
    }

    showToast(msg || t18('error'))
  } catch (e) {
    const { code, msg } = parseCopyTradeSubmitResponse(e)
    if (isCopyTradeSubmitJoinClosedCode(code)) {
      await handleSubmitJoinClosed(msg)
      return
    }
    if (isCopyTradeSubmitJoinNotOpenCode(code)) {
      showToast(msg || getStrategyJoinBlockMessage(strategy, t18))
      await refreshStrategyAndOrders()
      return
    }
    showToast(getResponseErrorMsg(e))
  } finally {
    submitLoading.value = false
  }
}

function submit() {
  if (DIFF_ISFREEZE.includes(_getConfig('_APP_ENV'))) {
    if (_isFreeze(DIFF_ISFREEZE)) submitForm()
  } else {
    submitForm()
  }
}
</script>

<template>
  <div class="copy-submit-page">
    <DarkHeaderBar :title="t18('copy_trade_join_strategy_page')" :border_bottom="true" />
    <van-loading v-if="pageLoading" class="page-loading" />
    <div v-else class="sheet">
      <!-- 机构/策略信息 -->
      <section class="card profile-card">
        <div class="profile-card__head">
          <img v-if="displayLogo" :src="displayLogo" class="profile-card__avatar" alt="" />
          <div v-else class="profile-card__avatar profile-card__avatar--ph" />
          <div class="profile-card__meta">
            <h2 class="profile-card__name">{{ displayName }}</h2>
            <div class="profile-card__tags">
              <span class="tag tag--provider">{{ providerTag }}</span>
              <button
                type="button"
                class="tag tag--subscribe"
                :class="isSubscribed ? 'tag--on' : 'tag--off'"
                @click="onSubscribeTagClick"
              >
                {{ subscribeTag }}
              </button>
            </div>
            <p class="profile-card__join">
              {{ t18('copy_trade_join_date_label') }} {{ formatCopyTradeDisplayDate(joinDateText) }}
            </p>
          </div>
        </div>
      </section>

      <!-- 合约账户余额 -->
      <section class="card balance-card">
        <p class="balance-card__label">{{ t18('copy_trade_contract_balance_label') }}</p>
        <p class="balance-card__value ff-num">
          {{ formatCopyTradeBalance(contractBalance) }}
          <span class="balance-card__unit">USDT</span>
        </p>
      </section>

      <!-- 跟单金额 -->
      <section class="card amount-card">
        <p class="amount-card__label">{{ t18('copy_trade_amount') }}</p>
        <div class="amount-card__input-row" :class="{ 'amount-card__input-row--error': amountFieldError }">
          <!-- :placeholder="amountPlaceholder" -->
          <input
            v-model="amount"
            type="number"
            class="amount-card__input ff-num"
            :min="amountLimits.minAmount ?? undefined"
            :max="amountLimits.maxAmount ?? undefined"
            step="any"
            inputmode="decimal"
          />
          <span class="amount-card__unit">USDT</span>
          <button type="button" class="amount-card__all" @click="setMax">
            {{ t18('copy_trade_amount_all') }}
          </button>
        </div>
        <p class="amount-card__hint" :class="{ 'amount-card__hint--error': amountFieldError }">
          {{ amountFieldError || amountRangeTip }}
        </p>
      </section>

      <!-- 邀请码 -->
      <section class="card secret-card">
        <p class="secret-card__label">{{ t18('copy_trade_submit_invite_code') }}</p>
        <input
          v-model="secretKey"
          type="text"
          class="secret-card__input ff-num"
          :placeholder="t18('copy_trade_submit_invite_placeholder')"
        />
      </section>

      <!-- 费用说明 -->
      <section class="card fee-card">
        <h3 class="fee-card__title">{{ t18('copy_trade_fee_desc_title') }}</h3>
        <div class="fee-table">
          <div v-for="(row, idx) in feeRows" :key="idx" class="fee-table__row">
            <span class="fee-table__label">{{ row.label }}</span>
            <span class="fee-table__value">{{ row.value }}</span>
          </div>
        </div>
      </section>

      <!-- 协议勾选 -->
      <van-checkbox v-model="agreed" class="agreement-row" icon-size="18px">
        <span class="agreement-row__text">
          {{ t18('copy_trade_agreement_prefix') }}
          <button
            v-if="agreementDoc"
            type="button"
            class="agreement-row__link"
            @click.stop.prevent="showDocument(agreementDoc)"
          >
            {{ t18('copy_trade_agreement_user') }}
          </button>
          <template v-else>{{ t18('copy_trade_agreement_user') }}</template>
          {{ t18('copy_trade_agreement_and') }}
          <button
            v-if="riskDoc"
            type="button"
            class="agreement-row__link"
            @click.stop.prevent="showDocument(riskDoc)"
          >
            《{{ t18('copy_trade_risk') }}》
          </button>
          <template v-else>《{{ t18('copy_trade_risk') }}》</template>
        </span>
      </van-checkbox>
    </div>

    <div v-if="!pageLoading" class="bottom-bar">
      <button type="button" class="submit-btn" :disabled="!canSubmit" @click="submit">
        {{ submitLoading ? t18('loading') : t18('copy_trade_confirm_join') }}
      </button>
    </div>

    <InstitutionSubscribeDialog
      v-model:show="showSubscribe"
      :item="{ ...institution, institutionName: displayName, logo: displayLogo }"
      :loading="subscribeLoading"
      @confirm="onSubscribeConfirm"
    />

    <CopyTradeDocumentDrawer v-model:show="showDocDrawer" :doc="activeDoc || {}" />
  </div>
</template>

<style lang="scss" scoped>
$green: #17ac74;

.copy-submit-page {
  min-height: 100vh;
  background: #f6f7fa;
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
}

.sheet {
  padding: 12px 15px 16px;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.profile-card {
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

  &__meta {
    flex: 1;
    min-width: 0;
  }

  &__name {
    margin: 0 0 8px;
    font-size: 17px;
    font-weight: 700;
    color: #111;
  }

  &__tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    margin-bottom: 6px;
  }

  &__join {
    margin: 0;
    font-size: 12px;
    color: #6b7280;
  }
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  border: none;
  line-height: 1.4;

  &--provider {
    background: #fee2e2;
    color: #dc2626;
  }

  &--subscribe {
    margin-left: auto;
    cursor: pointer;
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

.balance-card {
  &__label {
    margin: 0 0 8px;
    font-size: 14px;
    color: #374151;
  }

  &__value {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #111;
    line-height: 1.2;
  }

  &__unit {
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
    margin-left: 4px;
  }
}

.amount-card {
  &__label {
    margin: 0 0 12px;
    font-size: 14px;
    color: #374151;
  }

  &__input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
    background: #fafafa;

    &--error {
      border-color: #ef4444;
      background: #fef2f2;
    }
  }

  &__input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    font-size: 22px;
    outline: none;
    color: #111;
  }

  &__unit {
    font-size: 14px;
    color: #6b7280;
    flex-shrink: 0;
  }

  &__all {
    border: 1px solid $green;
    background: #fff;
    color: $green;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    flex-shrink: 0;
    cursor: pointer;
  }

  &__hint {
    margin: 10px 0 0;
    font-size: 12px;
    color: #9ca3af;

    &--error {
      color: #e8503a;
    }
  }
}

.secret-card {
  &__label {
    margin: 0 0 10px;
    font-size: 14px;
    color: #374151;
  }

  &__input {
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 16px;
    outline: none;
    box-sizing: border-box;
  }
}

.fee-card {
  &__title {
    margin: 0 0 12px;
    font-size: 15px;
    font-weight: 700;
    color: #111;
  }
}

.fee-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    font-size: 13px;
    border-bottom: 1px solid #e5e7eb;

    &:last-child {
      border-bottom: none;
    }
  }

  &__label {
    color: #6b7280;
    flex-shrink: 0;
  }

  &__value {
    color: #111;
    text-align: right;
    word-break: break-word;
  }
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  padding: 4px 2px 8px;

  :deep(.van-checkbox) {
    align-items: flex-start;
    width: 100%;
  }

  :deep(.van-checkbox__icon) {
    margin-top: 2px;
    flex-shrink: 0;
    --van-checkbox-size: 18px;
    --van-checkbox-checked-icon-color: #{$green};
    --van-checkbox-border-color: #d1d5db;
  }

  :deep(.van-checkbox__label) {
    margin-left: 8px;
    line-height: 1.55;
  }

  &__text {
    font-size: 13px;
    color: #4b5563;
    line-height: 1.55;
  }

  &__link {
    border: none;
    background: none;
    padding: 0;
    color: #2563eb;
    font-size: 13px;
    cursor: pointer;
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 15px calc(10px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #eee;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: $green;
  color: #fff;
  font-size: 16px;
  font-weight: 600;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.page-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>
