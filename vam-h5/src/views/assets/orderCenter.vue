<template>
  <div class="order-center">
    <div class="order-center__tabs-wrap">
      <van-tabs
        shrink
        v-model:active="tabActive"
        class="order-center__tabs"
        title-inactive-color="#92a4b0"
        title-active-color="#e8f1f6"
        color="#008710"
        line-width="20"
        line-height="3"
        @click-tab="clickInnerTab"
      >
        <van-tab
          v-for="(item, index) in tabList"
          :key="index"
          :title="item.keyStr"
          :name="item.name"
        />
      </van-tabs>
    </div>

    <div class="order-center__panel">
      <div class="order-center__head">
        <p class="order-center__title">{{ _t18('center_order') }}</p>
        <div class="order-center__shortcuts">
          <button
            v-for="(link, i) in headerLinks"
            :key="i"
            type="button"
            class="order-center__shortcut"
            :aria-label="link.aria"
            @click="_toView(link.path)"
          />
        </div>
      </div>

      <div v-show="tabActive === 'order_second'">
        <SecondContractEntrust />
      </div>
      <div v-show="tabActive === 'order_spot'">
        <SpotEntrust />
      </div>
      <div v-show="tabActive === 'order_contract'">
        <UstandardOrderList />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { _t18, _toView } from '@/utils/public'
import SecondContractEntrust from './components/orderCenter/SecondContractEntrust.vue'
import SpotEntrust from './components/orderCenter/SpotEntrust.vue'
import UstandardOrderList from './components/orderCenter/UstandardOrderList.vue'

const headerLinks = [
  { path: '/myassets', aria: 'myassets' },
  { path: '/orderCenter', aria: 'orderCenter' },
  { path: '/assetRecord', aria: 'assetRecord' },
]

const tabList = computed(() => {
  const list = [
    { name: 'order_second', keyStr: 'order_second', sort: 1 },
    { name: 'order_spot', keyStr: 'order_spot', sort: 2 },
    { name: 'order_contract', keyStr: 'order_contract', sort: 3 },
  ]
  list.forEach((item) => {
    item.keyStr = _t18(item.keyStr, ['latcoin'])
  })
  return list.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
})

const tabActive = ref(tabList.value[0]?.name || 'order_second')
const curIndex = ref('')

const clickInnerTab = (e) => {
  if (!e?.name) return
  if (curIndex.value !== e.name) {
    curIndex.value = e.name
  }
}
</script>

<style lang="scss" scoped>
$oc-top-bg: #05101a;
$oc-tab-inactive: #92a4b0;
$oc-tab-active: #e8f1f6;
$oc-accent: #008710;

.order-center {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.order-center__tabs-wrap {
  background: $oc-top-bg;
  padding-top: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.order-center__tabs {
  :deep(.van-tabs__wrap) {
    height: 48px;
    border-bottom: none;
    background: transparent !important;
  }

  :deep(.van-tabs__nav) {
    background: transparent !important;
    padding-left: 8px;
    padding-right: 8px;
  }

  :deep(.van-tab) {
    flex: none;
    padding: 0 10px;
    font-size: 15px;
  }

  :deep(.van-tab__text) {
    font-weight: 400;
  }

  :deep(.van-tab--active .van-tab__text) {
    font-weight: 600;
    color: $oc-tab-active !important;
  }

  :deep(.van-tab:not(.van-tab--active) .van-tab__text) {
    color: $oc-tab-inactive !important;
  }

  :deep(.van-tabs__line) {
    bottom: 20px;
    background: $oc-accent;
  }

  :deep(.van-tab--shrink) {
    margin-right: 8px;
  }
}

.order-center__panel {
  background: #ffffff;
  border-radius: 16px 16px 0 0;
  min-height: calc(100vh - 52px);
  box-shadow: 0 -6px 28px rgba(5, 16, 26, 0.22);
}

.order-center__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 15px 12px;
}

.order-center__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #008710;
}

.order-center__shortcuts {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-center__shortcut {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: #d5dde3;
  flex-shrink: 0;
  cursor: pointer;
}
</style>
