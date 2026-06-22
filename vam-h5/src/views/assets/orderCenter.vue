<template>
  <div class="order-center">
    <header class="oc-header">
      <button type="button" class="oc-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="oc-header__back-icon" />
      </button>
      <h1 class="oc-header__title">{{ _t18('center_order') }}</h1>
      <div class="oc-header__actions">
        <AssetsShortcuts />
      </div>
    </header>

    <div class="oc-tabs-wrap">
      <van-tabs
        shrink
        v-model:active="tabActive"
        class="oc-tabs"
        :line-width="0"
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

    <div class="oc-panel">
      <SecondContractEntrust v-if="tabActive === 'order_second'" />
      <SpotEntrust v-if="tabActive === 'order_spot'" />
      <UstandardOrderList v-if="tabActive === 'order_contract'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { _t18, _back } from '@/utils/public'
import SecondContractEntrust from './components/orderCenter/SecondContractEntrust.vue'
import SpotEntrust from './components/orderCenter/SpotEntrust.vue'
import UstandardOrderList from './components/orderCenter/UstandardOrderList.vue'
import AssetsShortcuts from './components/AssetsShortcuts.vue'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'

const tabList = computed(() => {
  const list = [
    { name: 'order_second', keyStr: 'order_second', sort: 1 },
    { name: 'order_spot', keyStr: 'order_spot', sort: 2 },
    { name: 'order_contract', keyStr: 'order_contract', sort: 3 }
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
.order-center {
  position: relative;
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: env(safe-area-inset-bottom, 0);
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏（back 左 / 标题居中 / shortcuts 右） */
.oc-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.oc-header__back {
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

.oc-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.oc-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.oc-header__actions {
  position: absolute;
  right: 12px;
  top: calc(14px + env(safe-area-inset-top));
  height: 32px;
  display: flex;
  align-items: center;
}

/* 顶部一级 tab — pill chip 风格（跟下面子 tab 的紫色短下划线形成视觉层级） */
.oc-tabs-wrap {
  padding: 8px 14px 12px;
}

.oc-tabs {
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

  /* 选中态 — 紫渐变实心 pill + 白字 + 紫光投影 */
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

/* 内容区 — 透明，子组件自带玻璃卡时直接显示 */
.oc-panel {
  position: relative;
  z-index: 1;
  padding: 8px 14px 0;
}
</style>
