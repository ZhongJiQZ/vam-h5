<!-- 底部 TabBar - GXPEX 风格：4 tab + 中间凸起 Swap 按钮 -->
<script setup>
import { useMainStore } from '@/store/index.js'
import { _toView } from '../../utils/public'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import tabCenterImg from '@/assets/images/gxpex/home/jjddd.png'
const router = useRouter()
const mainStore = useMainStore()
let currentTab = ref({})

// 哪个 key 作为中间凸起 (按 Figma：Swap/交易 在中央)
const CENTER_KEY = 'trade'

const getTabbarList = computed(() => mainStore.getTabbarList.filter((e) => e.isOpen))

// 拆: [左半], 中央, [右半]
const splitTabs = computed(() => {
  const list = getTabbarList.value
  const idx = list.findIndex((t) => t.key === CENTER_KEY)
  if (idx === -1) return { left: list.slice(0, 2), center: list[2], right: list.slice(3) }
  return { left: list.slice(0, idx), center: list[idx], right: list.slice(idx + 1) }
})

watch(
  router.currentRoute,
  (newVal) => {
    currentTab.value =
      getTabbarList.value.find((e) => e.key == newVal.name?.toLowerCase()) ?? {}
  },
  { immediate: true }
)

const isActive = (item) => currentTab.value.key === item.key
</script>

<template>
  <div class="tab-bar-box" v-if="currentTab.linkUrl !== '/trade'">
    <!-- 中间凸起按钮 - 提到 tab-bar 外避免 mask -->
    <img
      v-if="splitTabs.center"
      :src="tabCenterImg"
      class="center-btn-fab"
      alt="Swap"
      @click="_toView(splitTabs.center.linkUrl)"
    />
    <div class="tab-bar">
      <!-- 左侧 tab -->
      <div
        v-for="item in splitTabs.left"
        :key="item.key"
        class="item"
        :class="{ active: isActive(item) }"
        @click="_toView(item.linkUrl)"
      >
        <div class="itemTop">
          <image-load :filePath="item.checkedImgUrl" v-show="isActive(item)" class="tabbarImg" />
          <image-load :filePath="item.imgUrl" v-show="!isActive(item)" v-cloak class="tabbarImg" />
        </div>
        <div class="name text-ellipsis2">
          {{ _t18(item.key, ['paxpay', 'bitmake', 'latcoin']) }}
        </div>
      </div>

      <!-- 中央占位，给凸起按钮留位置 + 显示 label -->
      <div class="center-slot" v-if="splitTabs.center">
        <div class="name center-name text-ellipsis2">
          {{ _t18(splitTabs.center.key, ['paxpay', 'bitmake', 'latcoin']) }}
        </div>
      </div>

      <!-- 右侧 tab -->
      <div
        v-for="item in splitTabs.right"
        :key="item.key"
        class="item"
        :class="{ active: isActive(item) }"
        @click="_toView(item.linkUrl)"
      >
        <div class="itemTop">
          <image-load :filePath="item.checkedImgUrl" v-show="isActive(item)" class="tabbarImg" />
          <image-load :filePath="item.imgUrl" v-show="!isActive(item)" v-cloak class="tabbarImg" />
        </div>
        <div class="name text-ellipsis2">
          {{ _t18(item.key, ['paxpay', 'bitmake', 'latcoin']) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$bar-bg: #1b1b1b;
$purple: #872ddc;
$inactive: #666666;

.tab-bar-box {
  position: fixed;
  z-index: 9;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: var(--ex-max-width);
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: transparent;
}

.tab-bar {
  position: relative;
  height: 64px;
  display: flex;
  align-items: stretch;
  background: $bar-bg;
  border-radius: 22px 22px 0 0;
  /* Figma 顶部圆形凹槽：用 radial-gradient mask */
  -webkit-mask:
    radial-gradient(circle at 50% -2px, transparent 33px, #000 34px);
  mask:
    radial-gradient(circle at 50% -2px, transparent 33px, #000 34px);
}

.item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-top: 8px;
  color: $inactive;
  cursor: pointer;
  user-select: none;

  .itemTop {
    line-height: 0;
  }
  .name {
    font-family: 'PingFang SC', -apple-system, sans-serif;
    font-size: 11px;
    line-height: 1.1;
    color: $inactive;
    text-align: center;
    letter-spacing: 0.1px;
  }
  &.active .name {
    color: $purple;
    font-weight: 500;
  }
}

.tabbarImg {
  width: 22px;
  height: 22px;
  display: block;
}

/* 中间凸起 */
.center-slot {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 6px;
}

/* 中央凸起 - 提到 mask 外 */
.center-btn-fab {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  object-fit: contain;
  cursor: pointer;
  z-index: 10;
  filter: drop-shadow(0 0 14px rgba(160, 65, 237, 0.6));
  transition: transform 0.15s ease;
  &:active { transform: translateX(-50%) scale(0.94); }
}
.center-name {
  margin-top: 30px;
  font-size: 11px;
  color: $inactive;
}
</style>
