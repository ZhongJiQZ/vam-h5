<!-- 首页 -->
<template>
  <div>
    <van-popup v-model:show="show" position="left" class="sidebar" @close="closeSideBar">
      <SideBar @closeSideBar="closeSideBar"></SideBar>
    </van-popup>
    <div class="carousel">
      <van-swipe :autoplay="3000" lazy-render :loop="true" :show-indicators="false">
        <van-swipe-item v-for="(item, index) in carouselList.slice(0,1)" :key="index">
          <image-load :filePath="item.imgUrl" alt="" class="carouselItem" @click="linkto(item)" />
        </van-swipe-item>
      </van-swipe>
      <div class="top">
        <div>
          <!-- <Logo @click="refreshPage"></Logo> -->
           <img src="@/assets/images/logo-white.png" class="logo" @click="refreshPage"/>
        </div>
        <div>
          <!-- <svg-load name="user" class="rightImg" @click="openSideBar"></svg-load> -->
           <img src="@/assets/images/user.png" class="rightImg" @click="openSideBar"/>
        </div>
      </div>
      <div class="currentList">
        <div
          v-for="(item, index) in dataList.filter((it, idx) => idx < 4)"
          :key="index"
          class="currentList-card"
          :class="`currentList-card--${_isRFD(
            tradeStore.allCoinPriceInfo[item.coin]?.open,
            tradeStore.allCoinPriceInfo[item.coin]?.close
          )}`"
          @click="linkTo(item)"
        >
          <div class="currentList-pair fw-num">{{ item.showSymbol }}</div>
          <div
            :class="[
              _isRFD(
                tradeStore.allCoinPriceInfo[item.coin]?.open,
                tradeStore.allCoinPriceInfo[item.coin]?.close
              ),
              'rfd-sign currentList-change fw-num'
            ]"
          >
            {{ tradeStore.allCoinPriceInfo[item.coin]?.priceChangePercent }}%
          </div>
          <div
            :class="[
              _isRFD(
                tradeStore.allCoinPriceInfo[item.coin]?.open,
                tradeStore.allCoinPriceInfo[item.coin]?.close
              ),
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
import { onMounted } from 'vue'
import { publiceNotice } from '@/api/common/index'
import { computed } from 'vue'
import SideBar from '@/views/home/sidebar/index.vue'
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

.carousel {
  position: relative;
  height: 250px;

  .carouselItem {
    height: 250px;
    width: 100%;
    object-fit: cover;
  }

  .top {
    height: 52px;
    // background: var(--ex-home-box-background-color3);
    background: rgba(255, 255, 255, 0);
    border-radius: 5px;
    padding: 15px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 30px);
    .logo{
      height:32px;
    }

    /* 减去两侧的间距 */
    .leftImg {
      width: 25px;
      height: 25px;
      border-radius: 15px;
    }

    .centerImg {
      width: 56px;
      height: 14px;
      margin-left: 5px;
    }

    .rightImg {
      width: 32px;
      height: 32px;
    }
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
