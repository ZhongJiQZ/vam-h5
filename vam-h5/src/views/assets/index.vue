<template>
  <div class="assets-index">
    <div class="assets-index__tabs-wrap">
      <van-tabs
        shrink
        v-model:active="tabActive"
        class="assets-index__tabs"
        title-inactive-color="#92a4b0"
        title-active-color="#e8f1f6"
        color="#17ac74"
        line-width="20"
        line-height="3"
        @click-tab="clickInnerTab"
      >
        <van-tab
          v-for="(item, index) in tabList"
          :key="index"
          :title="item.title"
          :name="item.key"
        />
      </van-tabs>
    </div>
    <div class="assets-index__panel">
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { _t18 } from '@/utils/public'
import { _add, priceFormat } from '@/utils/decimal'
import Plat from './components/account/platformAccount.vue'//平台资产
import finance from './components/account/financeAccount.vue'//理财资产
import Contarct from './components/account/contarctAccount.vue'//合约资产

import { useUserStore } from '@/store/user/index'
import { useMainStore } from '@/store'
import { storeToRefs } from 'pinia'
import { storageDict } from '@/config/dict'
import { showLoadingToast } from 'vant'
import { getFreezeList } from '@/api/user'
import { DIFF_FREEZE_ASSETS } from '@/config/index'

const router = useRouter()

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
/* 资产页顶栏：与 #05101a 同系的冷灰字、浅青白选中、品牌绿下划线 */
$assets-top-bg: #05101a;
$assets-tab-inactive: #92a4b0;
$assets-tab-active: #e8f1f6;
$assets-accent: #17ac74;

.assets-index {
  min-height: 100vh;
  background: #fff;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.assets-index__tabs-wrap {
  background: $assets-top-bg;
  padding-top: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.assets-index__tabs {
  :deep(.van-tabs__wrap) {
    height: 48px;
    border-bottom: none;
    background: transparent !important;
  }

  :deep(.van-tabs__nav) {
    background: transparent !important;
    padding-left: 8px;
    padding-right: 8px;
  }

  :deep(.van-tab) {
    flex: none;
    padding: 0 10px;
    font-size: 15px;
  }

  :deep(.van-tab__text) {
    font-weight: 400;
  }

  :deep(.van-tab--active .van-tab__text) {
    font-weight: 600;
    color: $assets-tab-active !important;
  }

  :deep(.van-tab:not(.van-tab--active) .van-tab__text) {
    color: $assets-tab-inactive !important;
  }

  :deep(.van-tabs__line) {
    bottom: 20px;
    background: $assets-accent;
  }

  :deep(.van-tab--shrink) {
    margin-right: 8px;
  }
}

.assets-index__panel {
  background: #fff;
  border-radius: 16px 16px 0 0;
  min-height: calc(100vh - 52px);
  box-shadow: 0 -6px 28px rgba(5, 16, 26, 0.22);
}
</style>
