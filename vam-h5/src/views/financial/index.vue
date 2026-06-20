<!-- 理财 -->
<template>
  <div class="page page--earn">
    <header class="earn-header">
      <h1 class="earn-header__title">{{ _t18('financial', ['paxpay']) }}</h1>
      <div class="earn-header__actions">
        <button type="button" class="earn-header__action" aria-label="service" @click="goService">
          <img :src="iconService" alt="" />
        </button>
        <button type="button" class="earn-header__action" aria-label="notification" @click="goNotice">
          <img :src="iconBell" alt="" />
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
import iconBell from '@/assets/images/gxpex/home/icon-bell.svg'
import iconSearch from '@/assets/images/gxpex/quote/icon-search.svg'
import Header from './components/header.vue'
import FundList from './components/fundList.vue'

const $router = useRouter()
const goService = () => dispatchCustomEvent('event_serviceChange')
const goNotice = () => $router.push('/broadcast')
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

.earn-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  padding: 0 12px;
}

.earn-header__title {
  margin: 0;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
}

.earn-header__actions {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
}

.earn-header__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    width: 22px;
    height: 22px;
    display: block;
    object-fit: contain;
  }
}

.earn-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 12px 0;
}
</style>
