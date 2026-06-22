<!-- 交易——>U本位 tradeUstandard.vue -->
<template>
  <div class="u-trade-wrap">
    <!-- 头部 -->
    <UTradingHeader
      :coinInfo="coinInfo"
      @showSidePopup="showSidePopup"
    ></UTradingHeader>
    <!-- 主体内容 -->
    <UTradingContent :coinInfo="coinInfo"></UTradingContent>

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
          marketTab="contract"
          @close="sidePopup = false"
          :headerList="headerList"
        ></LeftSide>
      </template>
    </PublicPopup>
  </div>
</template>

<script setup>
import UTradingHeader from './ustandard/header/index.vue' // U本位header部分
import UTradingContent from './ustandard/content/index.vue' // U本位content部分
import PublicPopup from '@/components/Popup/public.vue'
import LeftSide from './common/leftSide.vue'
import { showToast } from 'vant'
import { _t18 } from '@/utils/public'
import { setCollect, removeCollect } from '@/api/trade'
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
    coinInfo.value = tradeStore.contractCoinList.filter((item, index) => {
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
    coinInfo.value = tradeStore.contractCoinList.filter((item, index) => {
      return item.coin === $route.query.symbol
    })[0]
    if (!coinInfo.value) {
      coinInfo.value = tradeStore.contractCoinList[0]
    }
  } else {
    coinInfo.value = tradeStore.contractCoinList[0]
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
/* GXPEX 暗紫主题 (按 2nd Figma spec): 覆写旧 SCSS 用的 --ex-* 让旧代码自动跟随 */
.u-trade-wrap {
  --page-bg: #111216;
  --panel-bg: #211b32;
  --input-bg: #171225;
  --input-bg-hover: #1c162c;
  --text-primary: #f5f3f8;
  --text-secondary: #aaa5b3;
  --text-disabled: #625d6d;
  --buy-color: #62c294;
  --sell-color: #ef5665;
  --ask-color: #ff5968;
  --bid-color: #5fc692;
  --purple: #9b4dff;
  --divider: rgba(255, 255, 255, 0.07);

  /* 字体 */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Microsoft YaHei', sans-serif;

  /* 旧主题 token */
  --ex-default-font-color: var(--text-primary);
  --ex-passive-font-color: var(--text-secondary);
  --ex-font-color: var(--text-primary);
  --ex-font-color1: var(--text-disabled);
  --ex-font-color2: var(--purple);
  --ex-font-color6: var(--text-primary);
  --ex-font-color9: var(--text-primary);
  --ex-font-color10: var(--text-primary);
  --ex-font-color21: var(--text-secondary);
  --ex-font-color22: var(--text-primary);
  --ex-active-font-color: var(--purple);
  --ex-tip-font-color: var(--sell-color);

  --ex-default-background-color: transparent;
  --ex-div-bgColor: var(--input-bg);
  --ex-div-bgColor1: var(--buy-color);
  --ex-div-bgColor2: var(--input-bg);
  --ex-div-bgColor3: rgba(255, 255, 255, 0.18);
  --ex-div-bgColor4: var(--purple);
  --ex-div-bgColor5: var(--input-bg);
  --ex-div-bgColor7: rgba(239, 86, 101, 0.18);
  --ex-div-bgColor8: transparent;
  --ex-div-bgColor10: var(--divider);
  --ex-div-bgColor12: var(--input-bg);
  --ex-div-bgColor19: rgba(0, 0, 0, 0.6);
  --ex-div-bgColor21: rgba(155, 77, 255, 0.16);
  --ex-div-bgColor29: rgba(155, 77, 255, 0.18);

  --ex-rfd-rise-bg: rgba(98, 194, 148, 0.18);
  --ex-rfd-fall-bg: rgba(239, 86, 101, 0.18);
  --ex-rfd-draw-bg: rgba(125, 145, 157, 0.15);
  --ex-rfd-rise: var(--bid-color);
  --ex-rfd-fall: var(--ask-color);
  --ex-rfd-draw: #7d919d;

  min-height: 100%;
  background: transparent;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

/* 主交易卡片 — 整区 1 张 panel-bg 卡 (Figma 702x... at 0.5 scale = 351x...) */
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

/* 顶部 Market Order ▾ + 杠杆 ▾ (统一 38px / r10 / 13px) */
.u-trade-wrap :deep(.rightFirst) {
  display: flex;
  gap: 8px;
  height: auto !important;
  margin-bottom: 10px;

  .firstItem {
    background: #181326 !important;
    border-radius: 10px !important;
    height: 38px !important;
    transition: background-color 0.2s ease;
    overflow: hidden;
  }
  .firstItem:hover { background: #1c162b !important; }
  .left { flex: 1; width: auto !important; min-width: 0; }
  .right { flex: 0 0 58px; width: 58px !important; }
  .entrustSelect {
    height: 38px !important;
    color: #f5f3f8 !important;
    font-size: 13px;
    font-weight: 500;
    padding: 0 12px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    > div:first-child {
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .img {
      width: 8px !important;
      height: 5px !important;
      filter: brightness(2);
      flex-shrink: 0;
      margin-left: 6px;
    }
  }
}

/* Market price 占位条 */
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

/* Quantity 输入 */
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
    transition: box-shadow 0.2s ease, background-color 0.2s ease;
  }
  .amount:focus {
    box-shadow: 0 0 0 1px rgba(161, 60, 255, 0.55);
  }
}
.u-trade-wrap :deep(.rightFifth input::placeholder),
.u-trade-wrap :deep(.rightFifth input::-webkit-input-placeholder) {
  color: #625d6d !important;
}

/* 滑块卡 — 透明背景 + 灰描边，整体收紧；节点 absolute 对齐 0/25/50/75/100 */
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

  /* 5 静态钻石节点：absolute 在 track 中线，按 0/25/50/75/100% 锚定 */
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

  /* 手柄 = 大一档紫钻石 + 紫光圈 */
  .init {
    position: relative;

    /* 原模板 marl/marr 给内层 div 加了 margin-left/right，会带着手柄一起移；清零 */
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

    /* 红 XX% 在手柄正上方跟随；居中 */
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

    /* 0~3%：左对齐，让 "0%" 字段左边和手柄中心齐 */
    > div.marl .initNum {
      transform: translateX(0) !important;
    }
    /* 98~100%：右对齐 */
    > div.marr .initNum {
      transform: translateX(-100%) !important;
    }
  }
}

/* 顶部持久标签隐藏 — 红 XX% 已跟随手柄 */
.u-trade-wrap :deep(.slider-fixed-percent) {
  display: none !important;
}

/* van-slider 轨道：绝对定位到底部，左右与节点同范围 */
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

/* Available / Max / Margin / Contract Size — 统一 12px 标签 + 13px 数值 */
.u-trade-wrap :deep(.rightSix) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  margin: 14px 0 0 !important;
  font-size: 12px;
  color: #aaa5b3;
  min-height: 22px;
  > p, > div:first-child {
    flex-shrink: 0;
    font-weight: 400;
  }
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
.u-trade-wrap :deep(.nineSix) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  margin: 8px 0 0 !important;
  font-size: 12px;
  color: #aaa5b3;
  min-height: 22px;
  > p, > div:first-child {
    flex-shrink: 0;
    font-weight: 400;
  }
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

/* Buy / Sell 按钮 — 14px / 600 */
.u-trade-wrap :deep(.rightSeven) {
  margin-top: 14px !important;
  .maybutton {
    width: 100%;
    height: 40px !important;
    background: #31c48d !important;
    color: #ffffff !important;
    border-radius: 20px !important;
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

/* 持仓/订单/止盈止损/历史 tab 行 + 列表 */
.u-trade-wrap :deep(.orderBox) {
  background: transparent;
  padding: 4px 14px 24px;
  position: relative;
}
/* tab wrap 限制 80%，把右 20% 留给图标 */
.u-trade-wrap :deep(.us-order-tabs .van-tabs__wrap) {
  width: 80% !important;
  border-bottom: none !important;
  height: 36px;
  overflow: hidden !important;
}
.u-trade-wrap :deep(.us-order-tabs .van-tabs__nav) {
  background: transparent !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
.u-trade-wrap :deep(.us-order-tabs .van-tab) {
  flex: none;
  font-size: 13px;
  margin-right: 16px;
  padding: 0;
  background: transparent;
  color: #aaa5b3 !important;
}
.u-trade-wrap :deep(.us-order-tabs .van-tab--active) {
  color: #f5f3f8 !important;
  font-weight: 600;
}
.u-trade-wrap :deep(.us-order-tabs .van-tabs__line) {
  background: #a13cff !important;
  width: 18px !important;
  height: 3px !important;
  border-radius: 2px;
  bottom: 2px;
}
/* 右 30% 区域：图标右对齐，距右边 12px */
.u-trade-wrap :deep(.tab_right) {
  position: absolute !important;
  top: 4px !important;
  right: 12px !important;
  padding: 0 !important;
  z-index: 5;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end;
  gap: 14px;
  height: 28px;
  background: transparent !important;
  border: none !important;
  backdrop-filter: none !important;

  .entrustRImg {
    width: 18px;
    height: 18px;
    padding: 0;
    opacity: 0.75;
    cursor: pointer;
    transition: opacity 0.18s ease;
    box-sizing: content-box;
  }
  .entrustRImg:hover { opacity: 1; }
  .entrustRImg--off { opacity: 0.35; }
}
.u-trade-wrap :deep(.listBox) {
  padding: 10px 0 0 !important;
  background: transparent !important;
}
.u-trade-wrap :deep(.van-cell) {
  background: transparent !important;
  padding: 0 0 10px !important;
  border-bottom: none !important;
}

/* 持仓/委托/TPSL/历史 卡片 — 中性深色 #1a1626 + 微紫描边 */
.u-trade-wrap :deep(.hisToryList) {
  background: #1a1626 !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 14px 10px;
  margin-bottom: 10px;
}

/* 头部：左 [Long] [SOL/USDT] [1x] / 右 收益率大字震撼 */
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

/* 右上盈亏率大字 */
.u-trade-wrap :deep(.hisToryList .header .headerRight) {
  flex-shrink: 0;
  text-align: right;
  background: transparent !important;
  border: none !important;
}
.u-trade-wrap :deep(.hisToryList .header .yield-big) {
  font-family: 'Inter', 'DINOT-Medium', -apple-system, sans-serif !important;
  font-size: 22px !important;
  font-weight: 800 !important;
  line-height: 1 !important;
  letter-spacing: 0.3px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  background: transparent !important;
  border: none !important;
  color: #aaa5b3 !important;
}
.u-trade-wrap :deep(.hisToryList .header .yield-big.rise) {
  color: #31c48d !important;
  text-shadow: 0 0 8px rgba(49, 196, 141, 0.35);
}
.u-trade-wrap :deep(.hisToryList .header .yield-big.fall) {
  color: #ff435d !important;
  text-shadow: 0 0 8px rgba(255, 67, 93, 0.35);
}
/* Long/Short badge — 小尺寸 chip */
.u-trade-wrap :deep(.hisToryList .header .name) {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 4px;
  white-space: nowrap;
  letter-spacing: 0.2px;
  &.bgcBlue {
    background: rgba(49, 196, 141, 0.16) !important;
    color: #31c48d !important;
  }
  &.bgcRed {
    background: rgba(255, 67, 93, 0.16) !important;
    color: #ff435d !important;
  }
}
/* 币对名 SOL/USDT — 与明细行同档 13px 视觉更协调 */
.u-trade-wrap :deep(.hisToryList .header .headerLeft .fw-bold) {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #f5f3f8 !important;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.2px;
}
/* 杠杆 1x */
.u-trade-wrap :deep(.hisToryList .header .headerLeftIcon) {
  font-size: 11px;
  font-weight: 500;
  color: #aaa5b3;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  white-space: nowrap;
}

/* 详情行 — 紧凑 */
.u-trade-wrap :deep(.hisToryList .list) {
  display: flex;
  flex-direction: column;
  gap: 0;
}
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

/* 操作按钮 — 2×2 grid，长文本省略，11px 紧凑
   minmax(0, 1fr) 强制 track 下限 = 0：避免长文本 (如 "Adjust margin") 把列撑宽
   让上下两行 4 个按钮严格等宽 */
.u-trade-wrap :deep(.hisToryList .bottomList) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  .itemBotton {
    /* 抵消 EntrustOrderItem scoped 里给非最后一个按钮加的 margin-right: 5px，
       否则 grid 第 1/2/3 个按钮可见宽度比第 4 个少 5px，看着不齐 */
    margin: 0 !important;
    height: 30px;
    padding: 0 10px;
    background: rgba(161, 60, 255, 0.12);
    border: 1px solid rgba(161, 60, 255, 0.18);
    color: #a13cff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    letter-spacing: 0.2px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.18s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    min-width: 0;
  }
  .itemBotton:active {
    background: rgba(161, 60, 255, 0.22);
  }
}
</style>

<!-- 弹层 (popover / popup) 经 Teleport 挂在 body，scoped 触不到；全局覆盖 -->
<style lang="scss">
/* 市价/限价 + 杠杆 popover */
.van-popover .van-popover__content {
  background: #211b32 !important;
  border-radius: 10px !important;
  overflow: hidden;
}
.van-popover .rightScondList,
.van-popover .rightScondListNum {
  background-color: transparent !important;
  padding: 4px 0 !important;
  font-size: 13px;
  min-width: 104px;
  color: #f5f3f8;
}
.van-popover .rightScondListItem {
  padding: 10px 14px !important;
  text-align: center;
  color: #f5f3f8;
  cursor: pointer;
  transition: background-color 0.18s ease;
  font-variant-numeric: tabular-nums;
}
.van-popover .rightScondListItem:hover,
.van-popover .rightScondListItem:active {
  background: rgba(161, 60, 255, 0.12);
}
.van-popover .rightScondListItem.hightBlue {
  color: #a13cff !important;
  font-weight: 600;
}

/* 聚合精度 / 展示模式 弹层 (PublicPopup bottom sheet) */
.van-popup.van-popup--bottom {
  background: #211b32 !important;
  border-radius: 14px 14px 0 0 !important;
  color: #f5f3f8;
}
.van-popup.van-popup--bottom .bbList {
  padding: 4px 0 16px;
  background: transparent;
}
.van-popup.van-popup--bottom .bbList .item {
  color: #f5f3f8 !important;
  font-size: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
.van-popup.van-popup--bottom .bbList .item:last-child {
  border-bottom: none;
}

/* 切币种 左侧抽屉：玻璃模糊 + 让出顶部 (back+tabs) + 内部可滚 */
.van-popup.van-popup--left {
  background: rgba(26, 22, 42, 0.65) !important;
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  width: 65% !important;
  top: calc(106px + env(safe-area-inset-top)) !important;
  height: calc(100% - 106px - env(safe-area-inset-top)) !important;
  /* van 默认 translateY(-50%) 居中，跟我们的 top 冲突，置 0 */
  transform: translate(0, 0) !important;
  overflow-y: auto !important;
  overflow-x: hidden;
  border-top-right-radius: 14px;
  -webkit-overflow-scrolling: touch;
}
/* 紫高斯光晕（挂在 ::before/::after 上，popup 自身 position:fixed 已是定位上下文） */
.van-popup.van-popup--left::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -60px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, #a642ec 0%, #802bda 50%, transparent 80%);
  filter: blur(70px);
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}
.van-popup.van-popup--left::after {
  content: '';
  position: absolute;
  bottom: -80px;
  left: -60px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, #6f33d6 0%, #4d22a8 50%, transparent 80%);
  filter: blur(70px);
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}
.van-popup.van-popup--left > * {
  position: relative;
  z-index: 1;
}
</style>
