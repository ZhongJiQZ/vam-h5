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

    <div class="order-center__sheet-outer">
      <div class="order-center__sheet">
        <div class="order-center__sheet-bg" aria-hidden="true" />
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
              >
                <img
                  :src="isHeaderLinkActive(link.path) ? link.imgActive : link.img"
                  alt=""
                  class="order-center__shortcut-img"
                />
              </button>
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { _t18, _toView } from '@/utils/public'
import SecondContractEntrust from './components/orderCenter/SecondContractEntrust.vue'
import SpotEntrust from './components/orderCenter/SpotEntrust.vue'
import UstandardOrderList from './components/orderCenter/UstandardOrderList.vue'
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
  overflow-x: hidden;
  overflow-y: visible;
}

.order-center__tabs-wrap {
  position: relative;
  z-index: 2;
  background: $oc-top-bg;
  padding-top: 8px;
  padding-bottom: 8px;
}

.order-center__sheet-outer {
  background: $oc-top-bg;
  overflow: visible;
}

.order-center__sheet {
  position: relative;
  z-index: 0;
  min-height: calc(100vh - 64px);
  border-radius: 16px 16px 0 0;
  background: #ffffff;
  overflow: visible;
}

.order-center__sheet-bg {
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

.order-center__panel {
  position: relative;
  z-index: 1;
  background: transparent;
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
    display: none !important;
  }

  :deep(.van-tab--shrink) {
    margin-right: 8px;
  }
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

.order-center__shortcut-img {
  width: 24px;
  height: 24px;
  display: block;
  object-fit: contain;
}
</style>
