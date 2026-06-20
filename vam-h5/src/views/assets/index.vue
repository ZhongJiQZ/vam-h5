<template>
  <div class="page page--assets">
    <header class="assets-header">
      <h1 class="assets-header__title">{{ _t18('myassets') }}</h1>
    </header>

    <main class="assets-main">
      <div class="assets-tabs">
        <div class="assets-tabs__viewport">
          <div ref="tabsScrollRef" class="assets-tabs__scroll">
            <button
              v-for="item in tabList"
              :key="item.key"
              type="button"
              class="assets-tabs__tab"
              :class="{ 'assets-tabs__tab--active': tabActive === item.key }"
              @click="onTabClick(item.key)"
            >
              {{ item.title }}
            </button>
          </div>
          <div class="assets-tabs__overflow" aria-hidden="true">
            <span class="assets-tabs__arrow"></span>
          </div>
        </div>
      </div>

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
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { _t18 } from '@/utils/public'
import { _add, priceFormat } from '@/utils/decimal'
import Plat from './components/account/platformAccount.vue'
import finance from './components/account/financeAccount.vue'
import Contarct from './components/account/contarctAccount.vue'

import { useUserStore } from '@/store/user/index'
import { useMainStore } from '@/store'
import { storeToRefs } from 'pinia'
import { storageDict } from '@/config/dict'
import { showLoadingToast, closeToast } from 'vant'
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

const onTabClick = (key) => {
  if (key === 'invest') {
    router.push('/myInvestment')
    return
  }
  tabActive.value = key
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

const handleShuaxin = async () => {
  showLoadingToast({ forbidClick: true, duration: 0 })
  try {
    await userStore.getUserInfo()
    await getAccountFreezeList()
  } finally {
    closeToast()
  }
}

const { asset } = storeToRefs(userStore)
const freezeList = ref()

const compMap = {
  plat: Plat,
  finance: finance,
  contract: Contarct,
}
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
    obj.totalPnlUsdt = item.totalPnlUsdt || 0

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
.page--assets {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 140px 140px at -5% 35%, rgba(128, 43, 218, 0.55), transparent 70%),
    radial-gradient(ellipse 160px 160px at 105% 15%, rgba(128, 43, 218, 0.45), transparent 70%),
    radial-gradient(ellipse 130px 130px at 90% 75%, rgba(128, 43, 218, 0.35), transparent 70%),
    #111111;
  color: #fff;
  padding-bottom: calc(79px + env(safe-area-inset-bottom, 0px));
}

.assets-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  margin-top: calc(6px + env(safe-area-inset-top, 0px));
  padding: 0 12px;
}

.assets-header__title {
  margin: 0;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
}

.assets-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 12px 0;
}

.assets-tabs {
  display: flex;
  align-items: center;
}

.assets-tabs__viewport {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 29px;
}

.assets-tabs__scroll {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  min-height: 29px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-right: 18px;
}

.assets-tabs__scroll::-webkit-scrollbar {
  display: none;
}

.assets-tabs__overflow {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 23px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 2px;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(17, 17, 17, 0) 0%, #111111 46.74%);
}

.assets-tabs__arrow {
  display: block;
  width: 7px;
  height: 7px;
  border-top: 1.5px solid rgba(255, 255, 255, 0.65);
  border-right: 1.5px solid rgba(255, 255, 255, 0.65);
  transform: rotate(45deg);
  flex-shrink: 0;
}

.assets-tabs__tab {
  position: relative;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #fff;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 1.2;
  padding: 0 0 6px;
  cursor: pointer;
  white-space: nowrap;
}

.assets-tabs__tab--active {
  font-size: 16px;
  font-weight: 500;
}

.assets-tabs__tab--active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 22px;
  height: 4px;
  border-radius: 2px;
  background: rgb(160, 65, 237);
}
</style>
