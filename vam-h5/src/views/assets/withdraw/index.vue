<!-- 提现 -->
<template>
  <div class="page-withdraw">
    <header class="wd-header">
      <button type="button" class="wd-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="wd-header__back-icon" />
      </button>
      <h1 class="wd-header__title">{{ _t18('withdraw', ['latcoin']) }}</h1>
      <button type="button" class="wd-header__action" aria-label="service" @click="goService">
        <img :src="iconService" alt="" class="wd-header__action-icon" />
      </button>
    </header>

    <main class="wd-main">
      <List :data="coinList" />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { _t18, _back, filterCoin2 } from '@/utils/public'
import { dispatchCustomEvent } from '@/utils'
import List from './withdraw-list.vue'
import { useMainStore } from '@/store/index.js'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'

const mainStore = useMainStore()

const coinList = computed(() => {
  const list = []
  mainStore.getWithdrawList.forEach((item) => {
    if (item.status == '1') {
      const obj = {
        type: 1,
        ratio: item.ratio || '',
        fee: item.fee
      }
      if (item.type == 0) {
        obj.icon = item.rechargeType
        obj.title = item.rechargeName
      } else {
        obj.icon = 'card'
        obj.title = _t18('withdraw_card')
        obj.card = filterCoin2(item.rechargeType).toLocaleUpperCase()
        if (item.fiatPerUsdt != null && item.fiatPerUsdt !== '') {
          obj.fiatPerUsdt = item.fiatPerUsdt
          obj.fiatCurrency = item.fiatCurrency || 'Rp'
        }
      }
      list.push(obj)
    }
  })
  return list
})

const goService = () => dispatchCustomEvent('event_serviceChange')
</script>

<style lang="scss" scoped>
.page-withdraw {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏 */
.wd-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.wd-header__back {
  position: absolute;
  left: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.wd-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.wd-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.wd-header__action {
  position: absolute;
  right: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.wd-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.wd-main {
  padding: 16px 14px 0;
}
</style>
