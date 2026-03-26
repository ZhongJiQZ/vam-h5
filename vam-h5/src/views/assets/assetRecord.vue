<!-- src/views/assets/assetRecord.vue -->
<template>
  <div class="asset-record">
    <div class="asset-record__tabs-wrap">
      <van-tabs
        shrink
        v-model:active="tabActive"
        class="asset-record__tabs"
        title-inactive-color="#92a4b0"
        title-active-color="#e8f1f6"
        color="#008710"
        line-width="20"
        line-height="3"
        @click-tab="clickInnerTab"
      >
        <van-tab
          v-for="(item, index) in tabInnerList"
          :key="index"
          :title="item.keyStr"
          :name="item.name"
        />
      </van-tabs>
    </div>

    <div class="asset-record__sheet-outer">
      <div class="asset-record__sheet">
        <div class="asset-record__sheet-bg" aria-hidden="true" />
        <div class="asset-record__panel">
          <div class="asset-record__head">
            <p class="asset-record__title">{{ _t18('center_asset_flow') }}</p>
            <div class="asset-record__shortcuts">
              <button
                v-for="(link, i) in headerLinks"
                :key="i"
                type="button"
                class="asset-record__shortcut"
                :aria-label="link.aria"
                @click="_toView(link.path)"
              >
                <img
                  :src="isHeaderLinkActive(link.path) ? link.imgActive : link.img"
                  alt=""
                  class="asset-record__shortcut-img"
                />
              </button>
            </div>
          </div>

          <div class="asset-record__flow">
            <flowMiningComponent v-show="tabActive === 'flow_mining'" />
            <flowInvestComponent v-show="tabActive === 'flow_invest'" />
            <flowDepositComponent v-show="tabActive === 'flow_deposit'" />
            <flowWithdrawComponent v-show="tabActive === 'flow_withdraw'" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { _t18, _toView } from '@/utils/public'
import flowMiningComponent from './components/flowMiningComponent.vue'
import flowInvestComponent from './components/flowInvestComponent.vue'
import flowDepositComponent from './components/flowDepositComponent.vue'
import flowWithdrawComponent from './components/flowWithdrawComponent.vue'
import imgQianbao from '@/assets/images/assets/qianbao.png'
import imgQianbaoX from '@/assets/images/assets/qianbao-x.png'
import imgWenhao from '@/assets/images/assets/wenhao.png'
import imgWenhaoX from '@/assets/images/assets/wenhao-x.png'
import imgLishi from '@/assets/images/assets/lishi.png'
import imgLishiX from '@/assets/images/assets/lishi-x.png'

const route = useRoute()

const headerLinks = [
  { path: '/myassets', aria: 'myassets', img: imgQianbao, imgActive: imgQianbaoX },
  { path: '/orderCenter', aria: 'orderCenter', img: imgWenhao, imgActive: imgWenhaoX },
  { path: '/assetRecord', aria: 'assetRecord', img: imgLishi, imgActive: imgLishiX },
]

const isHeaderLinkActive = (path) =>
  route.path === path || route.path.startsWith(`${path}/`)

const tabInnerList = computed(() => {
  const list = [
    { name: 'flow_mining', keyStr: 'flow_mining', sort: 10 },
    { name: 'flow_invest', keyStr: 'flow_invest', sort: 20 },
    { name: 'flow_deposit', keyStr: 'flow_deposit', sort: 30 },
    { name: 'flow_withdraw', keyStr: 'flow_withdraw', sort: 40 },
  ]
  list.forEach((item) => {
    item.keyStr = _t18(item.keyStr, ['latcoin'])
  })
  return list.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
})

const tabActive = ref(tabInnerList.value[0]?.name || 'flow_mining')
const curIndex = ref('')

const clickInnerTab = (e) => {
  if (!e?.name) return
  if (curIndex.value !== e.name) {
    curIndex.value = e.name
  }
}
</script>

<style lang="scss" scoped>
$ar-top-bg: #05101a;
$ar-tab-inactive: #92a4b0;
$ar-tab-active: #e8f1f6;
$ar-accent: #008710;

.asset-record {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: env(safe-area-inset-bottom, 0);
  overflow-x: hidden;
  overflow-y: visible;
}

.asset-record__tabs-wrap {
  position: relative;
  z-index: 2;
  background: $ar-top-bg;
  padding-top: 8px;
  padding-bottom: 8px;
}

.asset-record__sheet-outer {
  background: $ar-top-bg;
  overflow: visible;
}

.asset-record__sheet {
  position: relative;
  z-index: 0;
  min-height: calc(100vh - 64px);
  border-radius: 16px 16px 0 0;
  background: #ffffff;
  overflow: visible;
}

.asset-record__sheet-bg {
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -8px 32px rgba(5, 16, 26, 0.18);
  pointer-events: none;
}

.asset-record__panel {
  position: relative;
  z-index: 1;
  background: transparent;
}

.asset-record__tabs {
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
    color: $ar-tab-active !important;
  }

  :deep(.van-tab:not(.van-tab--active) .van-tab__text) {
    color: $ar-tab-inactive !important;
  }

  :deep(.van-tabs__line) {
    display: none !important;
  }

  :deep(.van-tab--shrink) {
    margin-right: 8px;
  }
}

.asset-record__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 15px 8px;
}

.asset-record__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: $ar-accent;
}

.asset-record__shortcuts {
  display: flex;
  align-items: center;
  gap: 10px;
}

.asset-record__shortcut {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  flex-shrink: 0;
  cursor: pointer;
}

.asset-record__shortcut-img {
  width: 24px;
  height: 24px;
  display: block;
  object-fit: contain;
}

.asset-record__flow {
  min-height: 200px;
}
</style>
