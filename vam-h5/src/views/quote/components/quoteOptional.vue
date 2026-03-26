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
        :key="index"
        :collectItem="item"
        @click="linkTo(item)"
      >
      </CollectItem>
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
import noDataImg from '@/assets/images/quote/no-data.png'
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
      componentName: item.componentName, // 或你当前tab的标识
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
  width: 160px;
  height: auto;
  display: block;
}

.quote-optional__empty-text {
  margin-top: 16px;
  font-size: 14px;
  color: #8b9099;
}

.quote-optional__empty-btn {
  margin-top: 24px;
  width: 100%;
  max-width: 280px;
  height: 48px;
  border: none;
  border-radius: 999px;
  background: #0b1118;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>
