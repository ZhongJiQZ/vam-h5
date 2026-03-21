<!-- src/views/assets/assetRecord.vue -->
<template>
    <div>
      <!-- 顶部一级：我的资产 / 订单中心 / 资产列表 -->
      <van-tabs
        shrink
        v-model:active="topActive"
        title-inactive-color="#333"
        title-active-color="#17AC74"
        color="#17AC74"
        line-width="16"
        @click-tab="clickTopTab"
      >
        <van-tab :title="_t18('center_myasset')" name="center_myasset" />
        <van-tab :title="_t18('center_order')" name="center_order" />
        <van-tab :title="_t18('center_asset_flow')" name="center_asset_flow" />
      </van-tabs>
  
      <!-- 资产列表页：二级 tabs（flow_mining / flow_inverest / flow_deposit / flow_withdraw） -->
      <template v-if="topActive === 'center_asset_flow'">
        <van-tabs
          shrink
          v-model:active="tabActive"
          title-inactive-color="#333"
          title-active-color="#17AC74"
          color="#17AC74"
          line-width="16"
          @click-tab="clickInnerTab"
        >
          <van-tab
            v-for="(item, index) in tabInnerList"
            :key="index"
            :title="item.keyStr"
            :name="item.name"
          />
        </van-tabs>
  
        <!-- 内容区：先空白占位（你后面填真实组件） -->
        <flowMiningComponent   v-show="tabActive === 'flow_mining'" />
        <flowInvestComponent   v-show="tabActive === 'flow_invest'" />
        <flowDepositComponent  v-show="tabActive === 'flow_deposit'" />
        <flowWithdrawComponent v-show="tabActive === 'flow_withdraw'" />
      </template>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { _t18 } from '@/utils/public'
  // ✅ 先把 4 个组件 import 进来
  import flowMiningComponent from './components/flowMiningComponent.vue'
  import flowInvestComponent from './components/flowInvestComponent.vue'
  import flowDepositComponent from './components/flowDepositComponent.vue'
  import flowWithdrawComponent from './components/flowWithdrawComponent.vue'

  const router = useRouter()
  const route = useRoute()
  
  /** 顶部一级 Tab：进入本页默认高亮“资产列表” */
  const topActive = ref('center_asset_flow')
  
  /** 点击顶部 Tab：跳页（和 index.vue / orderCenter.vue 一致） */
  const clickTopTab = (e) => {
    if (!e?.name) return
    if (e.name === 'center_myasset') router.push('/myassets') // 你的资产页路由
    if (e.name === 'center_order') router.push('/orderCenter')
    if (e.name === 'center_asset_flow') router.push('/assetRecord')
  }
  
  /** 从其他页回来时自动高亮 */
  watch(
    () => route.path,
    (p) => {
      if (p?.includes('/orderCenter')) topActive.value = 'center_order'
      else if (p?.includes('/assetRecord')) topActive.value = 'center_asset_flow'
      else topActive.value = 'center_myasset'
    },
    { immediate: true }
  )
  
  /** 二级 Tab：固定用 key，不要用中文 */
  const tabInnerList = computed(() => {
    const list = [
      { name: 'flow_mining', keyStr: 'flow_mining', sort: 10 },
      { name: 'flow_invest', keyStr: 'flow_invest', sort: 20 },
      { name: 'flow_deposit', keyStr: 'flow_deposit', sort: 30 },
      { name: 'flow_withdraw', keyStr: 'flow_withdraw', sort: 40 }
    ]
    list.forEach((item) => {
      item.keyStr = _t18(item.keyStr, ['latcoin'])
    })
    return list.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  })
  
  /** 默认选中第一个：flow_asset flow_mining */
  const tabActive = ref(tabInnerList.value[0]?.name || _t18('flow_mining'))
  
  /** 二级点击：命名/结构跟 orderCenter.vue 对齐 */
  const curIndex = ref('')
  const clickInnerTab = (e) => {
    if (!e?.name) return
    if (curIndex.value !== e.name) {
      curIndex.value = e.name
      // 你如果要进入某 tab 拉数据，在这里写：
      // if (e.name === 'flow_withdraw') fetchWithdrawList()
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .empty-wrap {
    min-height: 200px;
  }
  
  :deep(.van-tabs__wrap) {
    height: 60px;
    border-bottom: 1px solid var(--ex-border-color);
    background: var(--ex-home-list-bgcolor) !important;
  
    .van-tab__text {
      font-size: 16px;
      font-weight: normal;
    }
  
    .van-tab--shrink {
      margin-right: 20px;
    }
  }
  
  :deep(.van-tabs__nav) {
    background: var(--ex-home-list-bgcolor) !important;
  }
  
  :deep(.van-tab) {
    color: var(--ex-home-list-ftcolor) !important;
  }
  
  :deep(.van-tab--active) {
    color: var(--ex-home-list-ftcolor3) !important;
  }
  </style>
  