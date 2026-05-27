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
            <span class="rate-tag">{{ item.profitRate }}%/{{ item.cycleHours }}h</span>
          </div>
          <p v-if="item.description" class="strategy-card__desc">{{ item.description }}</p>
          <div class="strategy-card__foot">
            <span>{{ _t18('copy_trade_amount_range') }}: {{ item.minAmount }}~{{ item.maxAmount }} USDT</span>
            <span class="go">{{ _t18('copy_trade_follow_now') }} ›</span>
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
import { symbolPair } from './utils'
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
  router.push({
    path: '/copy-trade/submit',
    query: { data: encodeURI(JSON.stringify(item)) }
  })
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
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  &__head {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    &--placeholder {
      background: #eee;
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
  .rate-tag {
    font-size: 12px;
    color: $green;
    background: rgba($green, 0.1);
    padding: 4px 8px;
    border-radius: 4px;
    flex-shrink: 0;
  }
  &__desc {
    font-size: 13px;
    color: #666;
    margin: 12px 0 0;
    line-height: 1.4;
  }
  &__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    font-size: 12px;
    color: #888;
    .go {
      color: $green;
      font-weight: 500;
    }
  }
}
</style>
