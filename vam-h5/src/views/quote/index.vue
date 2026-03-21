<!-- 行情页面：自选，秒合约，币币交易，U本位 -->
<template>
  <div>
    <!-- 搜索 -->
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
    <!-- tabs -->

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
        background="var(--ex-div-bgColor8)"
      >
        <van-tab v-for="(item, index) in headerList" :key="index" :title="item.title">
          <!-- <component :is="currentComponent" :searchName="searchName"></component> -->
          <component 
            :componentName="item.componentName"
            :is="getTabComponent(item.componentName)" 
            :key="item.componentName + '-' + currentIndex"
            :searchName="searchName" 
          />
        </van-tab>
      </van-tabs>
    </div>
    <!-- tab -->
  </div>
</template>

<script setup>
import { _t18 } from '@/utils/public'
import { useMainStore } from '@/store/index' 
import { useTradeStore } from '@/store/trade'
const mainStore = useMainStore()
const tradeStore = useTradeStore()

import { computed } from 'vue'
import QuoteOptional from './components/quoteOptional.vue'//自选
import SecondContract from './components/quoteSecondContract.vue'//秒合约
import BBTrading from './components/quoteBBTrading.vue'//币币
import Ustandard from './components/quoteUstandard.vue'//U本位
// 搜索
const searchName = ref('')
const searchBtn = () => {}
// tabs
const headerList = computed(() => mainStore.getTradeHeaderList)

const currentIndex = ref(mainStore.tradeFlag + mainStore.isOption)
//const currentIndex = ref(mainStore.tradeFlag)
// 用映射表最稳
const componentMap = {
  QuoteOptional,
  SecondContract,
  BBTrading,
  Ustandard
}

// 切换组件
const getTabComponent = (name) => componentMap[name] || QuoteOptional

// 关键：根据 tab 拉不同数据（示例：你自己按实际 store action 改）
async function fetchByTab(index) {
  const tab = headerList.value?.[index]?.componentName
  await tradeStore.getCoinList(); //单个vue组件查
}

// 进入行情页就拉一次（强制）
onMounted(() => {
  fetchByTab(currentIndex.value)
})

// 如果这个页面被 keep-alive 缓存，返回时也要拉一次
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
// 搜索
.search {
  padding: 20px 15px 10px;

  .searchBtn {
    height: 34px;
    background: var(--ex-div-bgColor22);
    border-radius: 20px 20px 20px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    .searchLeft {
      width: 12px;
      height: 12px;
      margin-right: 10px;
      margin-top: -1.5px;
    }

    .searchInput {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      background: transparent;
      flex: 1;
      color: var(--ex-font-color12);
    }

    input::-webkit-input-placeholder {
      color: var(--ex-font-color12);
    }

    input::-moz-input-placeholder {
      color: var(--ex-font-color12);
    }

    input::-ms-input-placeholder {
      color: var(--ex-font-color12);
    }
  }
}
.headerChoose {
  :deep(.van-tabs__nav) {
    background: var(--ex-div-bgColor8) !important;
  }
  :deep(.van-tab) {
    flex: none;
    font-size: 14px;
    margin-right: 30px;
    padding: 0;
    color: var(--ex-home-list-ftcolor) !important;
    background: var(--ex-div-bgColor8) !important;
  }
  :deep(.van-tab--active) {
    font-weight: normal;
    color: var(--ex-home-list-ftcolor3) !important;
  }
}
</style>
