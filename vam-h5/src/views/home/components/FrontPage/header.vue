<!-- 首页 -->
<template>
  <div class="header-container">
    <van-popup v-model:show="show" position="left" class="sidebar" @close="closeSideBar">
      <SideBar @closeSideBar="closeSideBar"></SideBar>
    </van-popup>
    <div class="home-top-bar">
      <div class="home-top-bar__brand" @click="refreshPage">
        <img :src="logoG" class="home-top-bar__logo" alt="GXPEX" />
        <img :src="brandText" class="home-top-bar__brand-text" alt="GXPEX" />
      </div>
      <div class="home-top-bar__actions">
        <span
          class="home-top-bar__icon-btn"
          role="button"
          aria-label="service"
          @click="goService"
        >
          <img :src="iconService" alt="" />
        </span>
        <span
          class="home-top-bar__icon-btn"
          role="button"
          aria-label="notification"
          @click="goNotice"
        >
          <img :src="iconBell" alt="" />
        </span>
        <span
          class="home-top-bar__icon-btn"
          role="button"
          aria-label="menu"
          @click="openSideBar"
        >
          <img :src="iconMenu" alt="" />
        </span>
      </div>
    </div>
    <!-- Hero 山图区（单图 + 代码写文字 + 紫渐变按钮） -->
    <div class="hero">
      <div v-if="primaryBanner?.imgUrl && !bannerImageReady" class="hero__skeleton" aria-hidden="true" />
      <image-load
        v-if="primaryBanner?.imgUrl"
        :filePath="primaryBanner.imgUrl"
        alt=""
        class="hero__bg"
        :class="{ 'hero__bg--ready': bannerImageReady }"
        loading="eager"
        fetchpriority="high"
        @load="onBannerImageReady"
        @error="onBannerImageReady"
      />
      <div class="hero__overlay">
        <h1 class="hero__title">How Colombia will move<br />towards an open data ecosystem</h1>
        <button class="hero__cta" @click="onHeroCta">
          <span>View Now</span>
        </button>
      </div>
      <!-- 3 行情卡（叠在 hero 底部） -->
      <div class="quote-row">
        <div
          v-for="item in dataList.slice(0, 3)"
          :key="item.coin"
          class="quote-card"
          :class="`quote-card--${rfdFromChangePercent(item.coin)}`"
          @click="linkTo(item)"
        >
          <div class="quote-card__head">
            <img :src="item.logo" class="quote-card__coin" alt="" />
            <div class="quote-card__pair">{{ item.showSymbol }}</div>
          </div>
          <div class="quote-card__price">
            {{ tradeStore.allCoinPriceInfo[item.coin]?.close ?? '--' }}
          </div>
          <svg class="quote-card__spark" viewBox="0 0 100 24" preserveAspectRatio="none">
            <defs>
              <linearGradient :id="`g-${item.coin}`" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" :stop-color="rfdFromChangePercent(item.coin) === 'fall' ? '#f6465d' : '#2ebd85'" stop-opacity="0.5" />
                <stop offset="1" :stop-color="rfdFromChangePercent(item.coin) === 'fall' ? '#f6465d' : '#2ebd85'" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path
              :d="sparkArea(item.coin)"
              :fill="`url(#g-${item.coin})`"
            />
            <polyline
              :points="sparkPoints(item.coin)"
              :stroke="rfdFromChangePercent(item.coin) === 'fall' ? '#f6465d' : '#2ebd85'"
              stroke-width="1.4"
              fill="none"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
          </svg>
          <div class="quote-card__pct">
            <img
              :src="rfdFromChangePercent(item.coin) === 'fall' ? arrowDown : arrowUp"
              class="quote-card__arrow"
              alt=""
            />
            <span>
              {{ _absChangePercentStr(tradeStore.allCoinPriceInfo[item.coin]?.priceChangePercent) }}%
            </span>
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
import { onMounted, computed, ref, watch } from 'vue'
import { _isRFDByChangePercent, _absChangePercentStr } from '@/utils/public'
import { getKlineHistory } from '@/api/common/kline.js'
import {
  collectHomeBannerImageUrls,
  preloadImages,
  resolveImageLoadUrl
} from '@/utils/imagePreload'
import SideBar from '@/views/home/sidebar/index.vue'
import logoFallback from '@/assets/images/logo-black.png'
import logoG from '@/assets/images/gxpex/home/logo-g.png'
import brandText from '@/assets/images/gxpex/home/brand-text.png'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'
import iconBell from '@/assets/images/gxpex/home/icon-bell.svg'
import iconMenu from '@/assets/images/gxpex/home/icon-menu.svg'
import arrowUp from '@/assets/images/gxpex/home/arrow-up.png'
import arrowDown from '@/assets/images/gxpex/home/arrow-down.png'
import { dispatchCustomEvent } from '@/utils'
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

const goService = () => dispatchCustomEvent('event_serviceChange')
const goNotice = () => $router.push('/broadcast')

const rfdFromChangePercent = (coin) => {
  const info = tradeStore.allCoinPriceInfo[coin]
  return _isRFDByChangePercent(info?.priceChangePercent)
}

// === Sparkline: 真实 K 线数据 ===
const klineCache = ref({})  // { coin: [close1, close2, ...] }

const fetchSpark = async (item) => {
  if (!item?.coin || !item?.coinUpperCase) return
  if (klineCache.value[item.coin]?.length) return
  try {
    const { data } = await getKlineHistory({
      symbol: item.coinUpperCase,
      interval: 'ONE_HOUR',
      market: item.market,
      limit: 24
    })
    const bars = data?.historyKline || []
    if (bars.length) {
      const sorted = [...bars].sort((a, b) => a.T - b.T)
      klineCache.value = {
        ...klineCache.value,
        [item.coin]: sorted.map((b) => parseFloat(b.c))
      }
    }
  } catch (e) {
    // ignore
  }
}

const sparkPoints = (coin) => {
  const prices = klineCache.value[coin]
  if (!prices || prices.length < 2) return ''
  let min = prices[0], max = prices[0]
  for (const p of prices) {
    if (p < min) min = p
    if (p > max) max = p
  }
  const range = max - min || 1
  const N = prices.length
  const W = 100
  const top = 2, bot = 22
  return prices
    .map((p, i) => {
      const x = (i / (N - 1)) * (W - 2) + 1
      const y = bot - ((p - min) / range) * (bot - top)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}
const sparkArea = (coin) => {
  const pts = sparkPoints(coin).split(' ').filter(Boolean)
  if (!pts.length) return ''
  const first = pts[0].split(',')[0]
  const last = pts[pts.length - 1].split(',')[0]
  return `M${first},24 L${pts.join(' L')} L${last},24 Z`
}

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

// 数据列表变化时拉前 3 个币的 K 线（用于 sparkline）
watch(
  () => dataList.value.slice(0, 3),
  (list) => list.forEach(fetchSpark),
  { immediate: true, deep: true }
)

const refreshPage = ()=>{
    window.location.reload();
}
const linkTo = (item) => {
  mainStroe.setTradeStatus(Number(0))
  $router.push(`/trade?symbol=${item.coin}`)
}
const bannerImageReady = ref(false)

const carouselList = computed(() => mainStroe.homeBannerList || [])

const primaryBanner = computed(() => carouselList.value[0] || null)

const onBannerImageReady = () => {
  bannerImageReady.value = true
}

watch(
  () => primaryBanner.value?.imgUrl,
  (imgUrl) => {
    bannerImageReady.value = false
    if (!imgUrl) return
    const url = resolveImageLoadUrl(imgUrl)
    if (!url) return
    const img = new Image()
    img.onload = onBannerImageReady
    img.onerror = onBannerImageReady
    if (img.complete) {
      onBannerImageReady()
    } else {
      img.src = url
    }
  },
  { immediate: true }
)

watch(
  carouselList,
  (list) => {
    preloadImages(collectHomeBannerImageUrls(list), { linkPreloadCount: 2 })
  },
  { immediate: true, deep: true }
)

// 轮播图跳转
const linkto = (detail) => {
  if (detail.noticeContent && detail.noticeContent !== '<p><br></p>') {
    $router.push(`/broadcastDetails?id=${detail.noticeId}`)
  } else {
    $router.push(`${detail.detailUrl}`)
  }
}

// Hero View Now 按钮：跳后端首条 banner 的目标，没有就跳行情
const onHeroCta = () => {
  const first = primaryBanner.value
  if (first) linkto(first)
  else $router.push('/quote')
}

onMounted(() => {
  if (!carouselList.value.length) {
    mainStroe.fetchHomeBanner()
  }
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

.header-container{
  padding-top: 0;
}

.home-top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--ex-max-width);
  margin: 0 auto;
  box-sizing: border-box;
  padding: 12px 15px;
  background: transparent;
}

.home-top-bar__brand {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.home-top-bar__logo {
  width: 28px;
  height: 28px;
  display: block;
  object-fit: contain;
}
.home-top-bar__brand-text {
  height: 22px;
  width: auto;
  display: block;
  object-fit: contain;
}

.home-top-bar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-top-bar__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 24px;
  height: 24px;
  img {
    width: 22px;
    height: 22px;
    display: block;
    object-fit: contain;
  }
}

/* Hero 山图区 */
.hero {
  position: relative;
  height: 270px;
  background: #111111;
  overflow: visible;

  &__skeleton {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: #111111;
  }

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.3s ease-out;
    &--ready { opacity: 1; }
  }

  &__overlay {
    position: absolute;
    z-index: 2;
    left: 0;
    right: 0;
    top: 100px;
    padding: 0 24px;
    pointer-events: none;
    & > * { pointer-events: auto; }
  }

  &__title {
    margin: 0 0 14px;
    font-family: 'Roboto', -apple-system, sans-serif;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: 0.1px;
    color: #ffffff;
    max-width: 66%;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
  }

  &__cta {
    border: 0;
    background: linear-gradient(180deg, #a343ee 0%, #7f2bda 100%);
    color: #fff;
    font-family: 'Roboto', -apple-system, sans-serif;
    font-size: 12px;
    font-weight: 400;
    padding: 7px 22px;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(160, 65, 237, 0.55);
    transition: transform 0.15s ease;
    &:active { transform: scale(0.96); }
  }

  /* 3 行情卡：叠在 hero 底部，Figma 4 列内容（币 logo+名 / 大价格 / sparkline / 箭头+%） */
  .quote-row {
    position: absolute;
    z-index: 3;
    left: 10px;
    right: 10px;
    bottom: -80px;
    display: flex;
    gap: 8px;
  }

  .quote-card {
    flex: 1;
    min-width: 0;
    border-radius: 12px;
    padding: 10px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;

    &__head {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    &__coin {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      flex-shrink: 0;
      object-fit: contain;
      background: #2a2540;
    }
    &__pair {
      font-family: 'PingFang SC', -apple-system, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #ffffff;
      line-height: 1;
    }
    &__price {
      font-family: 'PingFang SC', -apple-system, sans-serif;
      font-size: 17px;
      font-weight: 600;
      line-height: 1.1;
      margin-top: 3px;
      letter-spacing: -0.01em;
      text-align: center;
    }
    &__spark {
      width: 100%;
      height: 22px;
      display: block;
      margin: 1px 0;
    }
    &__pct {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 3px;
      font-family: 'PingFang SC', -apple-system, sans-serif;
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
      margin-top: 1px;
    }
    &__arrow {
      width: 10px;
      height: 12px;
      object-fit: contain;
    }

    /* 颜色按涨跌 */
    &--rise {
      .quote-card__price,
      .quote-card__pct { color: #2ebd85; }
    }
    &--fall {
      .quote-card__price,
      .quote-card__pct { color: #f6465d; }
    }
    &--draw {
      .quote-card__price,
      .quote-card__pct { color: #7d919d; }
    }
  }
}
</style>
