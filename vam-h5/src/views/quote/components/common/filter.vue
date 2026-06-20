<!-- 列表头：Section 标题 (Spot/自选) + 2 列排序 (Name / Price·Change) -->
<template>
  <div class="market-filter">
    <!-- Section 标题行 (自选时展示「Spot」+ 右侧编辑/筛选入口) -->
    <div class="market-filter__section" v-if="isOptional">
      <div class="market-filter__section-title">{{ _t18(`quote_spot`) }}</div>
      <div
        class="market-filter__section-action"
        @click="$router.push('/editOptional')"
      >
        <img :src="iconFilter" alt="" class="market-filter__section-icon" />
      </div>
    </div>

    <!-- 列头：Name / Price·Change (2 列) -->
    <div class="market-filter__cols">
      <div class="market-filter__col market-filter__col--name" @click="toDealSort">
        <span>{{ _t18(`home_currencyName`, ['latcoin']) || 'Name' }}</span>
        <span class="market-filter__arrows">
          <svg-load v-if="arrowList.firstIcon === 0" name="moren" class="itemImg"></svg-load>
          <svg-load v-if="arrowList.firstIcon === 1" name="gao" class="itemImg"></svg-load>
          <svg-load v-if="arrowList.firstIcon === 2" name="di" class="itemImg"></svg-load>
        </span>
      </div>
      <div class="market-filter__col market-filter__col--price" @click="togglePriceChangeSort">
        <span>{{ _t18(`home_newPrice`, ['latcoin']) || 'Price' }} / {{ _t18(`home_upDown`, ['latcoin']) || 'Change' }}</span>
        <span class="market-filter__arrows">
          <svg-load v-if="priceChangeIcon === 0" name="moren" class="itemImg"></svg-load>
          <svg-load v-if="priceChangeIcon === 1" name="gao" class="itemImg"></svg-load>
          <svg-load v-if="priceChangeIcon === 2" name="di" class="itemImg"></svg-load>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  letterSmallToLarge,
  letterLargeToSmall,
  LatestpriceLargeToSmall,
  LatestpriceSmallToLarge
} from '@/utils/filters'
import { useTradeStore } from '@/store/trade'
import iconFilter from '@/assets/images/gxpex/quote/icon-filter.svg'
import { _t18 } from '@/utils/public'
const tradeStore = useTradeStore()
const props = defineProps({
  isOptional: {
    type: Boolean,
    default: false
  },
  list: {
    type: Array,
    default: []
  }
})
const listResult = []
const emits = defineEmits(['toSort'])
// 排序状态
let arrowList = reactive({
  firstIcon: 0,
  secondIcon: 0,
  thirdIcon: 0
})

// 切换名称
const toDealSort = () => {
  arrowList.secondIcon = 0
  arrowList.thirdIcon = 0
  if (arrowList.firstIcon === 0) {
    arrowList.firstIcon = 1
    listResult.value = letterSmallToLarge(props.list, 'coin')
  } else if (arrowList.firstIcon === 1) {
    arrowList.firstIcon = 2
    listResult.value = letterLargeToSmall(props.list, 'coin')
  } else if (arrowList.firstIcon === 2) {
    arrowList.firstIcon = 0
    listResult.value = props.list
  }
  emits('toSort', listResult.value)
}
// 切换最新价
const toUpSort = () => {
  arrowList.firstIcon = 0
  arrowList.thirdIcon = 0
  if (arrowList.secondIcon === 0) {
    arrowList.secondIcon = 1
    listResult.value = LatestpriceLargeToSmall(props.list, tradeStore.allCoinPriceInfo, 'close')
  } else if (arrowList.secondIcon === 1) {
    arrowList.secondIcon = 2
    listResult.value = LatestpriceSmallToLarge(props.list, tradeStore.allCoinPriceInfo, 'close')
  } else if (arrowList.secondIcon === 2) {
    arrowList.secondIcon = 0
    listResult.value = props.list
  }
  emits('toSort', listResult.value)
}
// 切换涨跌
const toRafSort = () => {
  arrowList.firstIcon = 0
  arrowList.secondIcon = 0
  if (arrowList.thirdIcon === 0) {
    arrowList.thirdIcon = 1
    listResult.value = LatestpriceLargeToSmall(props.list, tradeStore.allCoinPriceInfo, 'change', 1)
  } else if (arrowList.thirdIcon === 1) {
    arrowList.thirdIcon = 2
    listResult.value = LatestpriceSmallToLarge(props.list, tradeStore.allCoinPriceInfo, 'change', 1)
  } else if (arrowList.thirdIcon === 2) {
    arrowList.thirdIcon = 0
    listResult.value = props.list
  }
  emits('toSort', listResult.value)
}

// Price/Change 合并成一列后的 4 段循环：默认 → 价↓ → 价↑ → 涨↓ → 涨↑ → 默认
// （沿用原 toUpSort / toRafSort，只是把两次状态推进合并到同一个 header）
const priceChangeIcon = computed(() => {
  if (arrowList.secondIcon !== 0) return arrowList.secondIcon
  if (arrowList.thirdIcon !== 0) return arrowList.thirdIcon
  return 0
})
const togglePriceChangeSort = () => {
  // 先把 price 循环走完，再走 change 循环
  if (arrowList.thirdIcon === 0 && arrowList.secondIcon !== 2) {
    toUpSort()
  } else if (arrowList.thirdIcon === 0 && arrowList.secondIcon === 2) {
    arrowList.secondIcon = 0
    toRafSort()
  } else {
    toRafSort()
  }
}
</script>

<style lang="scss" scoped>
.market-filter {
  background: transparent;
  padding: 4px 12px 0;
}

.market-filter__section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 4px 6px;

  &-title {
    font-family: 'Roboto', 'PingFang SC', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.2;
  }

  &-action {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  &-icon {
    width: 20px;
    height: 20px;
    opacity: 0.8;
  }
}

.market-filter__cols {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px 14px;
}

.market-filter__col {
  font-family: 'PingFang SC', -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1;
  display: flex;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &--price {
    text-align: right;
  }
}

.market-filter__arrows {
  display: inline-flex;
  flex-direction: column;
  margin-left: 4px;

  .itemImg {
    width: 6px;
    height: 8px;
  }
}
</style>
