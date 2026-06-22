<!-- 质押挖矿 -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { _t18 } from '@/utils/public'
import { getPledgeProductList, getPledgeShowInfo } from '@/api/pledge/index'
import { priceFormat } from '@/utils/decimal.js'
import Popup from '@/components/Popup/index.vue'
import Card from './components/card.vue'
import { rulesList } from '@/api/common/index'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'
import iconHistory from '@/assets/images/gxpex/loan/icon-history.svg'
import iconUsdt from '@/assets/images/gxpex/staking/icon-usdt.svg'
import pageBg from '@/assets/images/gxpex/staking/page-bg.png'
import heroBg from '@/assets/images/gxpex/staking/hero-bg.png'

const router = useRouter()

const showRule = ref(false)
const txt = _t18('defi_speak')
const popupContent = ref({})
const direction = ref('bottom')
const showInfo = ref({})
const projectList = ref([])

const showPopup = () => {
  showRule.value = true
}

const closePopup = () => {
  showRule.value = false
}

const toView = (data) => {
  router.push({
    path: '/pledge/pledgeDetail',
    query: { data: encodeURI(JSON.stringify(data)) }
  })
}

const getProjectList = async () => {
  const res = await getPledgeProductList()
  if (res.code == '200') {
    projectList.value = res.rows
  }
}

const getShowInfo = async () => {
  const res = await getPledgeShowInfo()
  if (res.code == '200') {
    showInfo.value = res.data
  }
}

const getPopupContent = async () => {
  const res = await rulesList('PLEDGE_EXPLAIN')
  if (res.code == '200') {
    popupContent.value = res.data
  }
}

onMounted(() => {
  getProjectList()
  getShowInfo()
  getPopupContent()
})
</script>

<template>
  <Popup
    :show="showRule"
    :direction="direction"
    @handelClose="closePopup"
    :title="txt"
    :content="popupContent"
  />

  <div class="page page--staking">
    <div class="staking-page__bg-wrap" aria-hidden="true">
      <img class="staking-page__bg" :src="pageBg" alt="" />
    </div>

    <section class="staking-hero">
      <div class="staking-hero__bg-wrap" aria-hidden="true">
        <img class="staking-hero__bg" :src="heroBg" alt="" />
      </div>

      <header class="staking-header">
        <button type="button" class="staking-header__back" aria-label="back" @click="router.back()">
          <img :src="iconBack" alt="" class="staking-header__back-icon" />
        </button>
        <h1 class="staking-header__title">{{ _t18('defi_host_lockup') }}</h1>
      </header>

      <div class="staking-summary">
        <div class="staking-summary__inner">
          <div class="staking-summary__coin">
            <img :src="iconUsdt" alt="" class="staking-summary__coin-icon" />
            <span class="staking-summary__symbol">USDT</span>
          </div>
          <div class="staking-summary__grid">
            <div class="staking-summary__stat">
              <span class="staking-summary__value">{{ priceFormat(showInfo.amount) || '0.00' }}</span>
              <span class="staking-summary__label">{{ _t18('pledge_hosting') }}</span>
            </div>
            <div class="staking-summary__stat">
              <span class="staking-summary__value">{{ showInfo.orderNum || 0 }}</span>
              <span class="staking-summary__label">{{ _t18('pledge_commissioned_order') }}</span>
            </div>
            <div class="staking-summary__stat">
              <span class="staking-summary__value staking-summary__value--accent">
                {{ priceFormat(showInfo.todayProfit) || '0.00' }}
              </span>
              <span class="staking-summary__label">{{ _t18('pledge_Today_Earnings') }}</span>
            </div>
            <div class="staking-summary__stat">
              <span class="staking-summary__value staking-summary__value--accent">
                {{ priceFormat(showInfo.profitMoney) || '0.00' }}
              </span>
              <span class="staking-summary__label">{{ _t18('Cumulative_income') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <main class="staking-main">
      <Card
        v-for="(item, index) in projectList"
        :key="item.id ?? index"
        :card-data="item"
        @buy="toView(item)"
      />
      <Nodata v-if="!projectList?.length" />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.page--staking {
  position: relative;
  min-height: 100vh;
  background: #111111;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.page--staking > .staking-page__bg-wrap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 211px;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.staking-page__bg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.staking-hero {
  position: relative;
  z-index: 2;
  padding-bottom: 0;
}

.staking-hero__bg-wrap {
  position: absolute;
  top: -140px;
  left: 0;
  width: 100%;
  height: 469px;
  z-index: 0;
  pointer-events: none;
}

.staking-hero__bg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.staking-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.staking-header__back {
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

.staking-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.staking-header__title {
  margin: 0;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.staking-header__actions {
  position: absolute;
  right: 8px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  gap: 2px;
}

.staking-header__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    display: block;
    width: 22px;
    height: 22px;
    object-fit: contain;
    opacity: 0.9;
  }
}

.staking-header__action--history img {
  width: 20px;
  height: 20px;
}

.staking-summary {
  position: relative;
  z-index: 3;
  margin: 110px 0 0;
  padding: 15px 16px 16px;
  border-radius: 25px 25px 0 0;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 67%, rgba(0, 0, 0, 0.2) 100%);
}

.staking-summary__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.staking-summary__coin {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
}

.staking-summary__coin-icon {
  width: 32px;
  height: 32px;
  display: block;
  flex-shrink: 0;
  object-fit: contain;
}

.staking-summary__symbol {
  font-family: 'Roboto', sans-serif;
  font-size: 25px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
}

.staking-summary__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.staking-summary__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  box-sizing: border-box;
  min-height: 74px;
  padding: 12px 4px;
  border-radius: 12px;
  border: 1px solid rgb(160, 65, 237);
  background: rgba(34, 28, 49, 0.5);
  text-align: center;
}

.staking-summary__value {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
}

.staking-summary__value--accent {
  color: rgb(160, 65, 237);
}

.staking-summary__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.85);
}

.staking-main {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: -4px;
  padding: 0 12px 16px;
  background: #111111;
}
</style>
