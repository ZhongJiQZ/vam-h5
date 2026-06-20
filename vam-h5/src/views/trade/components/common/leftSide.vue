<template>
  <div class="leftSide">
    <div class="search">
      <svg-load name="sousuo-h" class="searchImg"></svg-load>
      <div class="contain">
        <input
          type="text"
          v-model.trim="searchName"
          class="inputSearch"
          :placeholder="_t18('search_currency')"
          @input="searchBtn"
        />
      </div>
    </div>
    <Filter :list="currentCoinList" @toSort="toSort"></Filter>
    <div class="leftList">
      <div v-if="currentList.length">
        <CurrencyItem
          v-for="(item, index) in filterKeyCoin(currentList, searchName)"
          :key="index"
          :currencyItem="item"
          :showLeftImg="['fx'].includes(_getConfig('_APP_ENV')) ? true : false"
          @click="linkTo(item)"
        ></CurrencyItem>
      </div>
      <Nodata v-else></Nodata>
    </div>
  </div>
</template>

<script setup>
import Filter from './filter.vue'
import { filterKeyCoin } from '@/utils/filters'
import CurrencyItem from '@/components/CurrencyList/currencyItem.vue'
import { _t18 } from '@/utils/public'
import { useMainStore } from '@/store/index'
const mainStore = useMainStore()
import { useTradeStore } from '@/store/trade'

const tradeStore = useTradeStore()
import { computed } from 'vue'
import { dispatchCustomEvent } from '@/utils'

import { useRouter, useRoute } from 'vue-router'
const $router = useRouter()
const $route = useRoute()
const props = defineProps({
  headerList: {
    type: Array,
    default: () => []
  },
  /** 与 PLAYING_SETTING 一致，避免仅靠 tradeFlag 推算时 temp 为空导致白屏 */
  marketTab: {
    type: String,
    default: ''
  }
})
/**
 * 搜索
 */
const searchName = ref('')
/**
 * 币种列表
 */
const currentList = ref([])
const currentCoinList = computed(() => {
  let tempList = []
  if (props.marketTab === 'secondContract') {
    tempList = tradeStore.secondContractCoinList || []
  } else if (props.marketTab === 'spot') {
    tempList = tradeStore.spotCoinList || []
  } else if (props.marketTab === 'contract') {
    tempList = tradeStore.contractCoinList || []
  } else if ($route.query.type) {
    if ($route.query.type == 1) {
      tempList = tradeStore.spotCoinList
    } else if ($route.query.type == 2) {
      tempList = tradeStore.contractCoinList
    }
  } else {
    if ($route.path == '/tradeU') {
      tempList = tradeStore.contractCoinList
    } else if ($route.path == '/tradeBB') {
      tempList = tradeStore.spotCoinList
    } else {
      const len = props.headerList?.length || 0
      const raw = mainStore.tradeFlag
      let listIdx = 0
      if (raw !== '' && raw !== undefined && raw !== null && len > 0) {
        const tf = Number(raw)
        if (Number.isFinite(tf) && tf >= 0) {
          listIdx = !mainStore.isOption
            ? Math.min(tf, len - 1)
            : tf <= 0
              ? 0
              : Math.min(tf - 1, len - 1)
        }
      }
      const temp = props.headerList?.[listIdx]
      if (temp?.currentTab == 'secondContract') {
        tempList = tradeStore.secondContractCoinList
      } else if (temp?.currentTab == 'spot') {
        tempList = tradeStore.spotCoinList
      } else if (temp?.currentTab == 'contract') {
        tempList = tradeStore.contractCoinList
      }
    }
  }

  currentList.value = tempList
  return tempList
})
/** 点击每一项 */
const emit = defineEmits(['linkTo', 'close'])
const linkTo = (item) => {
  let type = ''
  if ($route.query.type == 1) {
    type = 'spot'
  } else if ($route.query.type == 2) {
    type = 'contract'
  }
  if (!$route.query.type) {
    $router.replace(`${$route.path}?symbol=${item.coin}`)
  } else {
    $router.replace(`${$route.path}?symbol=${item.coin}&type=${$route.query.type}`)
  }
  dispatchCustomEvent('event_tradeSymbolChange', {
    type: type,
    symbol: item.symbol,
    coin: item.coin,
    coinInfo: item
  })

  emit('close')
  emit('linkTo', item.coin)
}
const toSort = (v) => {
  currentList.value = v
}
</script>

<style lang="scss" scoped>
.leftSide {
  /* 搜索贴顶，下间距收紧 */
  .search {
    margin: 10px 10px 4px;
    height: 32px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    display: flex;
    padding: 0 10px;
    align-items: center;
    .searchImg {
      width: 12px;
      height: 12px;
      margin-right: 6px;
      opacity: 0.55;
    }
    .contain {
      flex: 1;
      display: flex;
      align-items: center;
      font-size: 11px;
      color: #f5f3f8;
      .inputSearch {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #f5f3f8;
        font-size: 11px;
        width: 100%;
      }
      input::-webkit-input-placeholder { color: rgba(255, 255, 255, 0.4); }
      input::-moz-input-placeholder { color: rgba(255, 255, 255, 0.4); }
      input::-ms-input-placeholder { color: rgba(255, 255, 255, 0.4); }
    }
  }

  /* 列头：trade 共用 filter.vue 用 .mainBgc/.main/.mainItem 类，3 列 grid 对齐 */
  :deep(.mainBgc) {
    background: transparent !important;
  }
  :deep(.main_collect) {
    background: transparent !important;
    padding: 0 !important;
  }
  :deep(.main_collect .main) {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto 60px !important;
    gap: 0 12px !important;
    padding: 4px 12px 8px !important;
    background: transparent !important;
    align-items: center;
  }
  :deep(.main_collect .mainItem) {
    font-size: 10px !important;
    color: rgba(255, 255, 255, 0.55) !important;
    flex: none !important;
    margin: 0 !important;
    max-width: none !important;
    min-width: 0 !important;
    white-space: nowrap;
    > div:first-child { white-space: nowrap; }
  }
  :deep(.main_collect .mainItem:nth-child(1)) {
    justify-content: flex-start !important;
    text-align: left !important;
  }
  :deep(.main_collect .mainItem:nth-child(2)) {
    justify-content: flex-end !important;
    text-align: right !important;
  }
  :deep(.main_collect .mainItem:nth-child(3)) {
    justify-content: flex-end !important;
    text-align: right !important;
  }
  :deep(.main_collect .mainItem .arrows) {
    margin-left: 4px;
    .itemImg { width: 5px; height: 7px; }
  }

  /* 币种行：grid 3 列对齐头 (用 display:contents 展平 .right/.rightBox) */
  :deep(.currencyItem) {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto 60px !important;
    gap: 0 12px;
    align-items: center;
    padding: 7px 12px !important;
    margin: 0 !important;
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
  }
  :deep(.currencyItem .right),
  :deep(.currencyItem .rightBox) {
    display: contents !important;
  }
  :deep(.currencyItem .left) {
    display: flex;
    align-items: center;
    min-width: 0;
    .leftImg {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
    .topText .textTop {
      font-size: 12px !important;
    }
  }
  :deep(.currencyItem .rightLeft) {
    text-align: right;
    font-size: 12px !important;
    color: #f5f3f8;
    font-variant-numeric: tabular-nums;
  }
  :deep(.currencyItem .rightRight) {
    width: 60px !important;
    max-width: 60px !important;
    min-width: 0 !important;
    margin-left: 0 !important;
    padding: 2px 6px !important;
    font-size: 10px !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :deep(.currencyItem:last-child) {
    border-bottom: none !important;
  }
}
</style>
