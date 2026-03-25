<!-- 我的投资 -->
<template>
  <div class="invest-page">
    <DarkHeaderBar :title="_t18('my_invest')" :border_bottom="false" />

    <div class="invest-page__body">
      <div class="invest-page__round">
        <div class="invest-page__sheet">
          <div class="invest-page__sheet-bg" aria-hidden="true" />
          <div class="invest-page__panel">
            <div class="invest-summary">
              <div class="invest-summary__row">
                <span class="invest-summary__label">{{ _t18('sum_bet_value') }}</span>
                <span class="invest-summary__value fw-num">{{ headerObj.sumAmount }} USDT</span>
              </div>
              <div class="invest-summary__row">
                <span class="invest-summary__label">{{ _t18('earn_rewards') }}</span>
                <span class="invest-summary__value fw-num">{{ headerObj.commission }} USDT</span>
              </div>
              <div class="invest-summary__row">
                <span class="invest-summary__label">{{ _t18('Cumulative_income') }}</span>
                <span class="invest-summary__value invest-summary__value--profit fw-num"
                  >{{ headerObj.sumEarn }} USDT</span
                >
              </div>
              <div class="invest-summary__row">
                <span class="invest-summary__label">{{ _t18('number_of_positions') }}</span>
                <span class="invest-summary__value fw-num">{{ headerObj.position }}</span>
              </div>
            </div>

            <h2 class="invest-records-title">{{ _t18('transaction_record') }}</h2>

            <div class="invest-list-wrap">
              <van-list
                v-if="list.length > 0 && !isShow"
                v-model:loading="loading"
                :finished="finished"
                :finished-text="_t18('no_more_data')"
                :loading-text="_t18('loading')"
                @load="onLoad"
              >
                <RecordItem v-for="item in list" :key="item" :item-obj="item" />
              </van-list>
              <Nodata v-if="list.length === 0 && isShow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import RecordItem from './components/recordItem.vue'
import { ref, onMounted } from 'vue'
import { investmentList, personalIncome } from '@/api/financial/index'
import { _t18 } from '@/utils/public'

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
$inv-top: #05101a;
$inv-green: #008710;
$inv-list-bg: #f5f6fa;

.invest-page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
  flex-direction: column;
}

.invest-page__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: $inv-top;
}

.invest-page__round {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: $inv-top;
  overflow: visible;
}

.invest-page__sheet {
  position: relative;
  z-index: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 16px 16px 0 0;
  background: #ffffff;
  overflow: visible;
}

.invest-page__sheet-bg {
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -8px 32px rgba(5, 16, 26, 0.18);
  pointer-events: none;
}

.invest-page__panel {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: transparent;
  padding: 12px 15px 0;
}

.invest-summary {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 6px 16px;
  margin-bottom: 8px;
}

.invest-summary__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  font-size: 14px;

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
}

.invest-summary__label {
  color: #888;
  flex-shrink: 0;
  margin-right: 12px;
}

.invest-summary__value {
  color: #333;
  text-align: right;
  word-break: break-all;
}

.invest-summary__value--profit {
  color: $inv-green;
  font-weight: 600;
}

.invest-records-title {
  margin: 20px 0 14px;
  padding: 0;
  font-size: 17px;
  font-weight: 600;
  color: $inv-green;
  border: none;
}

.invest-list-wrap {
  flex: 1;
  min-height: 120px;
  margin: 0 -15px;
  padding: 4px 15px 28px;
  background: $inv-list-bg;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

:deep(.van-list__finished-text) {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #999;
}
</style>
