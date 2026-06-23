<!-- 机构策略列表 / 加入跟单 -->
<template>
  <div class="strategies-page">
    <CopyTradeHeader :title="t18('copy_trade_join_strategy')" :border-bottom="true" />

    <van-pull-refresh v-model="refreshing" @refresh="loadData">
      <div class="list">
        <div v-for="item in list" :key="item.id" class="card" @click="toSubmit(item)">
          <div class="card__head">
            <img v-if="item.icon" :src="item.icon" class="avatar" alt="" loading="lazy" decoding="async" />
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
            <span>{{ t18('copy_trade_strategy_list_start') }}</span>
            <span>{{ formatCopyTradeStrategyStartTime(item) }}</span>
          </div>
          <div class="kv">
            <span>{{ t18('copy_trade_strategy_list_end') }}</span>
            <span>{{ formatCopyTradeStrategyEndTime(item) }}</span>
          </div>
          <div class="kv">
            <span>{{ t18('copy_trade_profit_rate_range') }}</span>
            <span class="ff-num">{{ formatStrategyProfitRateRange(item) }}</span>
          </div>
          <div class="kv">
            <span>{{ t18('copy_trade_amount_range') }}</span>
            <span class="ff-num">{{ item.minAmount }} - {{ item.maxAmount }} USDT</span>
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
import CopyTradeHeader from './components/CopyTradeHeader.vue'
import { _t18 } from '@/utils/public'
import { getCopyTradeInstitutionStrategyList } from '@/api/copyTrade'
import {
  formatCopyTradeStrategyStartTime,
  formatCopyTradeStrategyEndTime,
  formatStrategyProfitRateRange,
  hasActiveSubCountCondition,
  formatActiveSubCountCondition,
  getStrategyJoinBlockMessage,
  isStrategyFollowing,
  normalizeStrategyDetail,
  formatAmountRangeText
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
    list.value =
      res?.code == 200 && Array.isArray(res.data)
        ? res.data.map((row) => normalizeStrategyDetail(row))
        : []
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
      institutionId: route.query.institutionId || item.institutionId || ''
    }
  })
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
@use './styles/theme.scss' as ct;

.strategies-page {
  @include ct.ct-page-bg;
}

.list {
  padding: 12px 15px;
}

.card {
  @include ct.ct-card;
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
    @include ct.ct-avatar-ph;
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
  color: ct.$ct-text-primary;
}

.badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;

  &--on,
  &--following {
    @include ct.ct-badge-on;
  }

  &--off {
    @include ct.ct-badge-off;
  }
}

.kv {
  @include ct.ct-kv-row;
  font-size: 13px;
  margin-top: 6px;
}
</style>
