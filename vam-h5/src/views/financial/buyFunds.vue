<template>
  <div class="buy-funds-page">
    <DarkHeaderBar
      :title="t18('buy_funds')"
      :backwardNum="backwardNum"
      bg-color="#010e1a"
      :border_bottom="false"
    />

    <div class="buy-funds-body">
      <div v-if="!isSuccess" class="buy-funds-content">
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
          <input
            v-model="limit"
            type="text"
            :placeholder="t18('exchange.input')"
            class="quota-input"
          />
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

        <div class="buy-actions">
          <button type="button" class="pay-btn" @click="payNow">{{ t18('to pay') }}</button>
          <div class="protocol">
            <svg-load v-if="!isCheck" name="gou" class="protocol-img" @click="toSwitch" />
            <svg-load v-if="isCheck" name="gouH" class="protocol-img" @click="toSwitch" />
            <span>{{ t18('read_and_confirm') }}</span>
            <span class="protocol-link" @click="$router.push('/financialAgreement')">
              {{ t18('financial agreement') }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="success">
        <svg-load name="icon8" class="success-img" />
        <div class="success-text">{{ t18('payment_successful') }}</div>
        <button type="button" class="success-home" @click="$router.push('/')">
          {{ t18('backhome') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

import { DIFF_ISFREEZE } from '@/config/index'
import { useFreeze } from '@/hook/useFreeze'
import { useToast } from '@/hook/useToast'

import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import { financialDetail, financialSubmit } from '@/api/financial/index'
import projectBg from '@/assets/images/financial/project-bg.png'

const { t } = useI18n()
const t18 = (key) => t(key)

const { _isFreeze } = useFreeze()
const { _toast } = useToast()

const Route = useRoute()

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
      const { title, icon, avgRate, days, limitMin, limitMax, coin } = res.data
      minNum.value = limitMin
      maxNum.value = limitMax
      coninName.value = coin.toUpperCase()
      dayNum.value = days

      const { process, totalInvestAmount, remainAmount, timeLimit } = res.data
      proDetail.value = {
        title,
        process,
        totalInvestAmount,
        remainAmount,
        timeLimit,
        avgRate,
        coin: coin.toUpperCase()
      }
    }
  } catch (e) {}
}

onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
.buy-funds-page {
  min-height: 100vh;
  background: #010e1a;
  box-sizing: border-box;
}

.buy-funds-body {
  background: #f6f7fa;
  border-radius: 16px 16px 0 0;
  min-height: calc(100vh - 60px);
  padding: 12px 0 calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  position: relative;
  box-shadow: 0 -8px 32px rgba(5, 16, 26, 0.12);
}

.buy-funds-content {
  padding: 0;
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

.quota-input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #e4e6eb;
  border-radius: 10px;
  font-size: 15px;
  color: #2a2f36;
  background: #f6f7fa;
  box-sizing: border-box;
}

.quota-input::placeholder {
  color: #a8b0ba;
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

.buy-actions {
  margin: 8px 15px 0;
  padding-top: 8px;
}

.pay-btn {
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

.protocol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 20px;
  padding: 0 8px;
  font-size: 13px;
  color: #8b9099;
  text-align: center;
  line-height: 1.45;
}

.protocol-img {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.protocol-link {
  color: #17ac74;
  text-decoration: underline;
  cursor: pointer;
}

.success {
  padding: 80px 24px 40px;
  text-align: center;
}

.success-img {
  width: 114px;
  height: 112px;
  margin: 0 auto 24px;
}

.success-text {
  font-size: 16px;
  color: #2a2f36;
  margin-bottom: 24px;
}

.success-home {
  padding: 12px 32px;
  border: 1px solid #17ac74;
  border-radius: 999px;
  background: transparent;
  font-size: 15px;
  color: #17ac74;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>
