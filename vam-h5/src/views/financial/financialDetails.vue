<template>
  <div class="fd-page">
    <header class="fd-header">
      <button type="button" class="fd-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="fd-header__back-icon" />
      </button>
      <h1 class="fd-header__title">{{ _t18('financial', ['paxpay']) }}</h1>
    </header>

    <main class="fd-main">
      <!-- 项目概览 -->
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
            <span class="label">{{ _t18('project_cycle') }}</span>
            <span class="value fw-num">{{ proDetail.days }}{{ _t18('ldgpt_host_day') }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ _t18('starting-amount') }}</span>
            <span class="value fw-num">
              {{ proDetail.limitMin }} {{ proDetail.coin }}
            </span>
          </div>
        </div>
      </section>

      <!-- 基金介绍 -->
      <section class="card">
        <div class="card-title fw-bold">{{ _t18(`Fund_introduction`) }}</div>
        <div class="card-text">
          {{ fundIntroduction ? fundIntroduction : _t18(`No_introductionyet`) }}
        </div>
      </section>

      <!-- 产品详情 -->
      <section class="card">
        <div class="card-title fw-bold">{{ _t18(`product_details`) }}</div>
        <div class="detail-row">
          <span class="label">{{ _t18(`product-details`) }}</span>
          <span class="value">{{ proDetail.title }}</span>
        </div>
        <div class="detail-row">
          <span class="label">{{ _t18(`project_progress`) }}</span>
          <span class="value fw-num">{{ proDetail.process }}%</span>
        </div>
        <div class="detail-row">
          <span class="label">{{ _t18(`total_project`) }}</span>
          <span class="value fw-num">{{ proDetail.totalInvestAmount }}&nbsp;{{ proDetail.coin }}</span>
        </div>
        <div class="detail-row">
          <span class="label">{{ _t18(`balance`) }}</span>
          <span class="value fw-num">{{ proDetail.remainAmount }}&nbsp;{{ proDetail.coin }}</span>
        </div>
        <div class="detail-row">
          <span class="label">{{ _t18(`limit_number`) }}</span>
          <span class="value fw-num">
            {{
              Number(proDetail.timeLimit) ? Number(proDetail.timeLimit) : _t18(`unlimited_purchase`)
            }}
          </span>
        </div>
        <div class="detail-row">
          <span class="label">{{ _t18(`average_daily_income`) }}</span>
          <span class="value fw-num rate-highlight">{{ proDetail.avgRate }}%</span>
        </div>
      </section>

      <!-- 产品规则 -->
      <section class="card card-rules">
        <div class="card-title fw-bold">{{ _t18('product_rules') }}</div>
        <div class="card-text">
          {{ proRules ? proRules : _t18(`No_introductionyet`) }}
        </div>
      </section>

      <div class="buy-footer">
        <button type="button" class="buy-btn" @click="buyNow">
          {{ _t18(`buy_it_now`) }}
        </button>
      </div>
    </main>
  </div>
</template>
<script setup>
import { DIFF_ISFREEZE_OTHER } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
const { _isFreeze } = useFreeze()
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { financialDetail } from '@/api/financial/index'
import { _t18, _back } from '@/utils/public'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import projectBg from '@/assets/images/gxpex/financial/detail-hero.png'

const $router = useRouter()
const Route = useRoute()

const fundIntroduction = ref('')
const proRules = ref('')

const proDetail = ref({
  title: '',
  process: '',
  totalInvestAmount: '',
  remainAmount: '',
  timeLimit: '',
  avgRate: '',
  coin: '',
  days: '',
  limitMin: ''
})

const buyNow = () => {
  if (DIFF_ISFREEZE_OTHER.includes(__config._APP_ENV)) {
    if (_isFreeze(DIFF_ISFREEZE_OTHER)) {
      $router.push(`/buyFunds/${Route.params.id}`)
    }
  } else {
    $router.push(`/buyFunds/${Route.params.id}`)
  }
}

const getDetail = async () => {
  try {
    const res = await financialDetail(Route.params.id)
    if (res.code === 200) {
      const {
        title,
        avgRate,
        days,
        limitMin,
        coin,
        prodectIntroduction,
        problem,
        process,
        totalInvestAmount,
        remainAmount,
        timeLimit
      } = res.data
      fundIntroduction.value = prodectIntroduction || ''
      proRules.value = problem || ''
      const coinU = coin ? String(coin).toUpperCase() : ''
      proDetail.value = {
        title: title || '',
        process,
        totalInvestAmount,
        remainAmount,
        timeLimit,
        avgRate,
        coin: coinU,
        days,
        limitMin
      }
    }
  } catch (error) {
    void error
  }
}

onMounted(() => {
  getDetail()
})
</script>
<style lang="scss" scoped>
.fd-page {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  /* 给固定底部按钮留位 */
  padding-bottom: calc(88px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏 */
.fd-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.fd-header__back {
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

.fd-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.fd-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

/* Body */
.fd-main {
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

/* 顶部 hero 利率横幅 */
.rate-banner {
  min-height: 120px;
  margin-bottom: 14px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 兜底渐变：等真 hero 图替换 */
  background-color: rgba(160, 65, 237, 0.12);
  background-image:
    radial-gradient(120% 110% at 80% 20%, rgba(160, 65, 237, 0.35) 0%, rgba(160, 65, 237, 0) 60%),
    linear-gradient(135deg, rgba(60, 26, 110, 0.5) 0%, rgba(30, 21, 48, 0.7) 100%);
  border: 1px solid rgba(160, 65, 237, 0.32);
  position: relative;
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

.card-text {
  font-size: 13px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.65);
  word-break: break-word;
  white-space: pre-wrap;
}

.card-rules .card-text {
  margin: 0;
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

/* 底部 sticky 按钮 — 固定在视口最下方 */
.buy-footer {
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

.buy-btn {
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
</style>
