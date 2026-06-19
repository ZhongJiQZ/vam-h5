<template>
  <div class="footer">
    <!-- Deposit & Earn 活动卡 -->
    <div class="promo" @click="onPromo">
      <img :src="promoBg" class="promo__bg" alt="" />
      <div class="promo__content">
        <img :src="promoTitle" class="promo__title" alt="Deposit & Earn" />
        <div class="promo__btn">
          <span>Limited Offer</span>
        </div>
      </div>
    </div>

    <div class="headerChoose" style="display: none;">
      <van-tabs
        v-model:active="showTab"
        line-width="20"
        line-height="2"
        title-active-color="#17AC74"
        color="#17ac74"
        title-inactive-color="#5d626d"
        @click-tab="handelShowTab(showTab)"
        shrink
      >
        <van-tab v-for="(item, index) in headerList" :key="index">
          <template #title>
            <div v-if="item.show">{{ item.name }}</div>
          </template>
        </van-tab>
      </van-tabs>
    </div>
    <div class="new-header" style="display: none">
      {{ headerList[0].name }}
    </div>
    <div class="main">
      <!-- Figma 风格 2 列表头 -->
      <div class="market-header">
        <div class="market-header__name">Name</div>
        <div class="market-header__price">Price / Change</div>
      </div>

      <!-- <div v-if="tradeStore.secondContractCoinList.length">
          <CurrencyItem
            v-for="(item, index) in tradeStore.secondContractCoinList"
            :key="index"
            :currencyItem="item"
            @click="linkTo(item)"
          ></CurrencyItem>
      </div>
      <Nodata v-else></Nodata> -->

      <div v-if="showTab === 0 && headerList[0].show" class="coin-list">
        <div v-if="currentCoinList0.length">
          <CurrencyItem
            v-for="(item, index) in currentCoinList0"
            :key="index"
            :currencyItem="item"
            @click="linkTo(item)"
          ></CurrencyItem>
        </div>
        <Nodata v-else></Nodata>
      </div>
      <div v-if="showTab === 1 && headerList[1].show" class="coin-list">
        <div v-if="currentCoinList1.length">
          <CurrencyItem
            v-for="(item, index) in currentCoinList1"
            :key="index"
            :currencyItem="item"
            @click="linkTo(item)"
          ></CurrencyItem>
        </div>
        <Nodata v-else></Nodata>
      </div>
      <div v-if="showTab === 2 && headerList[2].show" class="coin-list">
        <div v-if="currentCoinList2">
          <CurrencyItem
            v-for="(item, index) in currentCoinList2"
            :key="index"
            :currencyItem="item"
            @click="linkTo(item)"
          ></CurrencyItem>
        </div>
        <Nodata v-else></Nodata>
      </div>
    </div>
  </div>
</template>
<script setup>
import {
  letterSmallToLarge,
  letterLargeToSmall,
  LatestpriceLargeToSmall,
  LatestpriceSmallToLarge,
  filterKeyWord
} from '@/utils/filters'
import CurrencyItem from '@/components/CurrencyList/currencyItem.vue'
import { useTradeStore } from '@/store/trade/index'
import { useMainStore } from '@/store/index.js'
import { useRouter } from 'vue-router'
import { _t18 } from '@/utils/public'
import promoBg from '@/assets/images/gxpex/home/promo-bg.png'
import promoTitle from '@/assets/images/gxpex/home/promo-title.png'
const tradeStore = useTradeStore()
const mainStroe = useMainStore()
const $router = useRouter()
const onPromo = () => $router.push('/recharge')
const linkTo = (item) => {
  if (!['latcoin'].includes(__config._APP_ENV)) {
    mainStroe.setTradeStatus(Number(0))
    $router.push(`/trade?symbol=${item.coin}`)
  } else {
    mainStroe.setTradeStatus(Number(0))
    $router.push(`/tradeU?symbol=${item.coin}`)
  }
}
//home|menu
const headerList = computed(() => {
  return [
    {
      name: _t18(`coinbase_h_l_hot`, ['latcoin']),//热门
      show: true
    },
    // {
    //   name: _t18(`coinbase_h_l_out`, ['latcoin']),//外汇
    //   show: true
    // },
    // {
    //   name: _t18(`coinbase_h_l_gold`),
    //   show: ['latcoin'].includes(__config._APP_ENV) ? false : true
    // }
  ]
})
const currentCoinList0 = ref(
  tradeStore.secondContractCoinList.filter((it, inx) => {
    return it.coinType == 2
  })
)

const currentCoinList1 = ref(
  tradeStore.secondContractCoinList.filter((it, inx) => {
    return it.coinType == 1
  })
)

const currentCoinList2 = ref(
  tradeStore.secondContractCoinList.filter((it, inx) => {
    return it.coinType == 3
  })
)
// 筛选
let arrowList = ref({
  firstIcon: 0,
  secondIcon: 0,
  thirdIcon: 0
})

// 切换名称
const toDealSort = () => {
  arrowList.value.secondIcon = 0
  arrowList.value.thirdIcon = 0
  console.log(arrowList.value)
  if (arrowList.value.firstIcon == 0) {
    arrowList.value.firstIcon = 1
    currentCoinList0.value = letterSmallToLarge(currentCoinList0.value, 'coin')
    currentCoinList1.value = letterSmallToLarge(currentCoinList1.value, 'coin')
    currentCoinList2.value = letterSmallToLarge(currentCoinList2.value, 'coin')
  } else if (arrowList.value.firstIcon == 1) {
    arrowList.value.firstIcon = 2
    currentCoinList0.value = letterLargeToSmall(currentCoinList0.value, 'coin')
    currentCoinList1.value = letterLargeToSmall(currentCoinList1.value, 'coin')
    currentCoinList2.value = letterLargeToSmall(currentCoinList2.value, 'coin')
  } else if (arrowList.value.firstIcon == 2) {
    arrowList.value.firstIcon = 0
    currentCoinList0.value = tradeStore.secondContractCoinList.filter((it, inx) => {
      return it.coinType == 2
    })
    currentCoinList1.value = tradeStore.secondContractCoinList.filter((it, inx) => {
      return it.coinType == 1
    })
    currentCoinList2.value = tradeStore.secondContractCoinList.filter((it, inx) => {
      return it.coinType == 3
    })
  }
}
// 切换最新价
const toUpSort = () => {
  arrowList.value.firstIcon = 0
  arrowList.value.thirdIcon = 0
  // console.log(arrowList.value)
  if (arrowList.value.secondIcon == 0) {
    arrowList.value.secondIcon = 1
    currentCoinList0.value = LatestpriceLargeToSmall(
      currentCoinList0.value,
      tradeStore.allCoinPriceInfo,
      'close'
    )
    currentCoinList1.value = LatestpriceLargeToSmall(
      currentCoinList1.value,
      tradeStore.allCoinPriceInfo,
      'close'
    )
    currentCoinList2.value = LatestpriceLargeToSmall(
      currentCoinList2.value,
      tradeStore.allCoinPriceInfo,
      'close'
    )
  } else if (arrowList.value.secondIcon == 1) {
    arrowList.value.secondIcon = 2
    currentCoinList0.value = LatestpriceSmallToLarge(
      currentCoinList0.value,
      tradeStore.allCoinPriceInfo,
      'close'
    )
    currentCoinList1.value = LatestpriceSmallToLarge(
      currentCoinList1.value,
      tradeStore.allCoinPriceInfo,
      'close'
    )
    currentCoinList2.value = LatestpriceSmallToLarge(
      currentCoinList2.value,
      tradeStore.allCoinPriceInfo,
      'close'
    )
  } else if (arrowList.value.secondIcon == 2) {
    arrowList.value.secondIcon = 0
    currentCoinList0.value = tradeStore.secondContractCoinList.filter((it, inx) => {
      return it.coinType == 2
    })
    currentCoinList1.value = tradeStore.secondContractCoinList.filter((it, inx) => {
      return it.coinType == 1
    })
    currentCoinList2.value = tradeStore.secondContractCoinList.filter((it, inx) => {
      return it.coinType == 3
    })
  }
}
// 切换涨跌
const toRafSort = () => {
  arrowList.value.firstIcon = 0
  arrowList.value.secondIcon = 0
  if (arrowList.value.thirdIcon === 0) {
    arrowList.value.thirdIcon = 1
    currentCoinList0.value = LatestpriceLargeToSmall(
      currentCoinList0.value,
      tradeStore.allCoinPriceInfo,
      'change',
      1
    )
    currentCoinList1.value = LatestpriceLargeToSmall(
      currentCoinList1.value,
      tradeStore.allCoinPriceInfo,
      'change',
      1
    )
    currentCoinList2.value = LatestpriceLargeToSmall(
      currentCoinList2.value,
      tradeStore.allCoinPriceInfo,
      'change',
      1
    )
  } else if (arrowList.value.thirdIcon === 1) {
    arrowList.value.thirdIcon = 2
    currentCoinList0.value = LatestpriceSmallToLarge(
      currentCoinList0.value,
      tradeStore.allCoinPriceInfo,
      'change',
      1
    )
    currentCoinList1.value = LatestpriceSmallToLarge(
      currentCoinList1.value,
      tradeStore.allCoinPriceInfo,
      'change',
      1
    )
    currentCoinList2.value = LatestpriceSmallToLarge(
      currentCoinList2.value,
      tradeStore.allCoinPriceInfo,
      'change',
      1
    )
  } else if (arrowList.value.thirdIcon === 2) {
    arrowList.value.thirdIcon = 0
    currentCoinList0.value = tradeStore.secondContractCoinList.filter((it, inx) => {
      return it.coinType == 2//crypto
    })
    currentCoinList1.value = tradeStore.secondContractCoinList.filter((it, inx) => {
      return it.coinType == 1;//MT5
    })
    currentCoinList2.value = tradeStore.secondContractCoinList.filter((it, inx) => {
      return it.coinType == 3
    })
  }
}

const showTab = ref(['ebc'].includes(__config._APP_ENV) ? 1 : 0)
const handelShowTab = (item) => {
  showTab.value = item
}
</script>
<style lang="scss" scoped>
.footer {
  padding-bottom: 120px;
  // .tab_title {
  //   display: flex;
  //   background-color: #fbfbfb;
  // }
  // .title {
  //   padding: 20px 15px 20px;
  //   font-size: 16px;
  //   color: #838b9c;

  //   font-weight: bold;
  // }
  h1.active {
    color: var(--ex-default-font-color);
    position: relative;

    i {
      background-color: var(--ex-active-font-color);
      position: absolute;
      width: 20px;
      height: 2px;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      transition: all 0.2s;
    }

    // font-size: 18px;
  }

  .new-header {
    display: flex;
    align-items: center;
    // min-height: 44px;
    padding: 10px 16px;
    margin: 0 15px 0px;
    background-color: #f6f7fb;
    border-radius: 11px;
    font-size: 13px;
    font-weight: 400;
    color: #8e8e8e;
    line-height: 1.4;
    box-sizing: border-box;
  }

  .main {
    background-color: var(--ex-default-background-color);
    // padding-top: 10px;
    .coin-list {
      background-color: #f6f7fb;
      border-radius: 11px;
      margin:8px 15px;
    }
  }

  .header-list {
    padding: 15px 18px 5px;
    font-size: 12px;
    color: var(--ex-home-list-ftcolor2);
    display: flex;
    justify-content: space-between;

    .item {
      display: flex;
      align-items: center;
      .arrows {
        display: flex;
        flex-direction: column;
        margin-left: 5px;
        .itemImg {
          width: 6px;
          height: 8px;
        }
      }
    }
    .item:nth-child(2) {
      flex: 1;
      text-align: right;
      justify-content: right;
    }

    .item:nth-child(3) {
      margin-left: 20px;
      max-width: 80px;
      min-width: 80px;
      text-align: right;
      justify-content: flex-end;
    }
  }
}

.headerChoose {
  display: flex;
  padding: 5px 10px;
  background: var(--ex-home-list-bgcolor);

  :deep(.van-tab) {
    flex: none;
    font-size: 16px;
    margin-right: 20px;
    padding: 0;
    color: var(--ex-home-list-ftcolor) !important;
  }
  :deep(.van-tabs__nav) {
    background: var(--ex-home-list-bgcolor) !important ;
  }

  // :deep(.van-tab__text) {
  //   font-size: 16px;
  //   color: var(--ex-home-list-ftcolor);
  //   // color: var(--ex-home-list-ftcolor);
  // }

  :deep(.van-tab--active) {
    font-weight: normal;
    color: var(--ex-home-list-ftcolor3) !important;
  }
}

/* 市场列表 - Figma 暗紫卡片 */
.market-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 22px 14px;

  &__name,
  &__price {
    font-family: 'PingFang SC', -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1;
  }
}

.footer .main {
  background: transparent;
  padding: 0 12px;

  .coin-list {
    background: transparent;
    border-radius: 0;
    border: 0;
    margin: 0;
    overflow: visible;
  }
}

/* 每一行卡片 (覆盖 CurrencyItem) */
:deep(.currencyItem) {
  margin-bottom: 12px;
  padding: 14px 16px;
  background: #221c31;
  border-radius: 12px;
  border-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .left {
    display: flex;
    align-items: center;
    gap: 12px;
    .leftImg {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: contain;
      background: rgba(255,255,255,0.08);
    }
    .topText .textTop {
      color: #fff;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.1;
    }
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    .rightLeft {
      color: #fff;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: 500;
      min-width: 0;
      text-align: right;
      .fw-num { display: inline-block; }
    }
    .rightBox {
      height: auto;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .rightRight {
        background: transparent !important;
        min-width: 0;
        max-width: 90px;
        margin-left: 0;
        padding: 3px 8px;
        border-radius: 6px;
        font-family: 'PingFang SC', -apple-system, sans-serif;
        font-size: 12px;
        font-weight: 400;
        height: auto;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        line-height: 1;

        &::before {
          content: '';
          width: 8px;
          height: 10px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          display: inline-block;
        }
        &.rise {
          background: rgba(46, 189, 133, 0.15) !important;
          color: #2ebd85 !important;
          &::before { background-image: url('@/assets/images/gxpex/home/arrow-up.png'); }
        }
        &.fall {
          background: rgba(246, 70, 93, 0.15) !important;
          color: #f6465d !important;
          &::before { background-image: url('@/assets/images/gxpex/home/arrow-down.png'); }
        }
        &.draw {
          background: rgba(125, 145, 157, 0.15) !important;
          color: #7d919d !important;
          &::before { display: none; }
        }
      }
    }
  }
}

/* Deposit & Earn 活动卡 */
.promo {
  position: relative;
  margin: 0 12px 16px;
  height: 78px;
  border-radius: 40px;
  overflow: hidden;
  cursor: pointer;
  background: #1a1530;

  /* 渐变紫描边 (Figma: linear 左→右 #ae4eb4 → #6431df, 1px inside) */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(90deg, #ae4eb4 0%, #6431df 100%);
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask-composite: exclude;
    pointer-events: none;
    z-index: 2;
  }

  &__bg {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translate(0, -50%);
    width: 105%;
    height: auto;
    object-fit: cover;
    object-position: right center;
    pointer-events: none;
  }

  &__content {
    position: relative;
    z-index: 1;
    height: 100%;
    padding: 0 22px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 8px;
    pointer-events: none;
  }

  &__title {
    height: 24px;
    width: auto;
    flex-shrink: 0;
    display: block;
    object-fit: contain;
    pointer-events: auto;
  }

  &__btn {
    align-self: flex-start;
    pointer-events: auto;
    padding: 5px 14px;
    border-radius: 999px;
    border: 1px solid #9f40ec;
    background: transparent;
    color: #9e40eb;
    font-family: 'Roboto', sans-serif;
    font-size: 11px;
    font-weight: 400;
    line-height: 1;
  }
}
</style>
