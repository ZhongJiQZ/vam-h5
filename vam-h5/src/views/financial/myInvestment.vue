<!-- 我的投资 -->
<template>
  <div class="myinv-page">
    <header class="myinv-header">
      <button type="button" class="myinv-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="myinv-header__back-icon" />
      </button>
      <h1 class="myinv-header__title">{{ _t18('my_invest') }}</h1>
    </header>

    <div class="myinv-page__body">
      <div class="myinv-summary">
        <div class="myinv-summary__row">
          <span class="myinv-summary__label">{{ _t18('sum_bet_value') }}</span>
          <span class="myinv-summary__value fw-num">{{ headerObj.sumAmount }} USDT</span>
        </div>
        <div class="myinv-summary__row">
          <span class="myinv-summary__label">{{ _t18('earn_rewards') }}</span>
          <span class="myinv-summary__value fw-num">{{ headerObj.commission }} USDT</span>
        </div>
        <div class="myinv-summary__row">
          <span class="myinv-summary__label">{{ _t18('Cumulative_income') }}</span>
          <span class="myinv-summary__value myinv-summary__value--profit fw-num"
            >{{ headerObj.sumEarn }} USDT</span
          >
        </div>
        <div class="myinv-summary__row">
          <span class="myinv-summary__label">{{ _t18('number_of_positions') }}</span>
          <span class="myinv-summary__value fw-num">{{ headerObj.position }}</span>
        </div>
      </div>

      <h2 class="myinv-records-title">{{ _t18('transaction_record') }}</h2>

      <div class="myinv-list-wrap">
        <van-list
          v-if="list.length > 0 && !isShow"
          v-model:loading="loading"
          :finished="finished"
          :finished-text="_t18('no_more_data')"
          :loading-text="_t18('loading')"
          @load="onLoad"
        >
          <RecordItem
            v-for="(item, idx) in list"
            :key="item?.id ?? item?.orderId ?? `${item?.createTime}-${idx}`"
            :item-obj="item"
          />
        </van-list>
        <div v-if="list.length === 0 && isShow" class="myinv-empty">
          <img :src="iconEmpty" alt="" class="myinv-empty__icon" />
          <p class="myinv-empty__text">{{ _t18('no_data') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import RecordItem from './components/recordItem.vue'
import { ref, onMounted } from 'vue'
import { investmentList, personalIncome } from '@/api/financial/index'
import { _t18, _back } from '@/utils/public'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const headerObj = ref({})
const list = ref([])
const pageNum = ref(1)
const pageSize = ref(5)
const isShow = ref(false)
const loading = ref(false)
const finished = ref(false)
const total = ref(0)

const onLoad = async () => {
  try {
    const data = await getInvestment()
    list.value = [...list.value, ...data]
    list.value.length === 0 ? (isShow.value = true) : (isShow.value = false)
    if (list.value.length === total.value) {
      finished.value = true
    }
    pageNum.value++
  } catch (error) {
    void error
  } finally {
    loading.value = false
  }
}

const allList = async () => {
  try {
    const res = await personalIncome()
    if (res.code === 200) {
      headerObj.value = res.data
    }
  } catch (error) {
    void error
  }
}

const getInvestment = async () => {
  try {
    const res = await investmentList(pageNum.value, pageSize.value)
    if (res.code === 200) {
      total.value = res.total
      return res.rows
    } else {
      finished.value = true
    }
  } catch (error) {
    void error
  }
}

onMounted(() => {
  allList()
  onLoad()
})
</script>

<style lang="scss" scoped>
.myinv-page {
  min-height: 100vh;
  background: #0a0610;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
}

.myinv-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.myinv-header__back {
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

.myinv-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.myinv-header__title {
  margin: 0;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.myinv-page__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 12px 15px 0;
}

.myinv-summary {
  position: relative;
  background:
    radial-gradient(120% 100% at 100% 0%, rgba(160, 65, 237, 0.22) 0%, rgba(160, 65, 237, 0) 55%),
    linear-gradient(155deg, rgba(60, 26, 110, 0.55) 0%, rgba(30, 21, 48, 0.9) 60%);
  border: 1px solid rgba(160, 65, 237, 0.28);
  border-radius: 18px;
  padding: 4px 18px;
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  box-shadow:
    0 12px 32px rgba(127, 43, 218, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.myinv-summary::after {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(196, 124, 255, 0.18) 0%, rgba(196, 124, 255, 0) 70%);
  pointer-events: none;
}

.myinv-summary__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  font-size: 14px;
}

.myinv-summary__label {
  color: rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
  margin-right: 12px;
}

.myinv-summary__value {
  color: #fff;
  font-weight: 600;
  text-align: right;
  word-break: break-all;
}

.myinv-summary__value--profit {
  color: rgb(160, 65, 237);
}

.myinv-records-title {
  margin: 20px 0 12px;
  padding: 0;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  border: none;
}

.myinv-list-wrap {
  flex: 1;
  min-height: 120px;
  margin: 0 -15px;
  padding: 4px 15px 28px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.myinv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0 80px;
}

.myinv-empty__icon {
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.myinv-empty__text {
  margin: 12px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}

:deep(.van-list__finished-text) {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
