<!-- 行情页面：自选，秒合约，币币交易，U本位 -->
<template>
  <div class="quote-page">
    <!-- 紫色高斯光晕 (与首页一致) -->
    <div class="bg-glow bg-glow--1"></div>
    <div class="bg-glow bg-glow--2"></div>

    <!-- 顶部标题栏：标题居中 + 右上搜索 -->
    <div class="quote-topbar">
      <div class="quote-title">{{ pageTitle }}</div>
      <div class="quote-search-trigger" @click="toggleSearch">
        <img :src="iconSearch" class="search-icon" alt="search" />
      </div>
    </div>

    <!-- 子 tab 行 -->
    <div class="quote-tabs">
      <van-tabs
        swipeable
        shrink
        :swipe-threshold="2"
        v-model:active="currentIndex"
        :line-width="0"
        title-active-color="#ffffff"
        title-inactive-color="rgba(255,255,255,0.55)"
      >
        <van-tab v-for="(item, index) in headerList" :key="index" :title="item.title" />
      </van-tabs>
    </div>

    <!-- 可展开搜索栏 -->
    <div v-if="searchOpen" class="quote-search">
      <div class="quote-search__box">
        <img :src="iconSearch" class="quote-search__icon" alt="" />
        <input
          type="text"
          v-model.trim="searchName"
          :placeholder="_t18(`search_currency`)"
          class="quote-search__input"
        />
      </div>
    </div>

    <!-- 主内容 -->
    <div class="quote-sheet">
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
import iconSearch from '@/assets/images/gxpex/quote/icon-search.svg'
// 搜索
const searchName = ref('')
const searchOpen = ref(false)
const toggleSearch = () => {
  searchOpen.value = !searchOpen.value
  if (!searchOpen.value) searchName.value = ''
}
// tabs（tradeFlag 与行情子 tab 下标一致：0=自选 1=秒 2=币 3=U，勿再 +isOption）
const headerList = computed(() => mainStore.getTradeHeaderList)
const pageTitle = computed(() => _t18(`quote`))

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
  position: relative;
  min-height: 100vh;
  background: #111111;
  box-sizing: border-box;
  padding-top: calc(env(safe-area-inset-top));
  overflow-x: hidden;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #a642ec 0%, #802bda 60%, transparent 100%);
  filter: blur(60px);
  opacity: 0.18;
  pointer-events: none;
  z-index: 0;

  &--1 {
    top: -80px;
    right: -60px;
    width: 260px;
    height: 260px;
  }
  &--2 {
    top: 200px;
    left: -90px;
    width: 240px;
    height: 240px;
  }
}

/* 顶部标题栏：标题水平居中 + 搜索按钮绝对定位右上 */
.quote-topbar {
  position: relative;
  z-index: 2;
  padding: 14px 18px 6px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  .quote-title {
    font-family: 'PingFang SC', -apple-system, sans-serif;
    font-size: 17px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.2;
    text-align: center;
  }

  .quote-search-trigger {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    .search-icon {
      width: 20px;
      height: 20px;
      opacity: 0.85;
    }
  }
}

/* tab 行 */
.quote-tabs {
  position: relative;
  z-index: 2;
  padding: 4px 12px 6px;

  :deep(.van-tabs__wrap) {
    height: 40px;
    background: transparent;
  }

  :deep(.van-tabs__nav) {
    background: transparent;
    padding: 0 4px;
  }

  :deep(.van-tab) {
    flex: none;
    font-size: 15px;
    margin-right: 24px;
    padding: 0;
    background: transparent;
  }

  :deep(.van-tab:last-child) {
    margin-right: 0;
  }

  :deep(.van-tab--active) {
    font-weight: 600;
  }

  :deep(.van-tabs__line) {
    display: none;
  }
}

/* 搜索栏 (按需展开) */
.quote-search {
  position: relative;
  z-index: 2;
  padding: 6px 15px 10px;

  &__box {
    height: 38px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 0 14px;
    display: flex;
    align-items: center;
  }

  &__icon {
    width: 16px;
    height: 16px;
    margin-right: 10px;
    opacity: 0.55;
  }

  &__input {
    flex: 1;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    font-size: 13px;
    color: #ffffff;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
}

.quote-sheet {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.quote-sheet-body {
  --van-tabs-nav-background: transparent;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding-bottom: 100px;

  > :deep(*) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

/* 让 3 个使用 CurrencyItem 的 tab (秒/币/U) 视觉对齐 自选 暗紫卡 */
.quote-sheet-body :deep(.currencyItem) {
  margin: 0 12px 12px;
  padding: 14px 16px;
  background: #221c31;
  border-radius: 12px;
  border-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .left {
    display: flex;
    align-items: center;
    gap: 12px;
    .leftImg {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: contain;
      background: rgba(255, 255, 255, 0.08);
    }
    .topText .textTop {
      color: #fff;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.1;
    }
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    .rightLeft {
      color: #fff;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: 500;
      min-width: 0;
      text-align: right;
      .fw-num {
        display: inline-block;
      }
    }
    .rightBox {
      height: auto;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .rightRight {
        background: transparent !important;
        min-width: 0;
        max-width: 100px;
        margin-left: 0;
        padding: 3px 8px;
        border-radius: 6px;
        font-family: 'PingFang SC', -apple-system, sans-serif;
        font-size: 12px;
        font-weight: 400;
        height: auto;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        line-height: 1;

        &::before {
          content: '';
          width: 8px;
          height: 10px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          display: inline-block;
        }
        &.rise {
          background: rgba(46, 189, 133, 0.15) !important;
          color: #2ebd85 !important;
          &::before {
            background-image: url('@/assets/images/gxpex/home/arrow-up.png');
          }
        }
        &.fall {
          background: rgba(246, 70, 93, 0.15) !important;
          color: #f6465d !important;
          &::before {
            background-image: url('@/assets/images/gxpex/home/arrow-down.png');
          }
        }
        &.draw {
          background: rgba(125, 145, 157, 0.15) !important;
          color: #7d919d !important;
          &::before {
            display: none;
          }
        }
      }
    }
  }
}

.quote-sheet-body :deep(.currentCoinListStyle) {
  padding-bottom: 0;
}
</style>
