<template>
  <div class="page-recharge-order">
    <header class="ro-header">
      <button type="button" class="ro-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="ro-header__back-icon" />
      </button>
      <h1 class="ro-header__title">{{ headerTitle }}</h1>
    </header>

    <div class="ro-sheet">
      <Tab
        :tab-list="tabList"
        :active="curIndex"
        title-inactive-color="rgba(255, 255, 255, 0.55)"
        title-active-color="#ffffff"
        indicator-color="#a13cff"
        :line-width="18"
        :line-height="3"
        :bold-active-tab="true"
        class="recharge-tab"
        @change="changeIndex"
      >
        <template #tabContent>
          <van-pull-refresh
            v-model="refreshing"
            :loading-text="_t18('loading')"
            :loosing-text="_t18('release_refresh')"
            @refresh="onRefresh"
          >
            <van-loading v-if="showLoading" color="rgb(160, 65, 237)" />
            <div v-else class="list-wrap">
              <van-list
                v-if="tabContentList.length > 0"
                v-model:loading="loading"
                :finished="finished"
                :finished-text="_t18('no_more_data')"
                :loading-text="_t18('loading')"
                @load="onLoad"
              >
                <div
                  v-for="(item, index) in tabContentList"
                  :key="item.id ?? index"
                  class="list-row"
                >
                  <OrderList :data="item" card-layout />
                </div>
              </van-list>
              <div v-else class="ro-empty">
                <img :src="iconEmpty" alt="" class="ro-empty__icon" />
                <p class="ro-empty__text">{{ _t18('no_data') }}</p>
              </div>
            </div>
          </van-pull-refresh>
        </template>
      </Tab>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getRechargeList } from '@/api/account'
import Tab from '@/components/Tab/index.vue'
import OrderList from '../components/orderList.vue'
import { _t18, _back } from '@/utils/public'
import { useRoute } from 'vue-router'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const route = useRoute()

const headerTitle = computed(() => {
  const t = route.query.type
  if (t != null && String(t).trim() !== '') {
    return `${_t18('recharge', ['latcoin'])} ${t}`
  }
  return _t18('recharge_order')
})

const refreshing = ref(false)
const showLoading = ref(true)
const loading = ref(false)
const finished = ref(false)

const onRefresh = () => {
  refreshing.value = false
  showLoading.value = true
  finished.value = false
  pageNum.value = 1
  loading.value = true
  tabContentList.value = []
  getList()
}

const curIndex = ref(0)
const tabList = computed(() => [
  _t18('recharge_tab_all', ['aams']),
  _t18('recharge_tab_wait'),
  _t18('recharge_tab_success'),
  _t18('recharge_tab_error')
])

const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tabContentList = ref([])

const getList = () => {
  let params = `pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  if (curIndex.value !== 0) {
    params = `status=${curIndex.value - 1}&pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  }
  getRechargeList(params).then((res) => {
    if (res.code == '200') {
      setTimeout(() => {
        if (showLoading.value) {
          showLoading.value = false
        }
        if (refreshing.value) {
          refreshing.value = false
        }
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
    }
  })
}

const onLoad = () => {
  loading.value = true
  getList()
}

const changeIndex = (v) => {
  curIndex.value = v
  showLoading.value = true
  tabContentList.value = []
  finished.value = false
  pageNum.value = 1
  loading.value = true
}

watch(
  curIndex,
  () => {
    getList()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.page-recharge-order {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

.ro-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.ro-header__back {
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

.ro-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.ro-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 72vw;
}

.ro-sheet {
  background: transparent;
  box-sizing: border-box;
}

.page-recharge-order :deep(.recharge-tab .van-tabs__wrap) {
  background: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.page-recharge-order :deep(.recharge-tab .van-tabs__nav) {
  background: transparent !important;
}

.page-recharge-order :deep(.recharge-tab .van-tab) {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55) !important;
  background: transparent !important;
}

.page-recharge-order :deep(.recharge-tab .van-tab--active) {
  color: #fff !important;
  font-weight: 600;
}

.page-recharge-order :deep(.recharge-tab .van-tabs__line) {
  background: #a13cff !important;
  width: 18px !important;
  height: 3px !important;
  border-radius: 2px;
  bottom: 16px;
}

.page-recharge-order :deep(.recharge-tab .tabContent) {
  background: transparent;
  border-top: none;
  padding: 14px 0 24px;
  box-sizing: border-box;
}

.page-recharge-order :deep(.van-pull-refresh) {
  background: transparent;
}

.page-recharge-order :deep(.van-pull-refresh__head) {
  color: rgba(255, 255, 255, 0.55);
}

.page-recharge-order :deep(.van-list__finished-text),
.page-recharge-order :deep(.van-list__loading-text) {
  color: rgba(255, 255, 255, 0.45);
}

.list-wrap {
  padding: 0 14px;
}

.list-row {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.van-loading {
  text-align: center;
  padding: 30px;
}

.ro-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0 24px;
}

.ro-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.ro-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
