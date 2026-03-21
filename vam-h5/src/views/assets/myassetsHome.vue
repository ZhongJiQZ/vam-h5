<template>
    <div>
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
  </template>
  
  <script setup>
  /**
   * ✅ 这里直接把你原来 index.vue 里：
   * - tabList / tabActive / clickInnerTab
   * - assetDetails / amountSum
   * - showNum / handleYanjin / handleShuaxin
   * - store 相关逻辑
   * 全部搬过来
   */
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { _t18 } from '@/utils/public'
  import { _add, priceFormat } from '@/utils/decimal'
  import Plat from './components/account/platAccount.vue'
  import finance from './components/account/financeAccount.vue'
  import Contarct from './components/account/contarctAccount.vue'
  
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
  
  const tabList = computed(() => {
    const nameToKey = {
      平台资产: 'plat',
      理财资产: 'finance',
      合约资产: 'contract',
      我的投资: 'invest',
    }
  
    const list = (mainStore.getAssetsTabList || []).map((item) => {
      const key = item.key || nameToKey[item.name] || item.name
      const title = _t18(item.keyStr, ['latcoin'])
      return { ...item, key, title }
    })
  
    list.push({
      key: 'invest',
      title: _t18('my_invest', ['latcoin']),
      sort: 40,
    })
  
    return list.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  })
  
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
  
  const freezeList = ref()
  const handleShuaxin = () => {
    showLoadingToast({ forbidClick: true, duration: 0 })
    userStore.getUserInfo()
    getAccountFreezeList()
  }
  
  const { asset } = storeToRefs(userStore)
  
  const compMap = { plat: Plat, finance, contract: Contarct }
  const currentComp = computed(() => compMap[tabActive.value] || null)
  
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
  