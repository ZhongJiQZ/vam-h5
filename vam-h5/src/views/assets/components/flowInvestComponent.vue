<!-- src/views/assets/components/flowInvestComponent.vue -->
<template>
  <div class="flow-invest">
    <van-tabs
      shrink
      v-model:active="statusActive"
      class="flow-invest__status-tabs"
      title-inactive-color="#7a8c99"
      title-active-color="#1a1a1a"
      color="#008710"
      line-width="20"
      line-height="3"
      @click-tab="onClickStatusTab"
    >
      <van-tab :title="_t18('records.total')" name="" />
      <!-- <van-tab :title="_t18('records.inProgress')" name="0" />
      <van-tab :title="_t18('records.completed')" name="1" />
      <van-tab :title="_t18('records.redeemed')" name="2" /> -->
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
                <div class="k">{{ _t18('assets.name') }}</div>
                <div class="v">{{ row.planTitle || '-' }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.dayProfitRate') }}</div>
                <div class="v">{{ toNumber(row.avgRate) }}%</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.investAmount') }} (USDT)</div>
                <div class="v">{{ row.amount }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.estimatedRevenue') }}</div>
                <div class="v">
                  {{ calPriceFormat(calcEstimatedRevenue(row), 4) }} USDT
                </div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.paymentDate') }}</div>
                <div class="v">
                  {{
                    calcReceiptTime(row.settlementType, row.days, row.createTime) === 'daily_settlement'
                      ? (_t18('assets.daily_settlement') || '每日结算')
                      : calcReceiptTime(row.settlementType, row.days, row.createTime)
                  }}
                </div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.beginTime') }}</div>
                <div class="v">{{ formatTimestamp(row.createTime) }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.endTime') }}</div>
                <div class="v">{{ formatTimestamp(row.endTime) }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.status') }}</div>
                <div class="v">{{ formatStatus(row.status) }}</div>
              </div>

              <!-- <div class="actions">
                <van-button
                  v-if="String(row.status) === '0'"
                  size="small"
                  type="primary"
                  class="btn"
                  @click="onRedeem(row)"
                >
                  {{ _t18('records.redemption') }}
                </van-button>
              </div> -->
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
import { showToast, showConfirmDialog } from 'vant'
import { _t18 } from '@/utils/public'
import { getRecordList } from '@/api/assets'
import { redemption } from '@/api/pledge'
import { useI18n } from 'vue-i18n'
import { onMounted } from "vue";

onMounted(() => {
  // 进页面直接拉第一页
  fetchList({ reset: true });
});

const { t: i18nT } = useI18n()

const statusActive = ref('')
const pageNum = ref(1)
const pageSize = 10

const list = ref([])
const total = ref(0)

const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

/* ===== util ===== */
const toNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const calPriceFormat = (num, digits = 4) => {
  const n = Number(num)
  if (!Number.isFinite(n)) return '0'
  return n.toFixed(digits)
}

const calcEstimatedRevenue = (row) => {
  const amount = toNumber(row?.amount)
  const days = toNumber(row?.days)
  const rate = toNumber(row?.avgRate)
  return (amount * days * rate) / 100
}

const formatTimestamp = (ts) => {
  if (!ts) return '-'
  return String(ts).replace('T', ' ').replace('.000+08:00', '')
}

const formatStatus = (s) => {
  if (String(s) === '0') return _t18('records.inProgress')
  if (String(s) === '1') return _t18('records.completed')
  return _t18('records.redeemed')
}

const calcReceiptTime = (settlementType, days, createTime) => {
  if (!settlementType) return '-'
  if (settlementType === 'daily_settlement') return 'daily_settlement'
  return '-'
}

/* ===== list ===== */
const fetchList = async ({ reset = false } = {}) => {
  try {
    if (reset) {
      pageNum.value = 1
      finished.value = false
      list.value = []
    }

    loading.value = true

    const status = statusActive.value === '' ? '' : Number(statusActive.value)

    const res = await getRecordList(
      {
        pageNum: pageNum.value,
        pageSize,
        status,
      },
      'order'
    )

    const payload = res?.data ? res.data : res
    const rows = payload?.rows || []
    const t = Number(payload?.total || 0)

    total.value = t

    list.value =
      pageNum.value === 1 ? rows : list.value.concat(rows)

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

const onLoad = () => fetchList()
const onRefresh = () => {
  refreshing.value = true
  fetchList({ reset: true })
}
const onClickStatusTab = () => fetchList({ reset: true })

const onRedeem = async (row) => {
  if (!row?.id) return

  try {
    await showConfirmDialog({
      title: i18nT('records.redemption'),
      message: i18nT('utils.confirm') || '确认赎回？',
    })

    const res = await redemption({ id: row.id })
    const payload = res?.data ? res.data : res

    if (payload?.code === 200) {
      showToast(payload?.msg || 'success')
      fetchList({ reset: true })
    } else {
      showToast(payload?.msg || 'failed')
    }
  } catch (e) {}
}
</script>
<style scoped lang="scss">
.flow-invest {
  width: 100%;
}

.flow-invest__status-tabs {
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
    bottom: 8px;
    background: #008710;
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
  padding: 8px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.kv:last-of-type {
  border-bottom: 0;
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

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>

