<template>
  <div>
    <van-tabs
      shrink
      v-model:active="topActive"
      title-inactive-color="#333"
      title-active-color="#17AC74"
      color="#17AC74"
      line-width="16"
      @click-tab="clickTopTab"
    >
      <van-tab :title="_t18('center_myasset')" name="center_myasset" />
      <van-tab :title="_t18('center_order')" name="center_order" />
      <van-tab :title="_t18('center_asset_flow')" name="center_asset_flow" />
    </van-tabs>

    <template v-if="topActive === 'center_myasset'">
      <van-tabs
        shrink
        v-model:active="tabActive"
        title-inactive-color="#333"
        title-active-color="#17AC74"
        color="#17AC74"
        line-width="16"
        @click-tab="clickInnerTab"
      >
        <van-tab
          v-for="(item, index) in tabList"
          :key="index"
          :title="item.title"
          :name="item.key"
        />
      </van-tabs>
      <!-- handleYanjin(handleEye), handleShuaxin(handleRefresh) -->  
      <component
        v-if="currentComp"
        :is="currentComp"
        :amountSum="amountSum"
        :assetDetails="assetDetails"
        :showNum="showNum"
        :type="tabActive"
        @handleYanjin="handleYanjin"
        @handleShuaxin="handleShuaxin"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { _t18 } from '@/utils/public'
import { _add, priceFormat } from '@/utils/decimal'
import Plat from './components/account/platformAccount.vue'//平台资产
import finance from './components/account/financeAccount.vue'//理财资产
import Contarct from './components/account/contarctAccount.vue'//合约资产
// ✅ 直接引入两个页面组件（你截图里同目录：src/views/assets/orderCenter.vue、assetRecord.vue）
import OrderCenter from './orderCenter.vue'
import AssetRecord from './assetRecord.vue'

import { useUserStore } from '@/store/user/index'
import { useMainStore } from '@/store'
import { storeToRefs } from 'pinia'
import { storageDict } from '@/config/dict'
import { showLoadingToast } from 'vant'
import { getFreezeList } from '@/api/user'
import { DIFF_FREEZE_ASSETS } from '@/config/index'

const router = useRouter()
const route = useRoute()

/** 顶部一级 Tab：默认我的资产 */
const topActive = ref('center_myasset')

const clickTopTab = (e) => {
  if (!e?.name) return
  if (e.name === 'center_myasset') return
  if (e.name === 'center_order') router.push('/orderCenter')
  if (e.name === 'center_asset_flow') router.push('/assetRecord')
}
// const clickTopTab = (e) => {
//   if (!e?.name) return
//   topActive.value = e.name // ✅ 只切状态，不跳路由
// }

watch(
  () => route.path,
  (p) => {
    if (p?.includes('/orderCenter')) topActive.value = 'center_order'
    else if (p?.includes('/assetRecord')) topActive.value = 'center_asset_flow'
    else topActive.value = 'center_myasset'
  },
  { immediate: true }
)

const userStore = useUserStore()
const mainStore = useMainStore()

/** ✅ 统一用 key 做逻辑，title 只负责展示 */
const tabList = computed(() => {
  // 你原来的 mainStore.getAssetsTabList 结构不确定，
  // 这里做一层“中文 name -> key”的映射，保证逻辑稳定
  const nameToKey = {
    平台资产: 'plat',
    理财资产: 'finance',//finance
    合约资产: 'contract',
    我的投资: 'invest',
  }

  const list = (mainStore.getAssetsTabList || []).map((item) => {
    const key = item.key || nameToKey[item.name] || item.name
    const title = _t18(item.keyStr, ['latcoin']) // 你原来的翻译逻辑保留
    // console.log("item key:",item.keyStr)
    // console.log("title",title)
    return { ...item, key, title }
  })

  // 追加“我的投资”
  list.push({
    key: 'invest',
    title: _t18('my_invest', ['latcoin']),
    sort: 40,
  })

  return list.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
})

/** ✅ tabActive 默认用 key */
const tabActive = ref(tabList.value[0]?.key || 'plat')

const clickInnerTab = (e) => {
  if (!e?.name) return
  if (e.name === 'invest') {
    router.push('/myInvestment')
    return
  }
  userStore.getUserInfo()
}

const showNum = ref(
  localStorage.getItem(storageDict.EYES) === null
    ? true
    : localStorage.getItem(storageDict.EYES) === 'true'
)

const handleYanjin = () => {
  showNum.value = !showNum.value
  localStorage.setItem(storageDict.EYES, String(showNum.value))
}

const handleShuaxin = () => {
  showLoadingToast({ forbidClick: true, duration: 0 })
  userStore.getUserInfo()
  getAccountFreezeList()
}

const { asset } = storeToRefs(userStore)
const freezeList = ref()

/** ✅ 动态组件映射：避免 v-show 同时挂多个组件 */
const compMap = {
  plat: Plat,
  finance: finance,
  contract: Contarct,
}
const currentComp = computed(() => compMap[tabActive.value] || null)

/** ✅ 资产列表：match 用 key，不用中文 */
const assetDetails = computed(() => {
  const list = []
  asset.value.forEach((item) => {
    const match =
      (item.type == 1 && tabActive.value === 'plat') ||
      (item.type == 2 && tabActive.value === 'finance') ||
      (item.type == 3 && tabActive.value === 'contract')
    if (!match) return

    const obj = {}
    obj.keyong = priceFormat(item.availableAmount)

    if (DIFF_FREEZE_ASSETS.includes(__config._APP_ENV)) {
      let temp = 0
      if (freezeList.value) {
        freezeList.value.forEach((itm) => {
          if (itm.coin == item.symbol && item.type == 1) temp = itm.price
        })
      }
      obj.zhanyong = priceFormat(_add(item.occupiedAmount, temp))
    } else {
      obj.zhanyong = priceFormat(item.occupiedAmount)
    }

    obj.zhehe = priceFormat(item.exchageAmount)
    obj.loge = item.loge
    obj.totalPnlUsdt = item.totalPnlUsdt || 0;

    const sym = (item.symbol || '').trim()
    const isUsdt = sym.toLowerCase() === 'usdt'
    obj.title = isUsdt ? 'USDT' : sym.replace(/usdt/ig, '').trim().toUpperCase()
    obj.icon = isUsdt ? 'usdt' : sym.replace(/usdt/ig, '').trim()

    if (isUsdt) list.unshift(obj)
    else list.push(obj)
  })
  return list
})

const amountSum = computed(() => {
  let sum = 0
  for (let i = 0; i < assetDetails.value.length; i++) {
    sum += Number(assetDetails.value[i].zhehe)
  }
  return priceFormat(sum)
})

const getAccountFreezeList = async () => {
  if (DIFF_FREEZE_ASSETS.includes(__config._APP_ENV)) {
    const res = await getFreezeList()
    if (res.code == '200') freezeList.value = res.data
  }
}

onMounted(() => {
  getAccountFreezeList()
})
</script>

<style lang="scss" scoped>
:deep(.van-tabs__wrap) {
  height: 60px;
  border-bottom: 1px solid var(--ex-border-color);
  background: var(--ex-home-list-bgcolor) !important;

  .van-tab__text {
    font-size: 16px;
    font-weight: normal;
  }

  .van-tab--shrink {
    margin-right: 20px;
  }
}

:deep(.van-tabs__nav) {
  background: var(--ex-home-list-bgcolor) !important;
}

:deep(.van-tab) {
  color: var(--ex-home-list-ftcolor) !important;
}

:deep(.van-tab--active) {
  color: var(--ex-home-list-ftcolor3) !important;
}
</style>
