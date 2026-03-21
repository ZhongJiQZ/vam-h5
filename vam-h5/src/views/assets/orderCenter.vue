<!-- src/views/assets/orderCenter.vue -->
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
  
      <!-- 订单中心页：二级 tabs（order_second / order_spot / order_contract） -->
      <template v-if="topActive === 'center_order'">
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
            v-for="(item, index) in tabList"
            :key="index"
            :title="item.keyStr"
            :name="item.name"
          />
        </van-tabs>
  
        
        <div v-show="tabActive === 'order_second'">
          <SecondContractEntrust />
        </div>
        
        <div v-show="tabActive === 'order_spot'">
          <SpotEntrust />
        </div>

        <div v-show="tabActive === 'order_contract'">
          <UstandardOrderList />
        </div>

      </template>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { _t18 } from '@/utils/public'
  import SecondContractEntrust from './components/orderCenter/SecondContractEntrust.vue'
  import SpotEntrust from './components/orderCenter/SpotEntrust.vue'
  import UstandardOrderList from './components/orderCenter/UstandardOrderList.vue'


  const router = useRouter()
  const route = useRoute()
  
  /** 顶部一级 Tab：进入本页默认高亮“订单中心” */
  const topActive = ref('center_order')
  
  /** 点击顶部 Tab：跳页（和 index.vue 一致） */
  const clickTopTab = (e) => {
    if (!e?.name) return
    if (e.name === 'center_myasset') router.push('/myassets') 
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
  
  /** 二级 Tab：固定用 key，不要用中文，避免语言切换/判断对不上 */
  const tabList = computed(() => {
    const list = [
     { name: 'order_second', keyStr: 'order_second', sort: 1 },
      { name: 'order_spot', keyStr: 'order_spot', sort: 2 },
      { name: 'order_contract', keyStr: 'order_contract', sort: 3 },
      // { name: 'flow_asset', keyStr: 'flow_asset', sort: 10 },
      // { name: 'flow_deposit', keyStr: 'flow_deposit', sort: 20 },
      // { name: 'flow_withdraw', keyStr: 'flow_withdraw', sort: 30 }
    ]
    list.forEach((item) => {
      item.keyStr = _t18(item.keyStr, ['latcoin'])
    })
    return list.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  })
  
  /** 默认选中第一个：order_second */
  const tabActive = ref(tabList.value[0]?.name || 'order_second')
  
  /** 二级点击：结构名也叫 clickInnerTab（跟 index.vue 对齐） */
  const curIndex = ref('')
  const clickInnerTab = (e) => {
    if (!e?.name) return
    if (curIndex.value !== e.name) {
      curIndex.value = e.name
      // 你如果要进入某 tab 拉数据，在这里写：
      // if (e.name === 'order_contract') fetchUOrders()
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
  