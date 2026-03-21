<!-- 行情——>U本位 -->
<template>
  <div>
    <Filter :list="currentCoinList" @toSort="toSort" />
    <div v-if="currentList.length" class="currentCoinListStyle">
      <CurrencyItem
        v-for="(item, index) in filterKeyCoin(currentList, searchName)"
        :key="index"
        :currencyItem="item"
        @click="linkTo(item)"
      >
      </CurrencyItem>
    </div>
  </div>
</template>

<script setup>
import { filterKeyCoin } from '@/utils/filters'
import Filter from './common/filter.vue'
import CurrencyItem from '@/components/CurrencyList/currencyItem.vue'
import { useMainStore } from '@/store/index'
import { useRouter } from 'vue-router'
const router = useRouter()

const mainStore = useMainStore()
import { useTradeStore } from '@/store/trade'
const tradeStore = useTradeStore()
const props = defineProps({
  searchName: {
    type: String
  },
  // componentName: {
  //   type: String
  // }
})
// 1) 永远从 store 读最新列表
const storeList = computed(() => tradeStore.contractCoinList || [])
const allPrice = computed(() => tradeStore.allCoinPriceInfo || {})

// 合成“渲染用列表”
const displayList = computed(() => {
  return storeList.value.map((item) => {
    // 优先按 symbol 找，其次 coin
    const p = allPrice.value[item.symbol] || allPrice.value[item.coin] || {}

    return {
      ...item,
      amount: p.close ?? item.amount,
      close: p.close ?? item.close,
      open: p.openPrice ?? item.open,                     // ✅ 重点：open 用 openPrice 覆盖
      openPrice: p.openPrice ?? item.open,                // 兼容字段
      priceChangePercent: p.priceChangePercent ?? item.priceChangePercent,
      change: p.change ?? item.change,
      high24: p.high24 ?? item.high24,
      low24: p.low24 ?? item.low24,
      volume24: p.volume24 ?? item.volume24
    }
  })
})



// 2) 排序后的列表（Filter组件吐出来的）
const sortedList = ref(null)

// 3) 真正用于渲染的列表：有排序就用排序，否则用 store 最新数据
const currentList = computed(() => sortedList.value ?? displayList.value)

// Filter 用的 list（你如果 Filter 只负责排序 options，也可直接用 storeList）
const currentCoinList = computed(() => displayList.value)


const toSort = (v) => {
  sortedList.value = Array.isArray(v) ? v : []
}

// 当 storeList 变化（接口刷新），如果你没手动排序，就跟随 store 更新
watch(storeList, () => {
  if (sortedList.value == null) return
  // 如果你希望“接口刷新后清空排序结果”，就打开下面这行：
  // sortedList.value = null
})

// 进入该 tab 就拉取（防止只在父组件拉不到的情况）
async function ensureFresh() {
   await tradeStore.getCoinList?.({ force: true })
}

onMounted(ensureFresh)
onActivated(ensureFresh)

// const linkTo=(item)=>{
//   router.push(`/trade?symbol=${item.coin}`)
// }
const linkTo = (item) => {
  router.push({
    path: '/trade',
    query: {
      symbol: item.coin,
      componentName: props.componentName, // 或你当前tab的标识
    },
  })
}

</script>

<style lang="scss" scoped>
.currentCoinListStyle {
  padding-bottom: 74px;
}
</style>
