<!-- 交易——>币币交易 -->
<template>
  <div class="u-trade-wrap bb-mode">
    <!-- 头部 -->
    <BBTradingHeader :coinInfo="coinInfo" @showSidePopup="showSidePopup"></BBTradingHeader>
    <!-- 内容，订单 -->
    <BBTradingContent :coinInfo="coinInfo"></BBTradingContent>
    <!-- 左侧切换币种 -->
    <PublicPopup
      :show="sidePopup"
      @handelClose="sidePopup = false"
      :direction="`left`"
      :height="`100%`"
      :width="`80%`"
      :showHeader="false"
      :empty="false"
    >
      <template #emptyContentCustomize>
        <LeftSide
          marketTab="spot"
          @close="sidePopup = false"
          :headerList="headerList"
        ></LeftSide>
      </template>
    </PublicPopup>
  </div>
</template>

<script setup>
import BBTradingHeader from './bbTrading/header/index.vue' // BB header部分
import BBTradingContent from './bbTrading/content/index.vue' // BB 内容部分
import PublicPopup from '@/components/Popup/public.vue'
import LeftSide from './common/leftSide.vue'
import { showToast } from 'vant'
import { _t18 } from '@/utils/public'
import { setCollect, removeCollect, getCollect } from '@/api/trade'
import { useTradeStore } from '@/store/trade'
const tradeStore = useTradeStore()
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
const $route = useRoute()
const props = defineProps({
  headerList: {
    type: Array
  }
})
/**
 * 币种信息
 */
// 当前币种信息
const coinInfo = ref({})
// 监听路由展示对应币种信息
watch(
  () => $route.query.symbol,
  (val) => {
    coinInfo.value = tradeStore.spotCoinList.filter((item, index) => {
      return item.coin === val
    })[0]
  },
  {
    deep: true
  }
)
// 初始化展示币种信息
const init = () => {
  if ($route.query.symbol) {
    coinInfo.value = tradeStore.spotCoinList.filter((item, index) => {
      return item.coin === $route.query.symbol
    })[0]
    if (!coinInfo.value) {
      coinInfo.value = tradeStore.spotCoinList[0]
    }
  } else {
    coinInfo.value = tradeStore.spotCoinList[0]
  }
}
onMounted(() => {
  init()
})
/**
 * 侧边栏
 */
const sidePopup = ref(false)
const showSidePopup = () => {
  sidePopup.value = true
}
</script>

<style lang="scss" scoped>
/* === 复用 U本位 的卡片 + 字体 + 输入 + 按钮基础样式 === */

/* 主交易卡：盘口(左) + 表单(右) 整合在 #211B32 单卡内 */
.u-trade-wrap :deep(.content) {
  display: grid;
  grid-template-columns: minmax(0, 0.44fr) minmax(0, 0.56fr);
  gap: 14px;
  padding: 12px 12px 14px;
  margin: 12px 12px 14px;
  background: #211b32;
  border-radius: 16px;
  align-items: stretch;
  box-sizing: border-box;
}

.u-trade-wrap :deep(.content_left),
.u-trade-wrap :deep(.content_right) {
  padding: 0;
  background: transparent;
  box-sizing: border-box;
  min-width: 0;
}

/* === BB 独有：Buy / Sell 二选一 段 === */
.u-trade-wrap :deep(.rightFirst) {
  display: grid !important;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  height: auto !important;
  margin-bottom: 10px;
  background: #181326;
  border-radius: 10px;
  padding: 3px;

  .name {
    height: 32px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: #aaa5b3;
    cursor: pointer;
    transition: background-color 0.18s ease, color 0.18s ease;
    -webkit-tap-highlight-color: transparent;

    &.hightColor {
      background: linear-gradient(135deg, #3cd699 0%, #1eb47a 100%);
      color: #ffffff;
      box-shadow: 0 0 12px rgba(49, 196, 141, 0.5);
    }
    &.hightColorRed {
      background: linear-gradient(135deg, #ff2447 0%, #db1638 100%);
      color: #ffffff;
      box-shadow:
        0 0 14px rgba(255, 36, 71, 0.7),
        0 0 4px rgba(255, 36, 71, 0.45);
    }
  }
}

/* Market / Limit 切换 chip */
.u-trade-wrap :deep(.rightScond) {
  margin-bottom: 10px;

  .entrustSelect {
    height: 38px !important;
    background: #181326 !important;
    border-radius: 10px;
    color: #f5f3f8;
    font-size: 13px;
    font-weight: 500;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .img {
      width: 8px !important;
      height: 5px !important;
      filter: brightness(2);
    }
  }
}

/* Market price 占位 */
.u-trade-wrap :deep(.rightThird) {
  width: 100% !important;
  height: 38px !important;
  background: #181326 !important;
  border-radius: 10px !important;
  color: #aaa5b3 !important;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: flex-start !important;
  padding: 0 12px;
  margin-top: 0 !important;
  margin-bottom: 10px;
  box-sizing: border-box;
}

/* Price / Qty / Turnover 输入 */
.u-trade-wrap :deep(.rightFifth) {
  margin-top: 0 !important;
  margin-bottom: 10px;
  .amount {
    width: 100% !important;
    height: 38px !important;
    background: #181326 !important;
    border-radius: 10px !important;
    color: #f5f3f8 !important;
    font-size: 13px;
    font-weight: 500;
    text-align: left;
    padding: 0 12px;
    box-sizing: border-box;
    transition: box-shadow 0.2s ease;
  }
  .amount:focus {
    box-shadow: 0 0 0 1px rgba(161, 60, 255, 0.55);
  }
}
.u-trade-wrap :deep(.rightFifth input::placeholder),
.u-trade-wrap :deep(.rightFifth input::-webkit-input-placeholder) {
  color: #625d6d !important;
}

/* === 滑块 — 完全对齐 U本位 (GXPEX/index.html 设计) === */
.u-trade-wrap :deep(.rightFourth) {
  position: relative;
  width: 100% !important;
  margin: 6px 0 12px;
  padding: 0;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  height: 50px;
  box-sizing: border-box;

  /* 5 静态钻石节点 */
  .lineBg {
    position: absolute !important;
    left: 10px;
    right: 10px;
    bottom: 10px !important;
    width: auto !important;
    height: 10px !important;
    top: auto !important;
    display: block !important;
    z-index: 1;
    margin: 0 !important;
    pointer-events: none;

    .node {
      position: absolute !important;
      top: 50% !important;
      width: 10px !important;
      height: 10px !important;
      background: #444446 !important;
      transform: translate(-50%, -50%) rotate(45deg) !important;
      margin: 0 !important;
      border-radius: 1px !important;
    }
    .node:nth-child(1) { left: 0%; }
    .node:nth-child(2) { left: 25%; }
    .node:nth-child(3) { left: 50%; }
    .node:nth-child(4) { left: 75%; }
    .node:nth-child(5) { left: 100%; }
    .node.active { background: #9146e8 !important; }
  }

  .init {
    position: relative;
    > div { margin: 0 !important; position: relative; }

    .initimg {
      width: 14px !important;
      height: 14px !important;
      background: #9146e8 !important;
      transform: rotate(45deg) !important;
      margin: 0 !important;
      border-radius: 1px !important;
      box-shadow: 0 0 0 3px rgba(145, 70, 232, 0.12) !important;
    }

    .initNum {
      display: block !important;
      position: absolute !important;
      bottom: 18px !important;
      left: 50% !important;
      top: auto !important;
      transform: translateX(-50%) !important;
      margin: 0 !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      padding: 0 !important;
      background: transparent !important;
      color: #f15b72 !important;
      border-radius: 0 !important;
      line-height: 1 !important;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      pointer-events: none;
    }
    /* 边缘修正 */
    > div.marl .initNum { transform: translateX(0) !important; }
    > div.marr .initNum { transform: translateX(-100%) !important; }
  }
}

/* van-slider 轨道：绝对底部 + 节点同范围 */
.u-trade-wrap :deep(.rightFourth .van-slider) {
  position: absolute !important;
  bottom: 14px !important;
  left: 10px !important;
  right: 10px !important;
  top: auto !important;
  width: auto !important;
  height: 3px !important;
  background: #414143 !important;
  border-radius: 999px !important;
  z-index: 2;
}
.u-trade-wrap :deep(.rightFourth .van-slider__bar) {
  background: #9146e8 !important;
  border-radius: 999px !important;
  transform: none !important;
  height: 100% !important;
}

/* Available / 数量 / 手续费 行 */
.u-trade-wrap :deep(.rightSix) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  margin: 12px 0 0 !important;
  font-size: 12px;
  color: #aaa5b3;
  min-height: 22px;
  > div:first-child { flex-shrink: 0; font-weight: 400; }
  .number {
    color: #f5f3f8;
    font-weight: 500;
    min-width: 0;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    font-size: clamp(11px, 3vw, 13px);
    font-variant-numeric: tabular-nums;
  }
}

/* Buy / Sell 大按钮 */
.u-trade-wrap :deep(.rightSeven) {
  margin-top: 14px !important;
  .maybutton {
    width: 100%;
    height: 40px !important;
    background: #31c48d !important;
    color: #ffffff !important;
    border-radius: 20px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px !important;
    font-weight: 600 !important;
    letter-spacing: 0.2px;
    box-shadow: 0 4px 12px rgba(49, 196, 141, 0.22);
    transition: background-color 0.2s ease, opacity 0.2s ease;
  }
  .maybutton:active { opacity: 0.85; }
  .maybutton.hightColorRed {
    background: #ff435d !important;
    box-shadow: 0 4px 12px rgba(255, 67, 93, 0.22);
  }
}

/* 分隔线 */
.u-trade-wrap :deep(.line) {
  background: rgba(255, 255, 255, 0.09) !important;
  height: 1px !important;
  margin: 8px 14px;
}

.u-trade-wrap :deep(.rightSeat) {
  display: none;
}

/* === BB 订单卡：同 U本位 暗紫卡 + 紧凑明细 + 撤单按钮 === */
.u-trade-wrap :deep(.hisToryList) {
  background: #1a1626 !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 14px 10px;
  margin-bottom: 10px;
}

.u-trade-wrap :deep(.hisToryList .header) {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 6px;
}

.u-trade-wrap :deep(.hisToryList .header .headerLeft) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f5f3f8;
  font-size: 13px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
}

/* 买/卖 badge */
.u-trade-wrap :deep(.hisToryList .header .name) {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 4px;
  white-space: nowrap;
  letter-spacing: 0.2px;
  background: rgba(49, 196, 141, 0.16);
  color: #31c48d;
}
.u-trade-wrap :deep(.hisToryList .header .name.name2) {
  background: rgba(255, 67, 93, 0.16);
  color: #ff435d;
}

/* 币对名 */
.u-trade-wrap :deep(.hisToryList .header .pair-name) {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #f5f3f8 !important;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.2px;
}

/* 撤单按钮 */
.u-trade-wrap :deep(.hisToryList .header .headerRight) {
  flex-shrink: 0;
  height: 26px;
  padding: 0 12px;
  background: rgba(161, 60, 255, 0.12);
  border: 1px solid rgba(161, 60, 255, 0.2);
  color: #a13cff;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.18s ease;
}
.u-trade-wrap :deep(.hisToryList .header .headerRight:active) {
  background: rgba(161, 60, 255, 0.22);
}

/* 明细行 */
.u-trade-wrap :deep(.hisToryList .list .item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #8c8696;
  padding: 5px 0;
  gap: 8px;
  min-height: 20px;
  > div:first-child {
    flex-shrink: 0;
    font-weight: 400;
  }
  .numItem {
    color: #ebe7f0;
    font-weight: 500;
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-size: 12px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0.1px;
  }
}
</style>
