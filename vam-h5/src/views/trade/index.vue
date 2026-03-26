<!-- 交易页面：秒合约，币币交易，U本位 trade/index.vue -->
<template>
  <div class="trade-page">
    <!-- tabs：深色顶栏 -->
    <van-sticky>
      <div class="headerList darkheader">
        <div class="left">
          <svg-load name="jiantou-z" class="leftImg" @click="_back()"></svg-load>
        </div>
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
            <van-tab v-for="(item, index) in headerList" :key="index" :title="item.title">
            </van-tab>
          </van-tabs>
        </div>
      </div>
    </van-sticky>
    <!-- 主内容：白底圆角承接深色头 -->
    <div class="trade-sheet">
      <component
        :is="currentComponent"
        :headerList="headerList"
      ></component>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { _t18 } from '@/utils/public'
import { useMainStore } from '@/store/index'
const mainStore = useMainStore()
import { useTradeStore } from '@/store/trade'
const tradeStore = useTradeStore()
import { useRoute } from 'vue-router'
const $route = useRoute()
import { computed, onMounted } from 'vue'

import SecondContract from './components/tradeSecondContract.vue'//秒合约
import BBTrading from './components/tradeBBTrading.vue'//币币
import Ustandard from './components/tradeUstandard.vue'//U本位合约 


// tabs
const headerList = computed(() => {
  let tempList = mainStore.getTradeHeaderList.filter((item, index) => {
    return item.componentName != 'Optional'
  })
  return tempList
})
const currentIndex = ref(
  mainStore.tradeFlag - mainStore.isOption < 0 ? 0 : mainStore.tradeFlag - mainStore.isOption
)

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

//SecondContract,BBTrading,Ustandard
function setIndexByComponentName(componentName) {
  const idx = headerList.value.findIndex((h) => h.componentName === componentName)
  if (idx >= 0 && idx !== currentIndex.value) {
    isAutoSwitching.value = true
    currentIndex.value = idx
    // nextTick 后再放开，避免某些 watch 里重复触发
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
  currentIndex,
  (n) => {
    mainStore.setTradeFlag(n)
    if (!isAutoSwitching.value) {
      tradeStore.getCoinList()
    }
  },
  { immediate: true }
)

onMounted(()=>{
  tradeStore.getCoinList()
  // console.log("$route.query.symbol",$route.query.symbol);
})
</script>

<style lang="scss" scoped>
.trade-page {
  min-height: 100vh;
  background: #0b1118;
  box-sizing: border-box;
}

.headerList {
  display: flex;
  align-items: center;
  z-index: 9;
  padding-left: 15px;
  padding-right: 12px;
  padding-top: env(safe-area-inset-top);
  height: calc(60px + env(safe-area-inset-top));
  box-sizing: border-box;
  border-bottom: none;

  &.darkheader {
    background: #0b1118;
  }

  .left {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    font-size: 16px;
    font-weight: normal;
    color: #fff;

    .leftImg {
      width: 16px;
      height: 12px;
      margin-right: 12px;
      filter: brightness(0) invert(1);
    }
  }

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
      font-weight: 500;
      color: #ffffff !important;
    }

    :deep(.van-tabs__line) {
      display: none;
    }
  }
}

.trade-sheet {
  background: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  min-height: calc(100vh - 60px - env(safe-area-inset-top));
  overflow: hidden;
}
</style>
