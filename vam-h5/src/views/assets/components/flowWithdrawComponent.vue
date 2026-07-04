<template>
  <div class="flow-withdraw">
    <van-tabs
      shrink
      v-model:active="curIndex"
      class="flow-withdraw__status-tabs"
      :line-width="0"
      @click-tab="onClickStatusTab"
    >
      <van-tab v-for="(t, i) in tabList" :key="i" :title="t" :name="i" />
    </van-tabs>

    <div class="list-wrap">
      <van-pull-refresh
        v-model="refreshing"
        :pulling-text="_t18('loading')"
        :loosing-text="_t18('release_refresh') || _t18('loading')"
        :loading-text="_t18('loading')"
        :success-text="''"
        @refresh="onRefresh"
      >
        <van-list
          v-model:loading="loading"
          :finished="finished"
          :finished-text="tabContentList.length ? (_t18('no_more_data') || _t18('utils.noMore')) : ''"
          :loading-text="_t18('loading')"
          :error-text="_t18('error') || ''"
          @load="onLoad"
        >
          <template v-if="tabContentList.length">
            <div
              v-for="(item, index) in tabContentList"
              :key="item.id || index"
              class="row-wrap"
            >
              <OrderList :data="item" card-layout />
            </div>
          </template>

          <div v-else-if="!loading && !refreshing" class="fw-empty">
            <img :src="iconEmpty" alt="" class="fw-empty__icon" />
            <p class="fw-empty__text">{{ _t18('no_data') || _t18('utils.noData') }}</p>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getWithdrawList } from '@/api/account'
import OrderList from '../components/orderList.vue'
import { _t18 } from '@/utils/public'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

const curIndex = ref(0)

const tabList = computed(() => {
  return [
    _t18('withdraw_tab_all', ['aams']),
    _t18('withdraw_tab_wait'),
    _t18('withdraw_tab_success'),
    _t18('withdraw_tab_error')
  ]
})

const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tabContentList = ref([])

const buildParams = () => {
  let params = `pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  if (curIndex.value != 0) {
    params = `status=${curIndex.value - 1}&pageNum=${pageNum.value}&pageSize=${pageSize.value}`
  }
  return params
}

const getList = () => {
  const params = buildParams()
  getWithdrawList(params)
    .then((res) => {
      if (res.code == '200') {
        loading.value = false
        refreshing.value = false
        tabContentList.value = tabContentList.value.concat(res.rows || [])
        total.value = res.total || 0
        if (tabContentList.value.length >= total.value) {
          finished.value = true
        }
        pageNum.value++
      } else {
        finished.value = true
        loading.value = false
        refreshing.value = false
      }
    })
    .catch(() => {
      finished.value = true
      loading.value = false
      refreshing.value = false
    })
}

const onLoad = () => {
  loading.value = true
  getList()
}

const onRefresh = () => {
  finished.value = false
  pageNum.value = 1
  loading.value = true
  tabContentList.value = []
  getList()
}

const onClickStatusTab = () => {
  tabContentList.value = []
  finished.value = false
  pageNum.value = 1
  loading.value = true
  getList()
}
</script>

<style lang="scss" scoped>
.flow-withdraw {
  width: 100%;
}

/* 状态子 tab — 跟 Mining/Invest/Deposit 同款紫色短下划线 */
.flow-withdraw__status-tabs {
  :deep(.van-tabs__wrap) {
    height: 40px;
    background: transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  :deep(.van-tabs__nav) {
    background: transparent !important;
    padding: 0 4px;
  }

  :deep(.van-tab) {
    flex: none;
    padding: 0;
    margin-right: 22px;
    font-size: 13px;
    background: transparent !important;
    color: rgba(255, 255, 255, 0.55) !important;
  }

  :deep(.van-tab__text) {
    font-weight: 500;
  }

  :deep(.van-tab--active .van-tab__text) {
    color: #fff !important;
    font-weight: 600;
  }

  :deep(.van-tab--active::after) {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    width: 18px;
    height: 3px;
    background: #a13cff;
    border-radius: 2px;
  }

  :deep(.van-tabs__line) {
    display: none !important;
  }
}

.list-wrap {
  padding: 14px 4px 24px;
  background: transparent;
}

:deep(.van-pull-refresh) {
  background: transparent;
}

:deep(.van-list__finished-text),
:deep(.van-list__loading-text) {
  color: rgba(255, 255, 255, 0.45);
}

.row-wrap {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

/* 空态 */
.fw-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0 24px;
}

.fw-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.fw-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
