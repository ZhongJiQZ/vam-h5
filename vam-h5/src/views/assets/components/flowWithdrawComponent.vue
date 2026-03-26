<template>
  <div class="flow-withdraw">
  <Tab
    :tabList="tabList"
    :active="curIndex"
    title-inactive-color="#7a8c99"
    title-active-color="#1a1a1a"
    indicator-color="#008710"
    :line-width="20"
    :line-height="3"
    bold-active-tab
    @change="changeIndex"
  >
    <template #tabContent>
      <!-- 下拉刷新 -->
      <van-pull-refresh
        v-model="refreshing"
        @refresh="onRefresh"
        :loading-text="_t18('loading')"
        :loosing-text="_t18('release_refresh')"
      >
        <!-- 加载中动画 -->
        <van-loading v-if="showLoading" />

        <!-- 数据列表 -->
        <div v-else>
          <van-list
            v-if="tabContentList.length > 0"
            v-model:loading="loading"
            :finished="finished"
            :finished-text="_t18('no_more_data')"
            :loading-text="_t18('loading')"
            @load="onLoad"
          >
            <van-cell v-for="(item, index) in tabContentList" :key="item.id || index">
              <OrderList :data="item"></OrderList>
            </van-cell>
          </van-list>

          <!-- 数据为空 -->
          <Nodata v-else />
        </div>
      </van-pull-refresh>
    </template>
  </Tab>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getWithdrawList } from '@/api/account'
import Tab from '@/components/Tab/index.vue'
import OrderList from '../components/orderList.vue'
import { _t18 } from '@/utils/public'

/**
 * 如果你页面里没有定义 cuttentRight，会导致模板报错
 * 这里给一个安全默认值（你需要右侧按钮再按你项目逻辑改）
 */
const cuttentRight = ref('')

const refreshing = ref(false) // 下拉刷新
const showLoading = ref(true) // 首次加载动画
const loading = ref(false) // 分页加载
const finished = ref(false) // 是否加载完成

const curIndex = ref(0)

const tabList = computed(() => {
  return [
    _t18('withdraw_tab_all', ['aams']),
    _t18('withdraw_tab_wait'),
    _t18('withdraw_tab_success'),
    _t18('withdraw_tab_error')
  ]
})

/**
 * 提现记录查询
 * pageNum 页码
 * pageSize 每页条数
 * total 总条数
 */
const pageNum = ref(1)
const pageSize = ref(10) // 你原来是 2，这里改 10 更正常；要保持 2 就改回去
const total = ref(0)

const tabContentList = ref([])

const buildParams = () => {
  let params = `pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  // 排除全部时不传参数
  if (curIndex.value != 0) {
    params = `status=${curIndex.value - 1}&pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  }
  return params
}

const getList = () => {
  const params = buildParams()

  getWithdrawList(params).then((res) => {
    if (res.code == '200') {
      setTimeout(() => {
        if (showLoading.value) showLoading.value = false
        if (refreshing.value) refreshing.value = false
      }, 200)

      loading.value = false
      tabContentList.value = tabContentList.value.concat(res.rows || [])
      total.value = res.total || 0

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

const onRefresh = () => {
  refreshing.value = false
  showLoading.value = true
  finished.value = false
  pageNum.value = 1
  loading.value = true
  tabContentList.value = []
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
.flow-withdraw {
  width: 100%;
  background: #fff;
}

.flow-withdraw :deep(.van-tabs__wrap) {
  height: 44px;
  border-bottom: 1px solid #eef0f3;
  background: #fff !important;
}

.flow-withdraw :deep(.van-tabs__nav) {
  background: #fff !important;
  padding-left: 8px;
  padding-right: 8px;
}

.flow-withdraw :deep(.tabContent) {
  border-top: none;
}

.content {
  border-bottom: 5px solid var(--ex-border-color);
  padding: 20px 15px;
}

.van-loading {
  text-align: center;
  padding: 30px;
}

.van-list {
  min-height: calc(100vh - 60px - 44px);
  padding: 12px 15px 24px;
}

:deep(.van-cell) {
  background: transparent !important;
  padding: 0 0 12px !important;
}
:deep(.van-cell::after) {
  display: none;
}
</style>
