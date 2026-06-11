<!-- 机构策略列表 / 加入跟单 -->
<template>
  <div class="strategies-page">
    <DarkHeaderBar :title="t18('copy_trade_join_strategy')" :border_bottom="true" />

    <van-pull-refresh v-model="refreshing" @refresh="loadData">
      <div class="list">
        <div v-for="item in list" :key="item.id" class="card" @click="toSubmit(item)">
          <div class="card__head">
            <img v-if="item.icon" :src="item.icon" class="avatar" alt="" />
            <div v-else class="avatar avatar--ph" />
            <div class="meta">
              <p class="name">{{ item.strategyName }}</p>
            </div>
            <span class="badge"
              :class="isStrategyFollowing(item) ? 'badge--following' : item.canJoin === false ? 'badge--off' : 'badge--on'">
              {{ item.followStatusText || (item.canJoin === false ? t18('copy_trade_unjoinable') :
                t18('copy_trade_follow_now')) }}
            </span>
          </div>
          <div class="kv">
            <span>{{ t18('copy_trade_strategy_start_time') }}</span>
            <span>{{ formatCopyTradeStrategyStartTime(item) }}</span>
          </div>
          <div class="kv">
            <span>{{ t18('copy_trade_strategy_end_time') }}</span>
            <span>{{ formatCopyTradeStrategyEndTime(item) }}</span>
          </div>
          <div class="kv">
            <span>{{ t18('copy_trade_profit_rate_range') }}</span>
            <span class="ff-num">{{ formatStrategyProfitRateRange(item) }}</span>
          </div>
          <div class="kv">
            <span>{{ t18('copy_trade_amount_range') }}</span>
            <span>{{ item.minAmount }} ~ {{ item.maxAmount }} USDT</span>
          </div>
          <div v-if="hasActiveSubCountCondition(item)" class="kv">
            <span>{{ t18('copy_trade_join_condition') }}</span>
            <span>{{ formatActiveSubCountCondition(item, t18) }}</span>
          </div>
        </div>
        <Nodata v-if="!loading && list.length === 0" />
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import { _t18 } from '@/utils/public'
import { getCopyTradeInstitutionStrategyList } from '@/api/copyTrade'
import {
  formatCopyTradeStrategyStartTime,
  formatCopyTradeStrategyEndTime,
  formatStrategyProfitRateRange,
  hasActiveSubCountCondition,
  formatActiveSubCountCondition,
  getStrategyJoinBlockMessage,
  isStrategyFollowing
} from './utils'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)

const list = ref([])
const loading = ref(true)
const refreshing = ref(false)

async function loadData() {
  const institutionId = route.query.institutionId
  if (!institutionId) {
    loading.value = false
    refreshing.value = false
    return
  }
  loading.value = true
  try {
    const res = await getCopyTradeInstitutionStrategyList({ institutionId })
    list.value = res?.code == 200 && Array.isArray(res.data) ? res.data : []
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function toSubmit(item) {
  if (isStrategyFollowing(item)) {
    router.push('/copy-trade/my')
    return
  }
  if (item?.canJoin === false) {
    showToast(getStrategyJoinBlockMessage(item, t18))
    return
  }
  router.push({
    path: '/copy-trade/submit',
    query: {
      strategyId: item.id,
      institutionId: route.query.institutionId || item.institutionId || '',
      data: encodeURIComponent(JSON.stringify(item))
    }
  })
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
$green: #17ac74;

.strategies-page {
  min-height: 100vh;
  background: #fff;
}

.list {
  padding: 12px 15px;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;

  &__head {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
  }
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;

  &--ph {
    background: #edf8f2;
  }
}

.meta {
  flex: 1;
  min-width: 0;
}

.name {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
}

.badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;

  &--on {
    background: #edf8f2;
    color: $green;
  }

  &--following {
    background: #edf8f2;
    color: $green;
  }

  &--off {
    background: #f3f4f6;
    color: #9ca3af;
  }
}

.kv {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #4b5563;
  margin-top: 6px;
}
</style>
