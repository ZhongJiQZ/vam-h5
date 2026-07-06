<!-- 快捷充币 -->
<template>
  <div class="page-recharge">
    <header class="rc-header">
      <button type="button" class="rc-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="rc-header__back-icon" />
      </button>
      <h1 class="rc-header__title">{{ _t18('recharge_fast', ['aams', 'robinhood2']) }}</h1>
      <button type="button" class="rc-header__action" aria-label="service" @click="goService">
        <img :src="iconService" alt="" class="rc-header__action-icon" />
      </button>
    </header>

    <main class="rc-main">
      <List :data="coinList" />
      <div
        v-if="['das', 'dev'].includes(_getConfig('_APP_ENV'))"
        class="custorm"
        @click="goService"
      >
        <div class="left">
          <span class="service-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11v2a9 9 0 0 1-18 0v-2" />
              <path d="M5 11a7 7 0 0 1 14 0" />
              <rect x="2" y="11" width="4" height="6" rx="1.5" />
              <rect x="18" y="11" width="4" height="6" rx="1.5" />
              <path d="M21 17v1a3 3 0 0 1-3 3h-3" />
            </svg>
          </span>
          <span class="text">{{ _t18('findCustorm') }}</span>
        </div>
        <span class="chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </span>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { dispatchCustomEvent } from '@/utils'
import { _t18, _back, _getConfig } from '@/utils/public'
import List from './recharge-list.vue'
import { useMainStore } from '@/store/index.js'
import { resolveRechargeListTitle, resolveRechargeIcon } from '@/utils/rechargeType'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'

const mainStore = useMainStore()

onMounted(() => {
  mainStore.getUserRechageNew()
})

watch(
  () => mainStore.getRechargeList?.length || 0,
  (len) => {
    if (len > 0) {
      mainStore.getUserRechageNew()
    }
  },
  { immediate: true }
)

const coinList = computed(() => {
  return mainStore.getRechargeList.map((item) => ({
    icon: resolveRechargeIcon(item),
    type: 0,
    title: resolveRechargeListTitle(item),
    coinName: item.coinName,
    address: item.address,
    coin: item.coin
  }))
})

const goService = () => dispatchCustomEvent('event_serviceChange')
</script>

<style lang="scss" scoped>
.page-recharge {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏 */
.rc-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.rc-header__back {
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

.rc-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.rc-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.rc-header__action {
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

.rc-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

/* Body */
.rc-main {
  padding: 16px 14px 0;
}

/* 联系客服行 */
.custorm {
  margin-top: 18px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(30, 21, 48, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  .left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .service-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: rgb(196, 124, 255);
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .text {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
  }

  .chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &:active {
    background: rgba(160, 65, 237, 0.08);
  }
}
</style>
