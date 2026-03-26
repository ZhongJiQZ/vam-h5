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
          title-active-color="#ffffff"
          title-inactive-color="rgba(255, 255, 255, 0.45)"
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
// tabs
const headerList = computed(() => mainStore.getTradeHeaderList)

const currentIndex = ref(mainStore.tradeFlag + mainStore.isOption)

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

onMounted(() => {
  fetchByTab(currentIndex.value)
})

onActivated(() => {
  fetchByTab(currentIndex.value)
})

watch(
  currentIndex,
  (n) => {
    mainStore.setTradeFlag(n)
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.quote-page {
  min-height: 100vh;
  background: #0b1118;
  box-sizing: border-box;
}

.quote-header {
  z-index: 9;
  padding-left: 12px;
  padding-right: 12px;
  padding-top: env(safe-area-inset-top);
  min-height: calc(52px + env(safe-area-inset-top));
  box-sizing: border-box;
  background: #0b1118;
  display: flex;
  align-items: flex-end;
  padding-bottom: 8px;

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
      color: rgba(255, 255, 255, 0.45) !important;
      background: transparent;
    }

    :deep(.van-tab:last-child) {
      margin-right: 0;
    }

    :deep(.van-tab--active) {
      font-weight: 600;
      color: #ffffff !important;
    }

    :deep(.van-tabs__line) {
      display: none;
    }
  }
}

.quote-sheet {
  background: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  min-height: calc(100vh - 52px - env(safe-area-inset-top));
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.mainBgc) {
    background: transparent;
  }
}

.quote-sheet-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  background: #f6f7fa;
  margin:15px;

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
