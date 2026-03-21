<!-- 行情——>秒合约 quoteSecondContract.vue -->
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
import { useTradeStore } from '@/store/trade'
import { useRouter } from 'vue-router'

const props = defineProps({
  searchName: {
    type: String
  },
  // componentName: {
  //   type: String
  // }
})
const tradeStore = useTradeStore()

// 永远从 store 取最新
const storeList = computed(() => tradeStore.secondContractCoinList || [])
const allPrice = computed(() => tradeStore.allCoinPriceInfo || {})

// 合成“渲染用列表”
const displayList = computed(() => {
  return storeList.value.map((item) => {
    const p = allPrice.value[item.coin] || {}
    return {
      ...item,
      // 用 socket 的最新数据覆盖/补齐
      amount: p.close ?? item.amount,                // 最新价
      close: p.close ?? item.close,
      change: p.change ?? item.change,
      priceChangePercent: p.priceChangePercent ?? item.priceChangePercent,
      high24: p.high24 ?? item.high24,
      low24: p.low24 ?? item.low24,
      volume24: p.volume24 ?? item.volume24
    }
  })
})

// Filter 用的 list
const currentCoinList = computed(() => displayList.value)

// 排序结果（Filter吐出的数组）
const sortedList = ref(null)

// 真正用于渲染
const currentList = computed(() => sortedList.value ?? displayList.value)

const toSort = (v) => {
  sortedList.value = Array.isArray(v) ? v : []
}

// store 列表刷新后，如果你不想保留旧排序，可取消注释
watch(storeList, () => {
  // if (sortedList.value != null) sortedList.value = null
})

// 进入 tab 强制拉取（action 名字按你 store 改）
async function ensureFresh() {
  // await tradeStore.fetchSecondContractCoinList?.({ force: true })
  // await tradeStore.getCoinList?.({ force: true })
}

onMounted(ensureFresh)
onActivated(ensureFresh)

const router = useRouter()
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
