<!-- 理财 -->
<template>
  <div class="page page--earn">
    <header class="earn-header">
      <h1 class="earn-header__title">{{ _t18('financial', ['paxpay']) }}</h1>
      <div class="earn-header__actions">
        <button type="button" class="earn-header__action" aria-label="service" @click="goService">
          <img :src="iconService" alt="" />
        </button>
        <button type="button" class="earn-header__action" aria-label="search" @click="$router.push('/quote')">
          <img :src="iconSearch" alt="" />
        </button>
      </div>
    </header>

    <main class="earn-main">
      <Header />
      <FundList />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { _t18 } from '@/utils/public'
import { dispatchCustomEvent } from '@/utils'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'
import iconSearch from '@/assets/images/gxpex/quote/icon-search.svg'
import Header from './components/header.vue'
import FundList from './components/fundList.vue'

const $router = useRouter()
const goService = () => dispatchCustomEvent('event_serviceChange')
</script>

<style lang="scss" scoped>
.page--earn {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 140px 140px at -5% 35%, rgba(128, 43, 218, 0.55), transparent 70%),
    radial-gradient(ellipse 160px 160px at 105% 15%, rgba(128, 43, 218, 0.45), transparent 70%),
    radial-gradient(ellipse 130px 130px at 90% 75%, rgba(128, 43, 218, 0.35), transparent 70%),
    #111111;
  color: #fff;
  padding-bottom: calc(79px + env(safe-area-inset-bottom, 0px));
}

/* 顶栏跟 quote (Markets) 页面对齐 */
.earn-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
  margin: 0;
}

.earn-header__title {
  margin: 0;
  font-family: 'PingFang SC', -apple-system, sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #ffffff;
  text-align: center;
}

.earn-header__actions {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  margin-top: calc(env(safe-area-inset-top) / 2);
  display: flex;
  align-items: center;
  gap: 14px;
}

.earn-header__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  img {
    width: 20px;
    height: 20px;
    display: block;
    object-fit: contain;
    opacity: 0.85;
  }
}

.earn-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 12px 0;
}
</style>
