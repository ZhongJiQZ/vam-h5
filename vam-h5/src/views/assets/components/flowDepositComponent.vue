<template>
  <div class="flow-deposit">
    <van-tabs
      shrink
      v-model:active="curIndex"
      class="flow-deposit__status-tabs"
      :line-width="0"
      @click-tab="onClickStatusTab"
    >
      <van-tab v-for="(t, i) in tabList" :key="i" :title="t" :name="i" />
    </van-tabs>

    <div class="list-wrap">
      <van-pull-refresh
        v-model="refreshing"
        :pulling-text="_t18('loading')"
        :loosing-text="_t18('release_refresh') || _t18('loading')"
        :loading-text="_t18('loading')"
        :success-text="''"
        @refresh="onRefresh"
      >
        <van-list
          v-model:loading="loading"
          :finished="finished"
          :finished-text="tabContentList.length ? (_t18('no_more_data') || _t18('utils.noMore')) : ''"
          :loading-text="_t18('loading')"
          :error-text="_t18('error') || ''"
          @load="onLoad"
        >
          <template v-if="tabContentList.length">
            <div class="card" v-for="(item, index) in tabContentList" :key="item.id || index">
              <div class="kv">
                <div class="k">{{ _t18('assets.chainType') }}</div>
                <div class="v">{{ item.type || '-' }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.amount') }}</div>
                <div class="v v--profit">{{ formatRecordAmount(item) }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.createTime') }}</div>
                <div class="v ff-num">{{ formatCreateTime(item) }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.status') }}</div>
                <div class="v">
                  <span class="status-chip" :class="statusChipClass(item.status)">
                    {{ formatStatus(item.status) }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <div v-else-if="!loading && !refreshing" class="fd-empty">
            <img :src="iconEmpty" alt="" class="fd-empty__icon" />
            <p class="fd-empty__text">{{ _t18('no_data') || _t18('utils.noData') }}</p>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { _t18, _numberWithCommas } from '@/utils/public'
import { formatLocalTime } from '@/utils/time'
import { priceFormat } from '@/utils/decimal'
import { getRechargeList } from '@/api/account'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

const curIndex = ref(0)

const tabList = computed(() => {
  return [
    _t18('recharge_tab_all', ['aams']),
    _t18('recharge_tab_wait'),
    _t18('recharge_tab_success'),
    _t18('recharge_tab_error')
  ]
})

const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tabContentList = ref([])

const formatCreateTime = (item) => {
  const raw = item?.params?.createTime ?? item?.createTime
  if (raw === null || raw === undefined || raw === '') return '-'
  const s = formatLocalTime(raw)
  return s === '--' ? '-' : s
}

const formatRecordAmount = (item) => {
  const isBank = String(item?.type || '').toUpperCase() === 'BANK'
  const coin = String(item?.coin || 'USDT').toUpperCase()
  if (!isBank) {
    return `${item?.amount ?? '-'} ${coin}`.trim()
  }
  const raw = item?.realAmount ?? item?.amount
  const n = Number(raw)
  const amountText = Number.isFinite(n) ? priceFormat(n) : raw
  return `${amountText} ${coin}`
}

const formatStatus = (s) => {
  if (String(s) === '0') return _t18('recharge_waiting')
  if (String(s) === '1') return _t18('recharge_tab_success')
  return _t18('recharge_tab_error')
}

const statusChipClass = (s) => {
  if (String(s) === '0') return 'status-chip--progress'
  if (String(s) === '1') return 'status-chip--done'
  return 'status-chip--fail'
}

const buildParams = () => {
  let params = `pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  if (curIndex.value != 0) {
    params = `status=${curIndex.value - 1}&pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  }
  return params
}

const getList = () => {
  const params = buildParams()
  getRechargeList(params)
    .then((res) => {
      if (res.code == '200') {
        loading.value = false
        refreshing.value = false
        tabContentList.value = tabContentList.value.concat(res.rows || [])
        total.value = res.total || 0
        if (tabContentList.value.length >= total.value) {
          finished.value = true
        }
        pageNum.value++
      } else {
        finished.value = true
        loading.value = false
        refreshing.value = false
      }
    })
    .catch(() => {
      finished.value = true
      loading.value = false
      refreshing.value = false
    })
}

const onLoad = () => {
  loading.value = true
  getList()
}

const onRefresh = () => {
  finished.value = false
  pageNum.value = 1
  loading.value = true
  tabContentList.value = []
  getList()
}

const onClickStatusTab = () => {
  tabContentList.value = []
  finished.value = false
  pageNum.value = 1
  loading.value = true
  getList()
}

watch(
  curIndex,
  () => {
    getList()
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.flow-deposit {
  width: 100%;
}

/* 状态子 tab — 跟 Mining/Invest 同款紫色短下划线 */
.flow-deposit__status-tabs {
  :deep(.van-tabs__wrap) {
    height: 40px;
    background: transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  :deep(.van-tabs__nav) {
    background: transparent !important;
    padding: 0 4px;
  }

  :deep(.van-tab) {
    flex: none;
    padding: 0;
    margin-right: 22px;
    font-size: 13px;
    background: transparent !important;
    color: rgba(255, 255, 255, 0.55) !important;
  }

  :deep(.van-tab__text) {
    font-weight: 500;
  }

  :deep(.van-tab--active .van-tab__text) {
    color: #fff !important;
    font-weight: 600;
  }

  :deep(.van-tab--active::after) {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    width: 18px;
    height: 3px;
    background: #a13cff;
    border-radius: 2px;
  }

  :deep(.van-tabs__line) {
    display: none !important;
  }
}

.list-wrap {
  padding: 14px 4px 24px;
  background: transparent;
}

:deep(.van-pull-refresh) {
  background: transparent;
}

:deep(.van-list__finished-text),
:deep(.van-list__loading-text) {
  color: rgba(255, 255, 255, 0.45);
}

/* 暗紫卡 */
.card {
  background: #1a1626;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 14px 10px;
  margin-bottom: 12px;
}

.kv {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  min-height: 24px;
}

.k {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  flex: 0 0 45%;
}

.v {
  font-size: 13px;
  color: #fff;
  font-weight: 500;
  text-align: right;
  flex: 1;
  word-break: break-all;
  font-variant-numeric: tabular-nums;
}

.v--profit {
  color: #5fd5a4;
  font-weight: 600;
}

/* status chip */
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
  letter-spacing: 0.2px;
}

.status-chip--progress {
  background: rgba(78, 166, 255, 0.16);
  color: #4ea6ff;
}

.status-chip--done {
  background: rgba(95, 213, 164, 0.16);
  color: #5fd5a4;
}

.status-chip--fail {
  background: rgba(255, 89, 104, 0.16);
  color: #ff5968;
}

/* 空态 */
.fd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0 24px;
}

.fd-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.fd-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
