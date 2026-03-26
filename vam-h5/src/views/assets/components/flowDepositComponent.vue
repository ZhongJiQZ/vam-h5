<template>
  <div class="flow-deposit">
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
      <van-pull-refresh
        v-model="refreshing"
        @refresh="onRefresh"
        :loading-text="_t18('loading')"
        :loosing-text="_t18('release_refresh')"
      >
        <van-loading v-if="showLoading" />

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
              <!-- ✅ 你可以换成你自己的投资记录卡片组件 -->
              <div class="card">
                <div class="row">
                  <div class="k">{{ _t18('assets.chainType') }}</div>
                  <div class="v">{{ item.type || '-' }}</div>
                </div> 

                <div class="row">
                  <div class="k">{{ _t18('assets.amount') }}</div>
                  <div class="v">{{ item.amount }} {{ item.coin.toUpperCase() }}</div>
                </div>

                <div class="row">
                  <div class="k">{{ _t18('assets.createTime') }}</div>
                  <div class="v">{{ item.createTime || '-' }}</div>
                </div>

                <div class="row">
                  <div class="k">{{ _t18('assets.status') }}</div>
                  <div class="v" v-if="item.status == 0">{{ _t18('recharge_waiting') }}</div>
                  <div class="v" v-if="item.status == 1">{{ _t18('recharge_tab_success') }}</div>
                  <div class="v" v-if="item.status == 2">{{ _t18('recharge_tab_error') }}</div>
                </div> 
                <!-- <div class="row">
                  <div class="k">{{ _t18('assets.createTime') }}</div>
                  <div class="v">{{ item.createTime || '-' }}</div>
                </div> --> 
              </div>
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
import { ref, computed, watch } from 'vue'
import Tab from '@/components/Tab/index.vue'
import { _t18 } from '@/utils/public'

// ✅ 用你真实的投资记录接口替换这里
// 例：import { getRecordList } from '@/api/assets'
import { getRechargeList } from '@/api/account'

// 如果你项目里 HeaderBar / Nodata 已经全局注册，这里可不 import
import HeaderBar from '@/components/HeaderBar/index.vue'
import Nodata from '@/components/Nodata/index.vue'

const refreshing = ref(false)
const showLoading = ref(true)
const loading = ref(false)
const finished = ref(false)

const curIndex = ref(0)

/**
 * tabs（照你充值记录：全部/审核/成功/失败）
 * 你如果投资记录状态不同，改这里文案即可
 */
const tabList = computed(() => {
  return [
    _t18('recharge_tab_all', ['aams']),
    _t18('recharge_tab_wait'),
    _t18('recharge_tab_success'),
    _t18('recharge_tab_error')
  ]
})

const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tabContentList = ref([])

const buildParams = () => {
  let params = `pageNum=${pageNum.value}&pageSize=${pageSize.value}`

  // curIndex=0 全部不传状态；其他传 status=curIndex-1
  if (curIndex.value != 0) {
    params = `status=${curIndex.value - 1}&pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  }
  return params
}

const getList = () => {
  const params = buildParams()

  // ✅ 你换投资接口后，这里保持 res.code/res.rows/res.total 的结构即可
  getRechargeList(params).then((res) => {
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

<style scoped lang="scss">
.flow-deposit {
  width: 100%;
  background: #fff;
}

.flow-deposit :deep(.van-tabs__wrap) {
  height: 44px;
  border-bottom: 1px solid #eef0f3;
  background: #fff !important;
}

.flow-deposit :deep(.van-tabs__nav) {
  background: #fff !important;
  padding-left: 8px;
  padding-right: 8px;
}

.flow-deposit :deep(.van-tabs__line) {
  display: none !important;
}

.flow-deposit :deep(.tabContent) {
  border-top: none;
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

.card {
  background: #f7f9fc;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid rgba(5, 16, 26, 0.04);
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}
.k {
  color: #7a8c99;
  font-size: 13px;
}
.v {
  color: #1a1a1a;
  font-size: 13px;
  text-align: right;
}
</style>
