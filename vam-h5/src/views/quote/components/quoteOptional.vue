<!-- 行情——>自选 quoteOptional.vue -->
<template>
  <div class="quote-optional">
    <Filter
      :isOptional="isOptional && collectList?.length > 0"
      :list="collectList"
      @toSort="toSort"
    />
    <div v-if="collectList?.length > 0" class="quote-optional__list">
      <CollectItem
        v-for="(item, index) in filterKeyCoin(collectList, searchName, 2)"
        :key="item.coinKey || item.id || index"
        :collectItem="item"
        @click="linkTo(item)"
      >
      </CollectItem>
      <div class="quote-optional__add-more">
        <button
          type="button"
          class="quote-optional__add-btn"
          @click="$router.push('/addOptional')"
        >
          +{{ _t18(`quote_addOwn`) }}
        </button>
      </div>
    </div>
    <div v-else class="quote-optional__empty">
      <img :src="noDataImg" alt="" class="quote-optional__empty-img" />
      <div class="quote-optional__empty-text">{{ _t18(`no_data`) }}</div>
      <button
        type="button"
        class="quote-optional__empty-btn"
        @click="$router.push('/addOptional')"
      >
        +{{ _t18(`quote_addOwn`) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { filterKeyCoin } from '@/utils/filters'
import Filter from './common/filter.vue'
import CollectItem from './common/collectItem.vue'
import noDataImg from '@/assets/images/gxpex/quote/empty-watchlist.png'
import { getCollect } from '@/api/trade'
import { onMounted } from 'vue'
import { useUserStore } from '@/store/user'
const props = defineProps({
  searchName: {
    type: String
  },
  componentName: {
    type: String
  }
})
const isOptional = ref(true)
// 自选列表
const collectList = ref([])

const getCollectList = async () => {
  const res = await getCollect()
  if (res.code === 200) {
    collectList.value = Array.isArray(res.data) ? res.data : []
  } else {
    collectList.value = []
  }
}
const userStore = useUserStore()
onMounted(() => {
  if (userStore.isSign) {
    getCollectList()
  }
})
const toSort = (v) => {
  collectList.value = Array.isArray(v) ? v : []
}

import { useRouter } from 'vue-router'
const router = useRouter()
// const linkTo=(item)=>{
//   router.push(`/trade?symbol=${item.coin}`)
// }
const linkTo = (item) => {
  router.push({
    path: '/trade',
    query: {
      symbol: item.coin,
      componentName: 'Ustandard',
    },
  })
}
</script>

<style lang="scss" scoped>
.quote-optional {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.quote-optional__list {
  flex: 1;
  min-height: 0;
}

.quote-optional__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 24px 48px;
  box-sizing: border-box;
}

.quote-optional__empty-img {
  width: 220px;
  height: auto;
  display: block;
  opacity: 0.95;
}

.quote-optional__empty-text {
  margin-top: 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
}

.quote-optional__empty-btn {
  margin-top: 24px;
  width: 100%;
  max-width: 280px;
  height: 44px;
  border: 1px solid #9f40ec;
  border-radius: 999px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #9e40eb;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.quote-optional__add-more {
  display: flex;
  justify-content: center;
  padding: 8px 24px 24px;
}

.quote-optional__add-btn {
  width: 100%;
  max-width: 280px;
  height: 44px;
  border: 1px solid #9f40ec;
  border-radius: 999px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #9e40eb;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>
