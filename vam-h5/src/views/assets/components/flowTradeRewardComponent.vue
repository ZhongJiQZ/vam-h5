<!-- src/views/assets/components/flowTradeRewardComponent.vue -->
<template>
  <div class="flow-trade-reward">
    <van-tabs
      shrink
      v-model:active="statusActive"
      class="flow-trade-reward__status-tabs"
      title-inactive-color="#7a8c99"
      title-active-color="#1a1a1a"
      color="#008710"
      line-width="20"
      line-height="3"
      @click-tab="onClickStatusTab"
    >
      <van-tab :title="_t18('records.total')" name="" />
      <van-tab :title="_t18('tradeReward.pending')" name="0" />
      <van-tab :title="_t18('tradeReward.granted')" name="2" />
      <van-tab :title="_t18('tradeReward.rejected')" name="3" />
    </van-tabs>

    <div class="list-wrap">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          :finished-text="_t18('utils.noMore') || '没有更多了'"
          @load="onLoad"
        >
          <template v-if="list.length">
            <div class="card" v-for="row in list" :key="row.id">
              <div class="kv">
                <div class="k">{{ _t18('tradeReward.tier') }}</div>
                <div class="v">{{ row.tierName || '-' }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('tradeReward.statDate') }}</div>
                <div class="v">{{ formatDate(row.statDate) }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('tradeReward.participatingPeople') }}</div>
                <div class="v">{{ formatCount(row.participatingPeopleCount) }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('tradeReward.validPeople') }}</div>
                <div class="v">{{ formatCount(row.validPeopleCount) }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('tradeReward.rewardAmount') }} (USDT)</div>
                <div class="v">{{ formatAmount(row.rewardAmount) }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.status') }}</div>
                <div class="v" :class="statusClass(row.status)">{{ formatStatus(row.status) }}</div>
              </div>

              <div class="kv" v-if="String(row.status) === '2' && row.grantTime">
                <div class="k">{{ _t18('tradeReward.grantTime') }}</div>
                <div class="v">{{ row.grantTime }}</div>
              </div>

              <div class="kv" v-if="String(row.status) === '3' && row.rejectReason">
                <div class="k">{{ _t18('tradeReward.rejectReason') }}</div>
                <div class="v reject-reason">{{ row.rejectReason }}</div>
              </div>
            </div>
          </template>

          <van-empty
            v-else-if="!loading && !refreshing"
            :description="_t18('utils.noData') || '暂无数据'"
          />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
import { _t18 } from '@/utils/public'
import { priceFormat } from '@/utils/decimal'
import { getTradeRewardList } from '@/api/tradeReward'

const statusActive = ref('')
const pageNum = ref(1)
const pageSize = 10

const list = ref([])
const total = ref(0)

const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const formatCount = (v) => {
  if (v === null || v === undefined || v === '') return '-'
  return String(v)
}

const formatAmount = (v) => {
  if (v === null || v === undefined || v === '') return '-'
  const n = Number(String(v).replace(/,/g, ''))
  if (!Number.isFinite(n)) return '-'
  return priceFormat(n, 4)
}

const formatDate = (v) => {
  if (!v) return '-'
  return String(v).slice(0, 10)
}

const formatStatus = (status) => {
  const s = String(status)
  if (s === '0') return _t18('tradeReward.pending')
  if (s === '2') return _t18('tradeReward.granted')
  if (s === '3') return _t18('tradeReward.rejected')
  return '-'
}

const statusClass = (status) => {
  const s = String(status)
  if (s === '0') return 'status-pending'
  if (s === '2') return 'status-granted'
  if (s === '3') return 'status-rejected'
  return ''
}

const fetchList = async ({ reset = false } = {}) => {
  try {
    if (reset) {
      pageNum.value = 1
      finished.value = false
      list.value = []
    }

    loading.value = true

    const status = statusActive.value === '' ? '' : Number(statusActive.value)
    const res = await getTradeRewardList({
      pageNum: pageNum.value,
      pageSize,
      status,
    })

    const payload = res?.data ? res.data : res
    const rows = payload?.rows || []
    const t = Number(payload?.total || 0)

    total.value = t
    list.value = pageNum.value === 1 ? rows : list.value.concat(rows)

    if (list.value.length >= t || rows.length < pageSize) {
      finished.value = true
    }

    pageNum.value += 1
  } catch (e) {
    showToast(e?.message || 'load failed')
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onLoad = () => fetchList({ reset: false })
const onRefresh = () => {
  refreshing.value = true
  fetchList({ reset: true })
}
const onClickStatusTab = () => fetchList({ reset: true })
</script>

<style scoped lang="scss">
.flow-trade-reward {
  width: 100%;
}

.flow-trade-reward__status-tabs {
  :deep(.van-tabs__wrap) {
    height: 44px;
    border-bottom: 1px solid #eef0f3;
    background: #fff !important;
  }

  :deep(.van-tabs__nav) {
    background: #fff !important;
    padding-left: 12px;
    padding-right: 12px;
  }

  :deep(.van-tab) {
    flex: none;
    padding: 0 12px;
    font-size: 14px;
  }

  :deep(.van-tab__text) {
    font-weight: 400;
  }

  :deep(.van-tab--active .van-tab__text) {
    font-weight: 600;
  }

  :deep(.van-tabs__line) {
    display: none !important;
  }

  :deep(.van-tab--shrink) {
    margin-right: 4px;
  }
}

.list-wrap {
  padding: 12px 15px 24px;
  background: #fff;
}

.card {
  background: #f7f9fc;
  border-radius: 12px;
  padding: 14px 14px 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(5, 16, 26, 0.04);
}

.kv {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
}

.k {
  font-size: 13px;
  color: #7a8c99;
  flex: 0 0 45%;
}

.v {
  font-size: 13px;
  color: #1a1a1a;
  text-align: right;
  flex: 1;
  word-break: break-all;
}

.status-pending {
  color: #e6a23c;
}

.status-granted {
  color: #008710;
}

.status-rejected {
  color: #f56c6c;
}

.reject-reason {
  color: #f56c6c;
}
</style>
