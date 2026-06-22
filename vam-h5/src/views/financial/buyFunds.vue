<template>
  <div class="bf-page">
    <header class="bf-header">
      <button type="button" class="bf-header__back" aria-label="back" @click="onBack">
        <img :src="iconBack" alt="" class="bf-header__back-icon" />
      </button>
      <h1 class="bf-header__title">{{ t18('buy_funds') }}</h1>
    </header>

    <main class="bf-main">
      <div v-if="!isSuccess" class="bf-content">
        <section class="card card-overview">
          <h1 class="overview-title">{{ proDetail.title || '—' }}</h1>
          <div
            class="rate-banner"
            :style="{ backgroundImage: `url(${projectBg})` }"
          >
            <div class="rate-value fw-num">{{ proDetail.avgRate }}%</div>
          </div>
          <div class="overview-rows">
            <div class="detail-row">
              <span class="label">{{ t18('project_cycle') }}</span>
              <span class="value fw-num">{{ dayNum }}{{ t18('ldgpt_host_day') }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ t18('starting-amount') }}</span>
              <span class="value fw-num">{{ minNum }} {{ coninName }}</span>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-title fw-bold">{{ t18('buy_limit') }}</div>
          <div class="quota-input-wrap">
            <input
              v-model="limit"
              type="text"
              inputmode="decimal"
              :placeholder="t18('exchange.input')"
              class="quota-input"
            />
            <span v-if="coninName" class="quota-input__unit">{{ coninName }}</span>
          </div>
        </section>

        <section class="card">
          <div class="card-title fw-bold">{{ t18('product_details') }}</div>
          <div class="detail-row">
            <span class="label">{{ t18('product-details') }}</span>
            <span class="value">{{ proDetail.title }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ t18('project_progress') }}</span>
            <span class="value fw-num">{{ proDetail.process }}%</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ t18('total_project') }}</span>
            <span class="value fw-num">{{ proDetail.totalInvestAmount }}&nbsp;{{ proDetail.coin }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ t18('balance') }}</span>
            <span class="value fw-num">{{ proDetail.remainAmount }}&nbsp;{{ proDetail.coin }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ t18('limit_number') }}</span>
            <span class="value fw-num">
              {{
                Number(proDetail.timeLimit) ? Number(proDetail.timeLimit) : t18('unlimited_purchase')
              }}
            </span>
          </div>
          <div class="detail-row">
            <span class="label">{{ t18('average_daily_income') }}</span>
            <span class="value fw-num rate-highlight">{{ proDetail.avgRate }}%</span>
          </div>
        </section>
      </div>

      <div v-else class="bf-success">
        <span class="bf-success__icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2.5" opacity="0.4" />
            <path d="M18 33L28 43L46 23" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <div class="bf-success__text">{{ t18('payment_successful') }}</div>
        <button type="button" class="bf-success__home" @click="$router.push('/')">
          {{ t18('backhome') }}
        </button>
      </div>
    </main>

    <!-- 底部固定支付区 -->
    <div v-if="!isSuccess" class="bf-footer">
      <div class="bf-protocol">
        <span class="bf-protocol__check" :class="{ 'bf-protocol__check--on': isCheck }" @click="toSwitch" aria-hidden="true">
          <svg v-if="isCheck" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5L6.5 12L13 5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="bf-protocol__text">{{ t18('read_and_confirm') }}</span>
        <span class="bf-protocol__link" @click="$router.push('/financialAgreement')">
          {{ t18('financial agreement') }}
        </span>
      </div>
      <button type="button" class="bf-pay-btn" @click="payNow">{{ t18('to pay') }}</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

import { DIFF_ISFREEZE } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
import { useToast } from '@/hook/useToast'

import { financialDetail, financialSubmit } from '@/api/financial/index'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import projectBg from '@/assets/images/gxpex/financial/detail-hero.png'

const { t } = useI18n()
const t18 = (key) => t(key)

const { _isFreeze } = useFreeze()
const { _toast } = useToast()

const Route = useRoute()
const router = useRouter()

const limit = ref('')
const dayNum = ref('')
const coninName = ref('')
const proDetail = ref({
  title: '',
  process: '',
  totalInvestAmount: '',
  remainAmount: '',
  timeLimit: '',
  avgRate: '',
  coin: ''
})
const isCheck = ref(false)
const isSuccess = ref(false)
const backwardNum = ref(-1)
const minNum = ref(0)
const maxNum = ref(0)

const onBack = () => {
  router.go(backwardNum.value)
}

const payNowForm = () => {
  if (!isCheck.value) return _toast(t18('please_agree_financial'))

  if (Number(limit.value) < minNum.value)
    return _toast(t18('Can_buy_down_to') + ` ${minNum.value} ${coninName.value}`)

  if (Number(limit.value) > maxNum.value)
    return _toast(t18('Can_buy_up_to') + ` ${maxNum.value} ${coninName.value}`)

  const regNum = /^\d+(\.\d{1,4})?$/
  if (!regNum.test(limit.value)) return _toast(t18('entet4_point'))

  submit()
}

const payNow = () => {
  if (DIFF_ISFREEZE.includes(__config._APP_ENV)) {
    if (_isFreeze(DIFF_ISFREEZE)) payNowForm()
  } else {
    payNowForm()
  }
}

const submit = async () => {
  const res = await financialSubmit(Route.params.id, limit.value, dayNum.value)
  if (res.code === 200) {
    isSuccess.value = true
    backwardNum.value = -2
  } else {
    showToast(res.msg)
  }
}

const toSwitch = () => {
  isCheck.value = !isCheck.value
}

const getDetail = async () => {
  try {
    const res = await financialDetail(Route.params.id)
    if (res.code === 200) {
      const { title, avgRate, days, limitMin, limitMax, coin } = res.data
      minNum.value = limitMin
      maxNum.value = limitMax
      coninName.value = coin ? coin.toUpperCase() : ''
      dayNum.value = days

      const { process, totalInvestAmount, remainAmount, timeLimit } = res.data
      proDetail.value = {
        title,
        process,
        totalInvestAmount,
        remainAmount,
        timeLimit,
        avgRate,
        coin: coin ? coin.toUpperCase() : ''
      }
    }
  } catch (e) {
    void e
  }
}

onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
.bf-page {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(140px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏 */
.bf-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.bf-header__back {
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

.bf-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.bf-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.bf-main {
  padding: 12px 0 0;
}

/* 暗紫卡 */
.card {
  background: #1a1626;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin: 0 14px 12px;
  padding: 16px;
  box-shadow: none;
  box-sizing: border-box;
}

.card-overview {
  padding-top: 18px;
}

.overview-title {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  line-height: 1.35;
  word-break: break-word;
}

/* hero 利率横幅 */
.rate-banner {
  min-height: 120px;
  margin-bottom: 14px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: rgba(160, 65, 237, 0.12);
  border: 1px solid rgba(160, 65, 237, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.rate-value {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  text-shadow: 0 4px 18px rgba(160, 65, 237, 0.55);
  letter-spacing: 0.5px;
}

.overview-rows .detail-row {
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}

.card-title {
  font-size: 15px;
  color: #fff;
  font-weight: 600;
  margin-bottom: 12px;
}

/* 金额输入 */
.quota-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  padding: 0 16px;
  border: 1px solid rgba(160, 65, 237, 0.45);
  border-radius: 25px;
  background: rgb(34, 34, 34);
  box-shadow: 0 0 0 1px rgba(160, 65, 237, 0.12), 0 0 14px rgba(160, 65, 237, 0.18);
  box-sizing: border-box;
}

.quota-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #fff;
  font-variant-numeric: tabular-nums;

  &::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
}

.quota-input__unit {
  margin-left: 10px;
  font-size: 13px;
  font-weight: 500;
  color: rgb(196, 124, 255);
  letter-spacing: 0.2px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  color: rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
}

.value {
  color: #fff;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
  font-variant-numeric: tabular-nums;
}

.rate-highlight {
  color: rgb(196, 124, 255);
  font-weight: 600;
}

/* 底部固定支付区 */
.bf-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0));
  background: linear-gradient(180deg, rgba(10, 6, 16, 0) 0%, rgba(10, 6, 16, 0.95) 30%, #0a0610 100%);
  max-width: var(--ex-max-width, 100%);
  margin: 0 auto;
  box-sizing: border-box;
}

.bf-protocol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
  padding: 0 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  text-align: center;
  line-height: 1.45;
}

.bf-protocol__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
  flex-shrink: 0;

  svg {
    width: 12px;
    height: 12px;
    display: block;
  }

  &--on {
    background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
    border-color: transparent;
  }
}

.bf-protocol__text {
  color: rgba(255, 255, 255, 0.65);
}

.bf-protocol__link {
  color: rgb(196, 124, 255);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.bf-pay-btn {
  display: block;
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35);
  text-align: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  &:active {
    opacity: 0.92;
  }
}

/* Success 成功态 */
.bf-success {
  padding: 80px 24px 40px;
  text-align: center;
}

.bf-success__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 110px;
  margin: 0 auto 24px;
  color: rgb(196, 124, 255);
  filter: drop-shadow(0 8px 24px rgba(160, 65, 237, 0.45));

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.bf-success__text {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 28px;
}

.bf-success__home {
  padding: 12px 36px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: transparent;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>
