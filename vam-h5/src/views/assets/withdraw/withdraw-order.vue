<template>
  <div class="page-withdraw-order">
    <DarkHeaderBar :title="_t18('withdraw_order')" :border_bottom="true" />

    <div class="sheet">
      <Tab
        :tab-list="tabList"
        :active="curIndex"
        title-inactive-color="#969799"
        title-active-color="#323233"
        indicator-color="#17ac74"
        :line-width="28"
        :line-height="4"
        :bold-active-tab="true"
        class="withdraw-tab"
        @change="changeIndex"
      >
        <template #tabContent>
          <van-pull-refresh
            v-model="refreshing"
            :loading-text="_t18('loading')"
            :loosing-text="_t18('release_refresh')"
            @refresh="onRefresh"
          >
            <van-loading v-if="showLoading" />
            <div v-else class="list-wrap">
              <van-list
                v-if="tabContentList.length > 0"
                v-model:loading="loading"
                :finished="finished"
                :finished-text="_t18(`no_more_data`)"
                :loading-text="_t18(`loading`)"
                @load="onLoad"
              >
                <div
                  v-for="(item, index) in tabContentList"
                  :key="index"
                  class="list-row"
                >
                  <OrderList :data="item" card-layout />
                </div>
              </van-list>
              <Nodata v-else />
            </div>
          </van-pull-refresh>
        </template>
      </Tab>
    </div>
  </div>
</template>

<script setup>
import { getWithdrawList } from '@/api/account'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import Tab from '@/components/Tab/index.vue'
import OrderList from '../components/orderList.vue'
import { _t18 } from '@/utils/public'

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
  _t18('withdraw_tab_all', ['aams']),
  _t18('withdraw_tab_wait'),
  _t18('withdraw_tab_success'),
  _t18('withdraw_tab_error')
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
  getWithdrawList(params).then((res) => {
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
.page-withdraw-order {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.sheet {
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: #fff;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  box-sizing: border-box;
}

.page-withdraw-order :deep(.withdraw-tab .van-tabs__nav) {
  background: #fff !important;
}

.page-withdraw-order :deep(.withdraw-tab .van-tabs__wrap) {
  background: #fff;
  border-bottom: 1px solid #ebedf0;
}

.page-withdraw-order :deep(.withdraw-tab .van-tab) {
  font-size: 15px;
}

.page-withdraw-order :deep(.withdraw-tab .tabContent) {
  background: #fff;
  border-top: none;
  min-height: calc(100vh - 60px - 48px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - 48px - env(safe-area-inset-top, 0px));
  padding: 12px 0 24px;
  box-sizing: border-box;
}

.list-wrap {
  padding: 0 15px;
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
</style>
