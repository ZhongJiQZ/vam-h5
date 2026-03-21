<!-- 行情——>币币交易 quoteBBTrading.vue -->
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
import { filterKeyCoin} from '@/utils/filters'
import Filter from './common/filter.vue'
import CurrencyItem from '@/components/CurrencyList/currencyItem.vue'
import { useTradeStore } from '@/store/trade'
import { onMounted } from 'vue'
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
const router = useRouter()

const storeList = computed(() => tradeStore.spotCoinList || [])
const currentCoinList = computed(() => storeList.value)

const sortedList = ref(null)
const currentList = computed(() => sortedList.value ?? storeList.value)

const toSort = (v) => {
  sortedList.value = Array.isArray(v) ? v : []
}

watch(storeList, () => {
  // if (sortedList.value != null) sortedList.value = null
})

// 进入 tab 强制拉取（action 名字按你 store 改）
async function ensureFresh() {
  // await tradeStore.getCoinList?.({ force: true })
  // await tradeStore.fetchSpotCoinList?.({ force: true })
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
