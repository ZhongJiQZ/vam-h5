<!-- 充值详情 -->
<template>
  <div class="page-recharge-detail">
    <header class="rd-header">
      <button type="button" class="rd-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="rd-header__back-icon" />
      </button>
      <h1 class="rd-header__title">{{ _t18('recharge_detail') }}</h1>
      <button type="button" class="rd-header__action" aria-label="service" @click="goService">
        <img :src="iconService" alt="" class="rd-header__action-icon" />
      </button>
    </header>

    <div class="rd-body">
      <div class="detail-card">
        <Amount :data="data" card-surface />
        <Info :data="data" card-surface />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { _t18, _back } from '@/utils/public'
import { getRechargeDetail } from '@/api/account'
import { dispatchCustomEvent } from '@/utils'
import Amount from '../components/detailAmount.vue'
import Info from '../components/orderInfo.vue'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'

const route = useRoute()
const data = ref({})
const id = route.query.id

const getDetail = () => {
  getRechargeDetail(id).then((res) => {
    if (res.code == '200') {
      data.value = res.data
    }
  })
}
getDetail()

const goService = () => dispatchCustomEvent('event_serviceChange')
</script>

<style lang="scss" scoped>
.page-recharge-detail {
  position: relative;
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
  overflow-x: hidden;
}

.page-recharge-detail::before,
.page-recharge-detail::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.page-recharge-detail::before {
  top: -40px;
  right: -50px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, #a642ec 0%, #802bda 60%, transparent 100%);
  opacity: 0.45;
}

.page-recharge-detail::after {
  top: 320px;
  left: -90px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, #c47cff 0%, #7f2bda 55%, transparent 100%);
  opacity: 0.32;
}

.rd-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.rd-header__back {
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

.rd-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.rd-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.rd-header__action {
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

.rd-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.rd-body {
  position: relative;
  z-index: 1;
  padding: 16px 14px 0;
  box-sizing: border-box;
}

.detail-card {
  position: relative;
  background:
    linear-gradient(
      155deg,
      rgba(70, 40, 120, 0.28) 0%,
      rgba(30, 21, 48, 0.42) 60%,
      rgba(30, 21, 48, 0.48) 100%
    );
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 8px 18px 20px;
  box-sizing: border-box;
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -1px 0 rgba(255, 255, 255, 0.04);
}
</style>
