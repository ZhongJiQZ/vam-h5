<template>
  <div class="pledge-order-page">
    <DarkHeaderBar
      :title="_t18('pledge_order_record')"
      right="service"
      :border_bottom="false"
    />
    <Tab
      class="pledge-order-tabs"
      :tabList="tabList"
      :active="curIndex"
      title-inactive-color="#888888"
      title-active-color="#1a1a1a"
      indicator-color="#17AC74"
      :line-width="28"
      :line-height="3"
      @change="changeIndex"
    >
      <template #tabContent>
        <van-pull-refresh
          v-model="refreshing"
          @refresh="onRefresh"
          :loading-text="_t18(`loading`)"
          :loosing-text="_t18(`release_refresh`)"
        >
          <van-loading v-if="showLoading" />
          <div v-else class="pledge-order-list">
            <van-list
              v-if="tabContentList.length > 0"
              v-model:loading="loading"
              :finished="finished"
              :finished-text="_t18(`no_more_data`)"
              :loading-text="_t18(`loading`)"
              @load="onLoad"
            >
              <van-cell v-for="(item, index) in tabContentList" :key="index">
                <OrderCard :data="item" @getList="getList"></OrderCard>
              </van-cell>
            </van-list>
            <Nodata v-else />
          </div>
        </van-pull-refresh>
      </template>
    </Tab>
  </div>
</template>
<script setup>
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import { getPledgeOrderList } from '@/api/pledge/index'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { _t18 } from '@/utils/public'
import Tab from '@/components/Tab/index.vue'
import OrderCard from './components/orderCard.vue'
import { showToast } from 'vant'
const refreshing = ref(false) //下拉刷新的加载展示
const showLoading = ref(true) //加载动画
const loading = ref(false) //分页加载
const finished = ref(false) //数据是否加载完成
const status = ref()
const getList = () => {
  tabContentList.value = []
  pageNum.value = 1
  getOrderList(status.value)
}
//下拉加载事件（初始化数据）
const onRefresh = () => {
  refreshing.value = false
  showLoading.value = true
  finished.value = false
  pageNum.value = 1
  loading.value = true
  tabContentList.value = []
  getOrderList(status.value)
}
const route = useRoute()
const curIndex = ref(0)
const tabList = computed(() => {
  let list = []
  list = [
    _t18('all', ['aams']),
    _t18('pledge_in_progress'),
    _t18('pledge_completed'),
    _t18('pledge_redeem_ok')
  ]
  return list
})
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tabContentList = ref([])
const getOrderList = async (status) => {
  let params = `pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  // 排除全部时不传参数
  if (curIndex.value !== 0) {
    // curIndex.value - 1
    params = `status=${status}&pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  }
  const res = await getPledgeOrderList(params)
  if (res.code == '200') {
    setTimeout(() => {
      // 页面加载动画，下拉刷新动画
      if (showLoading.value) {
        showLoading.value = false
      }
      if (refreshing.value) {
        refreshing.value = false
      }
    }, 200)
    //分页加载动画
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
watch(
  curIndex,
  (newValue) => {
    status.value = newValue - 1
    getOrderList(status.value)
  },
  {
    immediate: true
  }
)
</script>

<style lang="scss" scoped>
.pledge-order-page {
  min-height: 100vh;
  background: #fff;
}

.pledge-order-list {
  min-height: 50vh;
}

.van-loading {
  text-align: center;
  padding: 30px;
}

.pledge-order-tabs {
  :deep(.van-tabs) {
    background: #fff !important;
  }

  :deep(.van-tabs__nav) {
    background: #fff !important;
  }

  :deep(.van-tabs__wrap) {
    background: #fff !important;
  }

  :deep(.van-tab) {
    flex: 1;
    font-size: 14px;
  }

  :deep(.van-tabs__content) {
    background: #fff !important;
  }

  :deep(.tabContent) {
    border-top: 1px solid rgba(0, 0, 0, 0.06) !important;
    background: #fff !important;
    padding: 12px 0 24px;
  }
}

:deep(.van-cell) {
  background: transparent !important;
  padding: 0 12px 12px !important;
}

:deep(.van-cell::after) {
  display: none !important;
}
</style>
