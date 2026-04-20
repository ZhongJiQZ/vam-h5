<!-- 首页 -->
<template>
  <div>
    <van-popup v-model:show="show" position="left" class="sidebar" @close="closeSideBar">
      <SideBar @closeSideBar="closeSideBar"></SideBar>
    </van-popup>
    <div class="home-top-bar">
      <img :src="logoSrc" class="home-top-bar__logo" alt="" @click="refreshPage" />
      <div class="home-top-bar__actions">
        <!-- <img
          src="@/assets/images/black/user.png"
          alt=""
          class="home-top-bar__icon"
          @click="goMyAssets"
        /> -->
        <span class="home-top-bar__menu-btn" role="button" aria-label="菜单" @click="openSideBar">
          <svg-load name="cebian" />
        </span>
      </div>
    </div>
    <div class="carousel">
      <van-swipe :autoplay="3000" lazy-render :loop="true" :show-indicators="false">
        <van-swipe-item v-for="(item, index) in carouselList.slice(0,1)" :key="index">
          <image-load :filePath="item.imgUrl" alt="" class="carouselItem" @click="linkto(item)" />
        </van-swipe-item>
      </van-swipe>
      <div class="currentList">
        <div
          v-for="(item, index) in dataList.filter((it, idx) => idx < 4)"
          :key="index"
          class="currentList-card"
          :class="`currentList-card--${rfdFromLastTick(item.coin)}`"
          @click="linkTo(item)"
        >
          <div class="currentList-pair fw-num">{{ item.showSymbol }}</div>
          <div
            :class="[
              rfdFromLastTick(item.coin),
              'rfd-sign currentList-change fw-num'
            ]"
          >
            {{ tradeStore.allCoinPriceInfo[item.coin]?.priceChangePercent }}%
          </div>
          <div
            :class="[
              rfdFromLastTick(item.coin),
              'currentList-price fw-num'
            ]"
          >
            {{ tradeStore.allCoinPriceInfo[item.coin]?.close }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useTradeStore } from '@/store/trade/index'
import { useMainStore } from '@/store/index.js'
import { useRouter } from 'vue-router'
import { onMounted, computed, watch } from 'vue'
import { publiceNotice } from '@/api/common/index'
import { _isRFD } from '@/utils/public'
import SideBar from '@/views/home/sidebar/index.vue'
import logoFallback from '@/assets/images/logo-black.png'
const show = ref(false)
const openSideBar = () => {
  show.value = true
}
const closeSideBar = () => {
  show.value = false
}
const tradeStore = useTradeStore()
const mainStroe = useMainStore()
const $router = useRouter()

const logoSrc = computed(() => {
  return mainStroe.getLogoList?.logo || mainStroe.getLogoList?.logoD || logoFallback
})

const goMyAssets = () => {
  $router.push('/myassets')
}

/** 非响应式：记录各币种上一笔 close，避免 ref 更新触发二次渲染把涨跌误判为平 */
const prevCloseByCoin = {}

const rfdFromLastTick = (coin) => {
  const info = tradeStore.allCoinPriceInfo[coin]
  if (!info) return 'draw'
  const close = Number(info.close)
  if (isNaN(close)) return 'draw'
  const prev = prevCloseByCoin[coin]
  if (prev === undefined) {
    return _isRFD(info.open, close)
  }
  if (prev === close) {
    return _isRFD(info.open, close)
  }
  return _isRFD(prev, close)
}

watch(
  () => tradeStore.allCoinPriceInfo,
  () => {
    const info = tradeStore.allCoinPriceInfo
    if (!info) return
    for (const key of Object.keys(info)) {
      const c = Number(info[key]?.close)
      if (!isNaN(c)) {
        prevCloseByCoin[key] = c
      }
    }
  },
  { deep: true, flush: 'post' }
)

const dataList = computed(() => {
  // let tempFilterKey = Object.keys(tradeStore.allCoinPriceInfo)
  //   .filter((key) => tradeStore.allCoinPriceInfo[key]?.priceChangePercent > 0)
  //   .slice(0, 3)
  let tempData = []
  let tempFilterKey = mainStroe.getHomeCoinList.map((item) => {
    if (item.isOpen == 'true') {
      return item.coin
    }
  })
  // let tempData = tradeStore.secondContractCoinList.filter((elem) =>
  //   tempFilterKey.includes(elem.coin)
  // )
  tempFilterKey.forEach((elem) => {
    tradeStore.secondContractCoinList.forEach((elem2) => {
      if (elem2.coin == elem) {
        tempData.push(elem2)
      }
    })
  })
  return tempData
})
const refreshPage = ()=>{
    window.location.reload();
}
const linkTo = (item) => {
  mainStroe.setTradeStatus(Number(0))
  $router.push(`/trade?symbol=${item.coin}`)
}
const carouselList = ref([])
// 轮播图跳转
const linkto = (detail) => {
  if (detail.noticeContent && detail.noticeContent !== '<p><br></p>') {
    $router.push(`/broadcastDetails?id=${detail.noticeId}`)
  } else {
    $router.push(`${detail.detailUrl}`)
  }
}

onMounted(async () => {
  try {
    const res = await publiceNotice('ACTIVITY_NOTICE', 'HOME_ACTIVITY ')
    if (res.code === 200) {
      carouselList.value = res.data.filter((item) => {
        return item.status != '1'
      })
    }
  } catch (error) {}
})
</script>
<style lang="scss" scoped>
:deep(.sidebar) {
  margin-top: -1px;
  max-width: var(--ex-max-width);
  width: 100%;
  left: auto;
  height: 100%;
}

.home-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--ex-max-width);
  margin: 0 auto;
  box-sizing: border-box;
  padding: 10px 15px;
  background: #ffffff;
}

.home-top-bar__logo {
  height: 32px;
  display: block;
  object-fit: contain;
  cursor: pointer;
}

.home-top-bar__actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.home-top-bar__icon {
  width: 24px;
  height: 24px;
  display: block;
  object-fit: contain;
  cursor: pointer;
}

.home-top-bar__menu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  line-height: 0;
}

.carousel {
  position: relative;
  height: 250px;

  .carouselItem {
    height: 250px;
    width: 100%;
    object-fit: cover;
  }

  .currentList {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 30px);
    box-sizing: border-box;
    top: 112px;
    display: flex;
    gap: 8px;
    padding: 0;
    background: transparent;
    box-shadow: none;

    .currentList-card {
      flex: 1;
      min-width: 0;
      min-height: 96px;
      border-radius: 14px;
      padding: 20px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

      &--rise {
        background: linear-gradient(
          180deg,
          #dff5eb 0%,
          #ffffff 40%,
          #ffffff 60%,
          #dff5eb 100%
        );
      }

      &--fall {
        background: linear-gradient(
          180deg,
          #fce8ed 0%,
          #ffffff 40%,
          #ffffff 60%,
          #fce8ed 100%
        );
      }

      &--draw {
        background: linear-gradient(
          180deg,
          #ebecef 0%,
          #ffffff 40%,
          #ffffff 60%,
          #ebecef 100%
        );
      }
    }

    .currentList-pair {
      font-size: 13px;
      font-weight: 700;
      color: #111827;
      line-height: 1.2;
    }

    .currentList-change {
      font-size: 20px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }

    .currentList-price {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.2;
    }
  }
}
</style>
