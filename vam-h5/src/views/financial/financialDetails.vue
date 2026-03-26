<template>
  <div
    class="financial-detail-page"
    :class="{ 'financial-detail-page--dark': !isPaxpay }"
  >
    <HeaderBar
      v-if="isPaxpay"
      :currentName="_t18('financial', ['paxpay'])"
      :border_bottom="false"
    />
    <FinancialTopBar v-else />

    <div
      class="financial-detail-page__body-wrap"
      :class="{ 'financial-detail-page__body-wrap--dark': !isPaxpay }"
    >
      <div class="financial-detail-page__sheet">
        <div class="financial-detail-page__sheet-bg" aria-hidden="true" />
        <div class="financial-detail-page__panel">
          <div class="detail-scroll">
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { DIFF_ISFREEZE_OTHER } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
const { _isFreeze } = useFreeze()
import { useRouter, useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import FinancialTopBar from './components/FinancialTopBar.vue'
import { financialDetail } from '@/api/financial/index'
import { _t18, _getConfig } from '@/utils/public'
import projectBg from '@/assets/images/financial/project-bg.png'

const $router = useRouter()
const Route = useRoute()

const isPaxpay = computed(() => ['paxpay'].includes(_getConfig('_APP_ENV')))

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
  } catch (error) {}
}

onMounted(() => {
  getDetail()
})
</script>
<style lang="scss" scoped>
.financial-detail-page {
  min-height: 100vh;
  box-sizing: border-box;
  margin-bottom: calc(66px + env(safe-area-inset-bottom, 0px));
  background: #f6f7fa;
  &--dark {
    background: #010e1a;
  }
}

/* 与 assets/index.vue 一致：深色带 + 浅色圆角内容区（两层背景） */
.financial-detail-page__body-wrap {
  background: #f6f7fa;
  &--dark {
    background: #010e1a;
  }
}

.financial-detail-page__sheet {
  position: relative;
  z-index: 0;
  min-height: calc(100vh - 72px);
  border-radius: 16px 16px 0 0;
  background: #f6f7fa;
}

.financial-detail-page__sheet-bg {
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -8px 32px rgba(5, 16, 26, 0.18);
  pointer-events: none;
}

.financial-detail-page__panel {
  position: relative;
  z-index: 1;
  background: transparent;
}

.detail-scroll {
  padding: 12px 0 calc(24px + env(safe-area-inset-bottom, 0px));
}

.card {
  background: #fff;
  border-radius: 14px;
  margin: 0 15px 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(1, 14, 26, 0.06);
  box-sizing: border-box;
}

.card-overview {
  padding-top: 18px;
}

.overview-title {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  line-height: 1.35;
  word-break: break-word;
}

.rate-banner {
  min-height: 112px;
  margin-bottom: 14px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rate-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: #e85d75;
}

.overview-rows .detail-row {
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}

.card-title {
  font-size: 16px;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.card-text {
  font-size: 13px;
  line-height: 1.55;
  color: #8b9099;
  word-break: break-word;
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
  margin-bottom: 14px;
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  color: #8b9099;
  flex-shrink: 0;
}

.value {
  color: #2a2f36;
  text-align: right;
  word-break: break-all;
}

.rate-highlight {
  color: #e85d75;
}

.buy-footer {
  margin: 8px 15px 0;
  padding: 0;
  box-sizing: border-box;
}

.buy-btn {
  display: block;
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: #010e1a;
  text-align: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  &:active {
    opacity: 0.92;
  }
}
</style>
