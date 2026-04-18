<!-- 行情页面：自选，秒合约，币币交易，U本位 -->
<template>
  <div class="quote-page">
    <!-- 深色顶栏：仅 tabs -->
    <div class="quote-header">
      <div class="headerChoose">
        <van-tabs
          swipeable
          shrink
          :swipe-threshold="2"
          v-model:active="currentIndex"
          :line-width="0"
          title-active-color="#000"
          title-inactive-color="#3333"
        >
          <van-tab v-for="(item, index) in headerList" :key="index" :title="item.title" />
        </van-tabs>
      </div>
    </div>
    <!-- 主内容：白底圆角承接深色头 -->
    <div class="quote-sheet">
      <div class="search">
        <div class="searchBtn">
          <svg-load name="lujing3047" class="searchLeft"></svg-load>
          <input
            type="text"
            v-model.trim="searchName"
            :placeholder="_t18(`search_currency`)"
            class="searchInput"
          />
        </div>
      </div>
      <div class="quote-sheet-body">
        <component
          :is="getTabComponent(activeHeader?.componentName)"
          :key="(activeHeader?.componentName || 'QuoteOptional') + '-' + currentIndex"
          :searchName="searchName"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { _t18 } from '@/utils/public'
import { useMainStore } from '@/store/index'
import { useTradeStore } from '@/store/trade'
const mainStore = useMainStore()
const tradeStore = useTradeStore()

import { computed } from 'vue'
import QuoteOptional from './components/quoteOptional.vue' //自选
import SecondContract from './components/quoteSecondContract.vue' //秒合约
import BBTrading from './components/quoteBBTrading.vue' //币币
import Ustandard from './components/quoteUstandard.vue' //U本位
// 搜索
const searchName = ref('')
// tabs（tradeFlag 与行情子 tab 下标一致：0=自选 1=秒 2=币 3=U，勿再 +isOption）
const headerList = computed(() => mainStore.getTradeHeaderList)

function clampQuoteIndex(tf, maxLen) {
  const n = Number(tf)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(Math.floor(n), Math.max(0, maxLen - 1))
}

function readQuoteTabIndexFromStore() {
  const raw = mainStore.tradeFlag
  const len = headerList.value?.length || 1
  if (raw === '' || raw === undefined || raw === null) {
    return 0
  }
  return clampQuoteIndex(raw, len)
}

const currentIndex = ref(0)

watch(
  headerList,
  () => {
    currentIndex.value = readQuoteTabIndexFromStore()
  },
  { immediate: true }
)

const activeHeader = computed(() => headerList.value?.[currentIndex.value])

const componentMap = {
  Optional: QuoteOptional,
  QuoteOptional,
  SecondContract,
  BBTrading,
  Ustandard
}

const getTabComponent = (name) => componentMap[name] || QuoteOptional

async function fetchByTab() {
  await tradeStore.getCoinList()
}

function optionalTabIndex() {
  const list = mainStore.getTradeHeaderList || []
  const i = list.findIndex((h) => h.componentName === 'Optional')
  return i >= 0 ? i : 0
}

onMounted(() => {
  fetchByTab(currentIndex.value)
})

/** 底部「行情」每次进入默认自选 */
onActivated(() => {
  const idx = optionalTabIndex()
  currentIndex.value = idx
  mainStore.setTradeFlag(idx)
  fetchByTab(currentIndex.value)
})

watch(currentIndex, (n) => {
  mainStore.setTradeFlag(n)
})
</script>

<style lang="scss" scoped>
.quote-page {
  min-height: 100vh;
  // background: #0b1118;
  background: #fff;
  box-sizing: border-box;
  padding-top: calc(52px + env(safe-area-inset-top));
}

.quote-header {
  z-index: 9;
  padding-left: 12px;
  padding-right: 12px;
  padding-top: env(safe-area-inset-top);
  min-height: calc(52px + env(safe-area-inset-top));
  box-sizing: border-box;
  // background: #0b1118;
  background: #fff;
  display: flex;
  align-items: flex-end;
  padding-bottom: 8px;
  position: fixed;
  top: 0;

  .headerChoose {
    flex: 1;
    min-width: 0;
    display: flex;
    padding: 0;
    background: transparent;

    :deep(.van-tabs__wrap) {
      height: 44px;
    }

    :deep(.van-tabs__nav) {
      background: transparent;
    }

    :deep(.van-tabs__nav--complete) {
      padding: 0 4px;
    }

    :deep(.van-tab) {
      flex: none;
      font-size: 15px;
      margin-right: 22px;
      padding: 0;
      color: #3333 !important;
      background: transparent;
    }

    :deep(.van-tab:last-child) {
      margin-right: 0;
    }

    :deep(.van-tab--active) {
      font-weight: 600;
      color: #000 !important;
    }

    :deep(.van-tabs__line) {
      display: none;
    }
  }
}

.quote-sheet {
  background: #fff;
  // border-top-left-radius: 16px;
  // border-top-right-radius: 16px;
  min-height: calc(100vh - 52px - env(safe-area-inset-top));
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.mainBgc) {
    background: transparent;
  }

  :deep(.mainBgc .main_collect) {
    background-color: transparent;
  }

  :deep(.mainBgc .main) {
    background-color: transparent;
  }
}

.quote-sheet-body {
  --van-tabs-nav-background: transparent;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  background: #f6f7fa;
  margin:2px 15px;
  border-radius: 8px;

  > :deep(*) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

.search {
  flex-shrink: 0;
  padding: 16px 15px 10px;

  .searchBtn {
    height: 36px;
    background: #f6f7fa;
    border-radius: 8px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    .searchLeft {
      width: 14px;
      height: 14px;
      margin-right: 10px;
      margin-top: -1px;
      opacity: 0.45;
    }

    .searchInput {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      background: transparent;
      flex: 1;
      color: #1a1a1a;
    }

    input::placeholder {
      color: #a0a4ad;
    }

    input::-webkit-input-placeholder {
      color: #a0a4ad;
    }

    input::-moz-placeholder {
      color: #a0a4ad;
    }

    input:-ms-input-placeholder {
      color: #a0a4ad;
    }
  }
}
</style>
