<template>
  <div class="pledge-order-page">
    <header class="pledge-order-header">
      <button type="button" class="pledge-order-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="pledge-order-header__back-icon" />
      </button>
      <h1 class="pledge-order-header__title">{{ _t18('pledge_order_record') }}</h1>
      <button
        type="button"
        class="pledge-order-header__service"
        aria-label="service"
        @click="goService"
      >
        <img :src="iconService" alt="" />
      </button>
    </header>

    <div class="pledge-order-tabs-wrap">
      <van-tabs
        shrink
        :active="curIndex"
        class="pledge-order-tabs"
        :line-width="0"
        @click-tab="onTabClick"
      >
        <van-tab v-for="(item, index) in tabList" :key="index" :title="item" :name="index" />
      </van-tabs>
    </div>

    <div class="pledge-order-panel">
      <van-pull-refresh
        v-model="refreshing"
        @refresh="onRefresh"
        :loading-text="_t18('loading')"
        :loosing-text="_t18('release_refresh')"
      >
        <van-loading v-if="showLoading" class="pledge-order-loading" />
        <div v-else>
          <van-list
            v-if="tabContentList.length > 0"
            v-model:loading="loading"
            :finished="finished"
            :finished-text="_t18('no_more_data')"
            :loading-text="_t18('loading')"
            @load="onLoad"
          >
            <OrderCard
              v-for="(item, index) in tabContentList"
              :key="item.id ?? index"
              :data="item"
              @getList="getList"
            />
          </van-list>
          <Nodata v-else />
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getPledgeOrderList } from '@/api/pledge/index'
import { _t18, _back } from '@/utils/public'
import { dispatchCustomEvent } from '@/utils'
import OrderCard from './components/orderCard.vue'
import { showToast } from 'vant'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'

const refreshing = ref(false)
const showLoading = ref(true)
const loading = ref(false)
const finished = ref(false)
const status = ref()

const getList = () => {
  tabContentList.value = []
  pageNum.value = 1
  getOrderList(status.value)
}

const onRefresh = () => {
  refreshing.value = false
  showLoading.value = true
  finished.value = false
  pageNum.value = 1
  loading.value = true
  tabContentList.value = []
  getOrderList(status.value)
}

const goService = () => dispatchCustomEvent('event_serviceChange')

const curIndex = ref(0)
const tabList = computed(() => [
  _t18('all', ['aams']),
  _t18('pledge_in_progress'),
  _t18('pledge_completed'),
  _t18('pledge_redeem_ok')
])

const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tabContentList = ref([])

const getOrderList = async (orderStatus) => {
  let params = `pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  if (curIndex.value !== 0) {
    params = `status=${orderStatus}&pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  }
  const res = await getPledgeOrderList(params)
  if (res.code == '200') {
    setTimeout(() => {
      if (showLoading.value) showLoading.value = false
      if (refreshing.value) refreshing.value = false
    }, 200)
    loading.value = false
    tabContentList.value = tabContentList.value.concat(res.rows)
    total.value = res.total
    if (tabContentList.value.length >= total.value) {
      finished.value = true
    }
    pageNum.value++
  } else {
    finished.value = true
    loading.value = false
    showLoading.value = false
    refreshing.value = false
    showToast(res.msg)
  }
}

const onLoad = () => {
  loading.value = true
  getOrderList(status.value)
}

const changeIndex = (v) => {
  curIndex.value = v
  showLoading.value = true
  tabContentList.value = []
  finished.value = false
  pageNum.value = 1
  loading.value = true
}

const onTabClick = ({ name }) => {
  if (name === curIndex.value) return
  changeIndex(name)
}

watch(
  curIndex,
  (newValue) => {
    status.value = newValue - 1
    getOrderList(status.value)
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.pledge-order-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 140px 140px at -5% 35%, rgba(128, 43, 218, 0.55), transparent 70%),
    radial-gradient(ellipse 160px 160px at 105% 15%, rgba(128, 43, 218, 0.45), transparent 70%),
    radial-gradient(ellipse 130px 130px at 90% 75%, rgba(128, 43, 218, 0.35), transparent 70%),
    #111111;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

.pledge-order-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.pledge-order-header__back,
.pledge-order-header__service {
  position: absolute;
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

.pledge-order-header__back {
  left: 12px;
}

.pledge-order-header__service {
  right: 12px;

  img {
    display: block;
    width: 20px;
    height: 20px;
    object-fit: contain;
    opacity: 0.85;
  }
}

.pledge-order-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.pledge-order-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.pledge-order-tabs-wrap {
  padding: 8px 14px 12px;
}

.pledge-order-tabs {
  :deep(.van-tabs__wrap) {
    height: 38px;
    background: transparent !important;
    border-bottom: none;
  }

  :deep(.van-tabs__nav) {
    background: transparent !important;
    padding: 0;
    gap: 8px;
  }

  :deep(.van-tab) {
    flex: none;
    height: 32px;
    padding: 0 14px;
    margin: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 13px;
    transition: background 0.18s ease, border-color 0.18s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.van-tab__text) {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.65);
    transition: color 0.18s ease;
  }

  :deep(.van-tab--active) {
    background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%) !important;
    border-color: transparent !important;
    box-shadow: 0 4px 12px rgba(127, 43, 218, 0.32);
  }

  :deep(.van-tab--active .van-tab__text) {
    color: #fff;
    font-weight: 600;
  }

  :deep(.van-tabs__line) {
    display: none !important;
  }
}

.pledge-order-panel {
  padding: 0 14px;
  min-height: 200px;
}

.pledge-order-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

:deep(.van-pull-refresh__head) {
  color: rgba(255, 255, 255, 0.55);
}

:deep(.van-list__finished-text),
:deep(.van-list__loading) {
  color: rgba(255, 255, 255, 0.45);
}
</style>
