<!-- 交易页面：秒合约，币币交易，U本位 trade/index.vue -->
<template>
  <div class="trade-page">
    <!-- 紫色高斯光晕背景 (与 quote 一致) -->
    <div class="bg-glow bg-glow--1"></div>
    <div class="bg-glow bg-glow--2"></div>

    <van-sticky>
      <div class="trade-header">
        <!-- 顶部条：back + "Trade" 居中 -->
        <div class="trade-topbar">
          <div class="trade-topbar__back" @click="_back()">
            <img :src="iconBack" alt="back" class="trade-topbar__back-icon" />
          </div>
          <div class="trade-topbar__title">{{ _t18('trade') }}</div>
        </div>

        <!-- tabs 行：秒/币/U本位 -->
        <div class="trade-tabs">
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
    </van-sticky>

    <!-- 主内容 -->
    <div class="trade-sheet">
      <component :is="currentComponent" :headerList="headerList"></component>
    </div>
  </div>
</template>

<script setup>
import { watch, computed, onMounted, ref } from 'vue'
import { useMainStore } from '@/store/index'
const mainStore = useMainStore()
import { useTradeStore } from '@/store/trade'
const tradeStore = useTradeStore()
import { useRoute } from 'vue-router'
const $route = useRoute()
import { _t18 } from '@/utils/public'
import SecondContract from './components/tradeSecondContract.vue'//秒合约
import BBTrading from './components/tradeBBTrading.vue'//币币
import Ustandard from './components/tradeUstandard.vue'//U本位合约
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'


// tabs
const headerList = computed(() => {
  let tempList = mainStore.getTradeHeaderList.filter((item, index) => {
    return item.componentName != 'Optional'
  })
  return tempList
})
/**
 * tradeFlag 与行情页子 tab 一致（含自选）：0=自选 1=秒合约 2=币币 3=U本位（开启自选时）
 * 交易页无「自选」：下标 0,1,2 对应 秒/币/U → 写入 store 时为 isOption ? n+1 : n
 */
function quoteTabIndexToTradeListIndex(tf) {
  const isOpt = mainStore.isOption
  const len = headerList.value?.length || 3
  const n = Number(tf)
  if (!Number.isFinite(n) || n < 0) return 0
  if (!isOpt) return Math.min(n, len - 1)
  return n <= 0 ? 0 : Math.min(n - 1, len - 1)
}

function readInitialTradeListIndex() {
  const raw = mainStore.tradeFlag
  if (raw === '' || raw === undefined || raw === null) {
    return 0
  }
  return quoteTabIndexToTradeListIndex(raw)
}

const currentIndex = ref(0)

const COMPONENT_MAP = {
  SecondContract,
  BBTrading,
  Ustandard,
}

// 切换组件
const currentComponent = computed(() => {
  const name = headerList.value?.[currentIndex.value]?.componentName
  return COMPONENT_MAP[name] || SecondContract
})

const isAutoSwitching = ref(false)

function persistTradeFlagFromListIndex(listIndex) {
  if (!mainStore.isOption) {
    mainStore.setTradeFlag(listIndex)
    return
  }
  if (listIndex === 0) {
    // 与行情「自选」同为交易页第 0 个 tab：store 为 0 时不覆盖（仍为自选）
    if (Number(mainStore.tradeFlag) === 0) return
    mainStore.setTradeFlag(1)
    return
  }
  mainStore.setTradeFlag(listIndex + 1)
}

//SecondContract,BBTrading,Ustandard
function setIndexByComponentName(componentName) {
  const idx = headerList.value.findIndex((h) => h.componentName === componentName)
  if (idx >= 0 && idx !== currentIndex.value) {
    isAutoSwitching.value = true
    currentIndex.value = idx
    setTimeout(() => (isAutoSwitching.value = false), 0)
  }
}

watch(
  () => $route.query.componentName,
  (name) => {
    if (typeof name === 'string' && name) {
      setIndexByComponentName(name)
    }
  },
  { immediate: true }
)

watch(
  headerList,
  () => {
    // 优先按 URL query.componentName 定位；否则回读 store.tradeFlag
    const queryName = $route.query.componentName
    if (typeof queryName === 'string' && queryName) {
      setIndexByComponentName(queryName)
      return
    }
    currentIndex.value = readInitialTradeListIndex()
  },
  { immediate: true }
)

watch(currentIndex, (n) => {
  persistTradeFlagFromListIndex(n)
  if (!isAutoSwitching.value) {
    tradeStore.getCoinList()
  }
})

onMounted(() => {
  tradeStore.getCoinList()
})
</script>

<style lang="scss" scoped>
.trade-page {
  position: relative;
  min-height: 100vh;
  background: #111216;
  box-sizing: border-box;
  overflow-x: hidden;

  /* GXPEX 暗紫主题 — 3 个 mode (U本位/秒合约/币币) 共用，沿 DOM 继承 */
  --page-bg: #111216;
  --panel-bg: #211b32;
  --input-bg: #181326;
  --input-bg-hover: #1c162b;
  --text-primary: #f5f3f8;
  --text-secondary: #aaa5b3;
  --text-disabled: #625d6d;
  --buy-color: #31c48d;
  --sell-color: #ff435d;
  --ask-color: #ff5968;
  --bid-color: #5fc692;
  --purple: #a13cff;
  --divider: rgba(255, 255, 255, 0.09);

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Microsoft YaHei', sans-serif;
  color: var(--text-primary);

  --ex-default-font-color: var(--text-primary);
  --ex-passive-font-color: var(--text-secondary);
  --ex-font-color: var(--text-primary);
  --ex-font-color1: var(--text-disabled);
  --ex-font-color2: var(--purple);
  --ex-font-color6: var(--text-primary);
  --ex-font-color9: var(--text-primary);
  --ex-font-color10: var(--text-primary);
  --ex-font-color21: var(--text-secondary);
  --ex-font-color22: var(--text-primary);
  --ex-active-font-color: var(--purple);
  --ex-tip-font-color: var(--sell-color);
  --ex-border-color: rgba(255, 255, 255, 0.07);
  --ex-border-color5: rgba(255, 255, 255, 0.07);

  --ex-default-background-color: transparent;
  --ex-div-bgColor: var(--input-bg);
  --ex-div-bgColor1: var(--buy-color);
  --ex-div-bgColor2: var(--input-bg);
  --ex-div-bgColor3: rgba(255, 255, 255, 0.18);
  --ex-div-bgColor4: var(--purple);
  --ex-div-bgColor5: var(--input-bg);
  --ex-div-bgColor7: rgba(239, 86, 101, 0.18);
  --ex-div-bgColor8: transparent;
  --ex-div-bgColor10: var(--divider);
  --ex-div-bgColor12: var(--input-bg);
  --ex-div-bgColor19: rgba(0, 0, 0, 0.6);
  --ex-div-bgColor21: rgba(161, 60, 255, 0.16);
  --ex-div-bgColor29: rgba(161, 60, 255, 0.18);

  --ex-rfd-rise-bg: rgba(49, 196, 141, 0.18);
  --ex-rfd-fall-bg: rgba(255, 67, 93, 0.18);
  --ex-rfd-draw-bg: rgba(125, 145, 157, 0.15);
  --ex-rfd-rise: var(--bid-color);
  --ex-rfd-fall: var(--ask-color);
  --ex-rfd-draw: #7d919d;
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

.trade-header {
  position: relative;
  z-index: 2;
  background: transparent;
  padding-top: env(safe-area-inset-top);
}

/* 顶部条：back + 居中标题 (≈ 68px 高) */
.trade-topbar {
  position: relative;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;

  &__back {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  &__back-icon {
    width: 12px;
    height: 22px;
    opacity: 0.9;
  }

  &__title {
    font-family: 'Inter', 'PingFang SC', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #f5f3f8;
    line-height: 1.2;
    text-align: center;
  }
}

/* tabs */
.trade-tabs {
  padding: 4px 14px 12px;

  :deep(.van-tabs__wrap) {
    height: 44px;
    background: transparent;
  }

  :deep(.van-tabs__nav) {
    background: transparent;
    padding: 0 4px;
  }

  :deep(.van-tab) {
    flex: none;
    font-size: 14px;
    margin-right: 22px;
    padding: 0;
    background: transparent;
    color: #aaa5b3 !important;
  }

  :deep(.van-tab:last-child) {
    margin-right: 0;
  }

  :deep(.van-tab--active) {
    font-weight: 600;
    color: #f5f3f8 !important;
  }

  :deep(.van-tabs__line) {
    display: none;
  }
}

.trade-sheet {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 104px - env(safe-area-inset-top));

  /* 通用暗色补丁 — 3 个 mode 共享 */
  :deep(.listBox),
  :deep(.van-list),
  :deep(.noData),
  :deep(.entrust),
  :deep(.entrustR) {
    background: transparent !important;
  }

  /* 订单区两侧 padding 18 — 顶部 tab 行和图标都更松 */
  :deep(.orderBox) {
    padding: 4px 18px 24px !important;
    position: relative;
  }

  /* 交易页空状态换成自选页那张 Figma 占位图 */
  :deep(.noData) {
    position: relative;
    padding: 30px 0 50px !important;
  }
  :deep(.noData .noDatAimg) {
    display: none !important;
  }
  :deep(.noData::before) {
    content: '';
    display: block;
    width: 160px;
    height: 120px;
    margin: 0 auto 12px;
    background-image: url('@/assets/images/gxpex/quote/empty-watchlist.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
  :deep(.noData .noName) {
    color: rgba(255, 255, 255, 0.55) !important;
    font-size: 13px !important;
    margin-top: 4px !important;
  }
  :deep(.van-cell) {
    background: transparent !important;
  }
  :deep(.van-tabs__wrap),
  :deep(.van-tabs__nav) {
    background: transparent !important;
  }

  /* 订单 tabs 通用样式：tab 字 + 紫色短下划线 */
  :deep(.bb-order-tabs .van-tab),
  :deep(.sc-order-tabs .van-tab),
  :deep(.us-order-tabs .van-tab) {
    color: rgba(255, 255, 255, 0.55) !important;
    background: transparent !important;
    font-size: 13px !important;
    margin-right: 16px !important;
    padding: 0 !important;
    flex: none !important;
  }
  :deep(.bb-order-tabs .van-tab--active),
  :deep(.sc-order-tabs .van-tab--active),
  :deep(.us-order-tabs .van-tab--active) {
    color: #f5f3f8 !important;
    font-weight: 600;
  }
  :deep(.bb-order-tabs .van-tabs__line),
  :deep(.sc-order-tabs .van-tabs__line) {
    background: #a13cff !important;
    width: 18px !important;
    height: 3px !important;
    border-radius: 2px;
    bottom: 2px;
  }
  /* BB/SC tabs 限制 80% 宽，给右侧 20% 留图标区 */
  :deep(.bb-order-tabs .van-tabs__wrap),
  :deep(.sc-order-tabs .van-tabs__wrap) {
    width: 80% !important;
    overflow: hidden !important;
    height: 36px !important;
  }
  :deep(.bb-order-tabs .van-tabs__nav),
  :deep(.sc-order-tabs .van-tabs__nav) {
    padding-left: 0 !important;
    padding-right: 0 !important;
    background: transparent !important;
  }
  /* tab_right 透明，右 12px 间距，18×18 Figma 图标 */
  :deep(.bb-order-tabs ~ .tab_right),
  :deep(.sc-order-tabs ~ .tab_right) {
    position: absolute !important;
    top: 4px !important;
    right: 12px !important;
    padding: 0 !important;
    z-index: 5;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end;
    gap: 14px;
    height: 28px;
    background: transparent !important;
    border: none !important;
    .entrustRImg {
      width: 18px;
      height: 18px;
      padding: 0;
      opacity: 0.75;
      cursor: pointer;
      transition: opacity 0.18s ease;
      box-sizing: content-box;
    }
    .entrustRImg:hover { opacity: 1; }
    .entrustRImg--off { opacity: 0.35; }
  }
}
</style>
