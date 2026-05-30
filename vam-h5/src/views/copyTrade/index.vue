<!-- 跟单策略列表 -->
<template>
  <div class="copy-trade-page">
    <DarkHeaderBar :title="_t18('copy_trade_title')" :border_bottom="true">
      <template #right>
        <button type="button" class="header-link" @click="router.push('/copy-trade/my')">
          {{ _t18('copy_trade_my') }}
        </button>
      </template>
    </DarkHeaderBar>

    <div v-if="configNote" class="config-note">{{ configNote }}</div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="strategy-list">
        <div
          v-for="item in strategyList"
          :key="item.id"
          class="strategy-card"
          @click="goSubmit(item)"
        >
          <div class="strategy-card__head">
            <img v-if="item.icon" :src="item.icon" class="strategy-card__icon" alt="" />
            <div v-else class="strategy-card__icon strategy-card__icon--placeholder" />
            <div class="strategy-card__info">
              <p class="name">{{ item.strategyName }}</p>
              <p class="symbol">{{ symbolPair(item.symbol) }}</p>
            </div>
            <div class="strategy-card__head-right">
              <span class="profit-rate">+{{ item.profitRate }}% / {{ item.cycleHours }}h</span>
              <span class="status-tag" :class="`status-tag--${statusClass(item)}`">
                {{ item.followStatusText || _t18('copy_trade_unknown_status') }}
              </span>
            </div>
          </div>
          <p v-if="item.description" class="strategy-card__desc">{{ item.description }}</p>
          <p class="strategy-card__window">
            {{ _t18('copy_trade_join_window') }}: {{ joinWindowText(item) }}
          </p>
          <p class="strategy-card__window">
            {{ _t18('copy_trade_profit_share_rate') }}: {{ profitShareRateText(item.profitShareRate) }}
            <span class="strategy-card__window-tip">({{ _t18('copy_trade_profit_share_rate_desc') }})</span>
          </p>
          <div class="strategy-card__foot">
            <span class="amount-pill">{{ _t18('copy_trade_amount_range') }}: {{ item.minAmount }}~{{ item.maxAmount }} USDT</span>
            <button
              type="button"
              class="go-btn"
              :disabled="item.canJoin === false"
              @click.stop="goSubmit(item)"
            >
              {{ item.canJoin === false ? (item.followStatusText || _t18('copy_trade_unjoinable')) : _t18('copy_trade_follow_now') }}
            </button>
          </div>
        </div>
        <Nodata v-if="!loading && strategyList.length === 0" />
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import { _t18 } from '@/utils/public'
import { getCopyTradeConfig, getCopyTradeStrategyList } from '@/api/copyTrade'
import { symbolPair, formatProfitShareRate } from './utils'
import { showToast } from 'vant'

const router = useRouter()
const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)
const strategyList = ref([])
const configNote = ref('')
const loading = ref(true)
const refreshing = ref(false)

async function loadData() {
  loading.value = true
  try {
    const [cfgRes, listRes] = await Promise.all([getCopyTradeConfig(), getCopyTradeStrategyList()])
    if (cfgRes?.code == 200 && cfgRes.data) {
      configNote.value = cfgRes.data.note || ''
      if (!cfgRes.data.enabled || !cfgRes.data.canCopy) {
        showToast(cfgRes.data.note || t18('copy_trade_disabled'))
      }
    }
    if (listRes?.code == 200) {
      strategyList.value = listRes.data || []
    }
  } catch (e) {
    void e
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onRefresh() {
  loadData()
}

function goSubmit(item) {
  if (item?.canJoin === false) {
    showToast(item.followStatusText || t18('copy_trade_unjoinable'))
    return
  }
  router.push({
    path: '/copy-trade/submit',
    query: { data: encodeURI(JSON.stringify(item)) }
  })
}

function statusClass(item) {
  const s = Number(item?.followStatus)
  if (s === 0) return 'joinable'
  if (s === 1) return 'running'
  return 'ended'
}

function profitShareRateText(rate) {
  return formatProfitShareRate(rate, t18('copy_trade_profit_share_rate_none'))
}

function joinWindowText(item) {
  const start = item?.joinStartTime
  const end = item?.joinEndTime
  if (start && end) return `${start} ~ ${end}`
  if (start && !end) return `${start} ~ ${t18('copy_trade_no_limit')}`
  if (!start && end) return `${t18('copy_trade_no_limit')} ~ ${end}`
  return t18('copy_trade_no_limit')
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
$green: #17ac74;

.copy-trade-page {
  min-height: 100vh;
  background: #f6f7fa;
}
.header-link {
  border: none;
  background: none;
  font-size: 14px;
  color: $green;
  padding: 0 4px;
}
.config-note {
  margin: 12px 15px 0;
  padding: 10px 12px;
  background: #fff8e6;
  border-radius: 8px;
  font-size: 12px;
  color: #996600;
  line-height: 1.4;
}
.strategy-list {
  padding: 12px 15px 24px;
}
.strategy-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid #eef0f4;
  box-shadow: 0 4px 12px rgba(17, 24, 39, 0.04);
  &:active {
    transform: scale(0.995);
  }
  &__head {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    &--placeholder {
      background: linear-gradient(135deg, #edf8f2, #d9f1e4);
    }
  }
  &__info {
    flex: 1;
    min-width: 0;
    .name {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 4px;
    }
    .symbol {
      font-size: 12px;
      color: #888;
      margin: 0;
    }
  }
  &__head-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }
  .profit-rate {
    font-size: 12px;
    font-weight: 600;
    color: $green;
    line-height: 1;
  }
  .status-tag {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 999px;
    flex-shrink: 0;
    &--joinable {
      color: $green;
      background: rgba($green, 0.1);
    }
    &--running {
      color: #2e6df6;
      background: rgba(46, 109, 246, 0.12);
    }
    &--ended {
      color: #888;
      background: #f2f2f2;
    }
  }
  &__desc {
    font-size: 13px;
    color: #666;
    margin: 12px 0 0;
    line-height: 1.4;
  }
  &__window {
    font-size: 12px;
    color: #888;
    margin: 8px 0 0;
    line-height: 1.4;
    word-break: break-all;
    &-tip {
      color: #aaa;
    }
  }
  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    font-size: 12px;
    color: #888;
    gap: 10px;
    .amount-pill {
      flex: 1;
      min-width: 0;
      color: #576074;
      background: #f7f9fc;
      border-radius: 999px;
      padding: 6px 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .go-btn {
      border: none;
      background: linear-gradient(135deg, #17ac74, #159a68);
      color: #fff;
      font-weight: 500;
      padding: 7px 12px;
      font-size: 12px;
      border-radius: 999px;
      flex-shrink: 0;
      &:disabled {
        background: #eceff3;
        color: #a8adb7;
      }
    }
  }
}
</style>
