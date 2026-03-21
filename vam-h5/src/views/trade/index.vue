<!-- 交易页面：秒合约，币币交易，U本位 trade/index.vue -->
<template>
  <div>
    <!-- tabs -->
    <van-sticky>
      <div class="headerList">
        <div class="left">
          <svg-load name="jiantou-z" class="leftImg" @click="_back()"></svg-load>
        </div>
        <div class="headerChoose">
          <van-tabs
            swipeable
            shrink
            :swipe-threshold="2"
            v-model:active="currentIndex"
            line-width="20"
            line-height="2"
            color="#17ac74"
            title-active-color="#17AC74"
            title-inactive-color="#5d626d"
          >
            <van-tab v-for="(item, index) in headerList" :key="index" :title="item.title">
            </van-tab>
          </van-tabs>
        </div>
      </div>
    </van-sticky>
    <!-- tab -->
    <component
      :is="currentComponent"
      :headerList="headerList"
    ></component>
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
.headerList {
  height: 60px;
  border-bottom: 1px solid var(--ex-border-color);
  display: flex;
  align-items: center;
  background: var(--ex-home-list-bgcolor);
  z-index: 9;
  padding-left: 15px;

  .left {
    display: flex;
    font-size: 16px;
    font-weight: normal;
    color: var(--ex-default-font-color);

    .leftImg {
      width: 16px;
      height: 12px;
      margin-right: 15px;
    }
  }

  .headerChoose {
    display: flex;
    padding: 0 15px 0 0;
    background: var(--ex-home-list-bgcolor);

    :deep(.van-tabs__wrap) {
      height: 59px;
    }

    :deep(.van-tabs__nav) {
      background: var(--ex-home-list-bgcolor);
    }

    :deep(.van-tab) {
      flex: none;
      font-size: 16px;
      margin-right: 30px;
      padding: 0;
      color: var(--ex-home-list-ftcolor) !important;
      background: var(--ex-home-list-bgcolor);
    }

    :deep(.van-tab--active) {
      font-weight: normal;
      color: var(--ex-home-list-ftcolor3) !important;
    }
  }
}
</style>
