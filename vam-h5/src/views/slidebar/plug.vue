<!-- 推广中心 -->
<template>
  <div v-if="NO_SHOW_MEMBER.includes(_getConfig('_APP_ENV'))">
    <div class="content">
      <image-load filePath="plugbg.png" class="img-bg"></image-load>
      <div class="toBack" @click="$router.push('/')">
        <svg-load name="back" class="back"></svg-load>
        <div class="code_box">
          <p class="code1 fw-bold">{{ _t18('plug_invite') }}</p>
          <p class="code2">{{ _t18('plug_toInvite') }}</p>
          <div class="erweima">
            <QRCode :address="sharkCode"></QRCode>
          </div>
          <div class="sharkCode">
            <Copy :data="sharkCode">
              <template #copyMsg>
                <p class="ff-num">{{ _t18('plug_shareCode') }}：{{ sharkCode }}</p>
              </template>
            </Copy>
          </div>
          <div class="shareLink">
            <p class="ff-num">{{ _t18('plug_shareLink') }}：</p>
            <Copy :data="`${shareLink}${sharkCode}`">
              <template #copyMsg>
                <p class="ff-num link">{{ shareLink }}{{ sharkCode }}</p>
              </template>
            </Copy>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="page page--referrals">
    <section class="referrals-hero">
      <img class="referrals-hero__art" :src="heroArt" alt="" aria-hidden="true" />
      <header class="referrals-header">
        <button type="button" class="referrals-header__back" aria-label="back" @click="router.back()">
          <img :src="iconBack" alt="" class="referrals-header__back-icon" />
        </button>
        <h1 class="referrals-header__title">{{ _t18('plug') }}</h1>
        <button type="button" class="referrals-header__action" aria-label="rules" @click="showPopup">
          <img :src="iconService" alt="" class="referrals-header__action-icon" />
        </button>
      </header>
      <div class="referrals-hero__content">
        <h2 class="referrals-hero__title">
          <span class="referrals-hero__title-line">{{ _t18('plug_invite', ['aams']) }}</span>
        </h2>
        <p class="referrals-hero__subtitle">{{ _t18('plug_toInvite') }}</p>
      </div>
    </section>

    <main class="referrals-main">
      <section class="referrals-card referrals-card--stats">
        <div class="referrals-invite">
          <div class="referrals-invite__row">
            <span class="referrals-invite__label">{{ _t18('plug_shareCode') }}：</span>
            <div class="referrals-invite__value-wrap">
              <span class="referrals-invite__value">{{ sharkCode }}</span>
              <button type="button" class="referrals-copy" aria-label="copy" @click="copyText(sharkCode)">
                <img :src="iconCopy" alt="" class="referrals-copy__icon" />
              </button>
            </div>
          </div>
          <div class="referrals-invite__row">
            <span class="referrals-invite__label">{{ _t18('plug_shareLink') }}:</span>
            <div class="referrals-invite__value-wrap">
              <span class="referrals-invite__value">{{ shareLink }}{{ sharkCode }}</span>
              <button
                type="button"
                class="referrals-copy"
                aria-label="copy"
                @click="copyText(`${shareLink}${sharkCode}`)"
              >
                <img :src="iconCopy" alt="" class="referrals-copy__icon" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="!['das'].includes(_getConfig('_APP_ENV'))" class="referrals-tier__grid">
          <div v-for="item in tierStats" :key="item.label" class="referrals-tier__cell">
            <span class="referrals-tier__value">{{ item.value }}</span>
            <span class="referrals-tier__label">{{ item.label }}</span>
          </div>
        </div>

        <div v-if="!['das'].includes(_getConfig('_APP_ENV'))" class="referrals-summary">
          <div v-for="item in summaryStats" :key="item.label" class="referrals-summary__row">
            <span class="referrals-summary__label">{{ item.label }}</span>
            <span class="referrals-summary__value">{{ item.value }}</span>
          </div>
        </div>
      </section>

      <section
        v-if="!['das'].includes(_getConfig('_APP_ENV')) && !['bitfly'].includes(_getConfig('_APP_ENV'))"
        class="referrals-team"
      >
        <h2 class="referrals-team__title">{{ _t18('plug_myShare', ['aams']) }}</h2>
        <div class="referrals-tabs" role="tablist">
          <button
            v-for="(tab, index) in tabList"
            :key="tab"
            type="button"
            class="referrals-tabs__item"
            :class="{ 'referrals-tabs__item--active': curIndex === index }"
            @click="changeIndex(index)"
          >
            {{ tab }}
          </button>
        </div>

        <div class="referrals-members">
          <van-loading v-if="showLoading" class="referrals-loading" />

          <template v-if="!showLoading && !showCommissionRecords">
            <article v-for="(item, index) in teamList" :key="index" class="referrals-member">
              <div class="referrals-member__id">
                <img class="referrals-member__avatar" :src="getAvatar(index)" alt="" aria-hidden="true" />
                <span class="referrals-member__uid">{{ maskUid(item.fromId) }}</span>
              </div>
              <div class="referrals-member__col">
                <span class="referrals-member__label">{{ _t18('plug_back') }}</span>
                <span class="referrals-member__value">{{ formatMoney(item.sumAmount) }} USDT</span>
              </div>
              <div class="referrals-member__col referrals-member__col--date">
                <span class="referrals-member__label">{{ _t18('plug_registerTime') }}</span>
                <span class="referrals-member__value">
                  {{
                    item.createTime
                      ? _timeFormat(item.params?.createTime, 'YY/MM/DD HH:mm', true)
                      : ''
                  }}
                </span>
              </div>
            </article>
            <div v-if="teamList.length <= 0" class="referrals-empty">
              <img :src="iconEmpty" alt="" class="referrals-empty__icon" />
              <p class="referrals-empty__text">{{ _t18('no_data') }}</p>
            </div>
          </template>

          <template v-if="!showLoading && showCommissionRecords">
            <article
              v-for="(item, index) in commissionRecordsList"
              :key="index"
              class="referrals-member referrals-member--record"
            >
              <div class="referrals-member__col referrals-member__col--record">
                <span class="referrals-member__label">{{ _t18('plug_fromId') }}</span>
                <span class="referrals-member__value">{{ item.fromId || '' }}</span>
              </div>
              <div class="referrals-member__col referrals-member__col--record">
                <span class="referrals-member__label">{{ _t18('plug_commissionType') }}</span>
                <span class="referrals-member__value">{{ getCommissionType(item.type) }}</span>
              </div>
              <div class="referrals-member__col referrals-member__col--record">
                <span class="referrals-member__label">{{ _t18('plug_back') }}</span>
                <span class="referrals-member__value">{{ item.sumAmount || 0 }} USDT</span>
              </div>
              <div class="referrals-member__col referrals-member__col--record">
                <span class="referrals-member__label">{{ _t18('plug_commissionTime') }}</span>
                <span class="referrals-member__value">
                  {{
                    item.createTime
                      ? _timeFormat(item.params?.createTime, 'YY/MM/DD HH:mm', true)
                      : ''
                  }}
                </span>
              </div>
            </article>
            <div v-if="commissionRecordsList.length <= 0" class="referrals-empty">
              <img :src="iconEmpty" alt="" class="referrals-empty__icon" />
              <p class="referrals-empty__text">{{ _t18('no_data') }}</p>
            </div>
          </template>
        </div>
      </section>
    </main>

    <Popup
      :show="showRule"
      @handelClose="closePopup"
      :title="txt"
      :content="popupContent"
      :direction="direction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NO_SHOW_MEMBER } from '@/config/index'
import { _t18, _timeFormat } from '@/utils/public'
import QRCode from '@/components/common/QRCode/index.vue'
import Copy from '@/components/common/Copy/index.vue'
import Popup from '@/components/Popup/index.vue'
import { useUserStore } from '@/store/user/index'
import { getAgentInfo, getAgentList, getCommissionRecords } from '@/api/plug.js'
import { rulesList } from '@/api/common/index'
import { useCopy } from '@/hook/useCopy'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'
import iconCopy from '@/assets/images/gxpex/referrals/icon-copy.svg'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'
import heroArt from '@/assets/images/gxpex/referrals/hero-art.png'
import avatar1 from '@/assets/images/gxpex/referrals/avatar-1.jpg'
import avatar2 from '@/assets/images/gxpex/referrals/avatar-2.jpg'
import avatar3 from '@/assets/images/gxpex/referrals/avatar-3.jpg'

const router = useRouter()
const { _copy } = useCopy()
const useStore = useUserStore()
const userInfo = useStore.userInfo
const sharkCode = userInfo?.user?.activeCode
const shareLink = `${location.origin}/#/i&`

const showLoading = ref(true)
const showCommissionRecords = ref(false)
const teamInfo = ref({})
const teamList = ref([])
const commissionRecordsList = ref([])
const popupContent = ref({})
const showRule = ref(false)
const txt = _t18('plug_rule')
const direction = ref('bottom')
const curIndex = ref(0)

const memberAvatars = [avatar1, avatar2, avatar3]

const tierStats = computed(() => [
  { label: _t18('plug_oneNum', ['aams']), value: teamInfo.value.oneCount || 0 },
  { label: _t18('plug_twoNum', ['aams']), value: teamInfo.value.twoCount || 0 },
  { label: _t18('plug_threeNum', ['aams']), value: teamInfo.value.threeCount || 0 },
  { label: _t18('plug_oneCopyTradeNum', ['aams']), value: teamInfo.value.oneCopyTradeCount || 0 },
  { label: _t18('plug_twoCopyTradeNum', ['aams']), value: teamInfo.value.twoCopyTradeCount || 0 },
  { label: _t18('plug_threeCopyTradeNum', ['aams']), value: teamInfo.value.threeCopyTradeCount || 0 },
  { label: _t18('plug_today_sum', ['aams']), value: teamInfo.value.todaySumCount || 0 },
  {
    label: `${_t18('plug_today_amount', ['aams'])}(USDT)`,
    value: teamInfo.value.todaySumAmount || 0
  },
  { label: _t18('plug_records', ['aams']), value: teamInfo.value.totalRecords || 0 }
])

const summaryStats = computed(() => [
  { label: _t18('plug_sum', ['aams']), value: teamInfo.value.sumCount || 0 },
  {
    label: `${_t18('plug_amount', ['aams'])} (USDT)`,
    value: formatMoney(teamInfo.value.sumAmount)
  },
  { label: _t18('plug_records', ['aams']), value: teamInfo.value.totalRecords || 0 }
])

const tabList = computed(() => [
  _t18('plug_one', ['aams']),
  _t18('plug_two', ['aams']),
  _t18('plug_three', ['aams']),
  _t18('plug_myCommissionRecords', ['aams'])
])

const formatMoney = (val) => Number(val || 0).toFixed(2)

const getAvatar = (index) => memberAvatars[index % memberAvatars.length]

const maskUid = (id) => {
  if (id === undefined || id === null || id === '') return ''
  const s = String(id)
  return `**${s.slice(-4)}`
}

const copyText = (text) => _copy(text)

const getTeamInfo = async () => {
  const res = await getAgentInfo()
  if (res.code == 200) {
    teamInfo.value = res.data
  }
}

const getTeamList = async () => {
  showLoading.value = true
  showCommissionRecords.value = false
  const res = await getAgentList({ params: { leve: curIndex.value + 1 } })
  if (res.code == 200) {
    setTimeout(() => {
      showLoading.value = false
      teamList.value = res.data
    }, 500)
  } else {
    showLoading.value = false
  }
}

const getCommissionType = (type) => {
  if (type == 1) return _t18('plug_recharge')
  if (type == 2) return _t18('plug_mining')
  if (type == 3) return _t18('plug_ustandard')
  return ''
}

const getCommissionRecordsList = async () => {
  showLoading.value = true
  showCommissionRecords.value = true
  const res = await getCommissionRecords({ params: { leve: curIndex.value + 1 } })
  if (res.code == 200) {
    setTimeout(() => {
      showLoading.value = false
      commissionRecordsList.value = res.data
    }, 500)
  } else {
    showLoading.value = false
  }
}

const getPopupContent = async () => {
  const res = await rulesList('PROMOTION_CENTER_EXPLAIN')
  if (res.code == 200) {
    popupContent.value = res.data
  }
}

const showPopup = () => {
  showRule.value = true
}

const closePopup = () => {
  showRule.value = false
}

const changeIndex = (v) => {
  curIndex.value = v
  teamList.value = []
  commissionRecordsList.value = []
  if (v != 3) {
    getTeamList()
  } else {
    getCommissionRecordsList()
  }
}

onMounted(() => {
  getTeamInfo()
  getTeamList()
  getPopupContent()
})
</script>

<style lang="scss" scoped>
.content {
  font-size: 0;
  min-height: 2vh;
  position: relative;

  .img-bg {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  .toBack {
    position: absolute;
    margin-top: 30px;
    margin-left: 20px;

    .back {
      font-size: 18px;
    }
  }

  .code_box {
    min-width: 300px;
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translate(-50%, 0);
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;

    p.code1 {
      font-size: 18px;
      text-align: center;
    }

    p.code2 {
      font-size: 12px;
      text-align: center;
      color: #b5b5b5;
      margin-top: 10px;
    }

    .erweima {
      padding: 20px 0;

      p {
        margin-top: -25px;
        font-size: 20px;
        text-align: center;
        font-weight: bold;
      }
    }

    .link {
      word-break: break-all;
    }
  }
}

.page--referrals {
  min-height: 100vh;
  background: #111111;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.referrals-hero {
  position: relative;
  min-height: 228px;
  overflow: visible;
}

.referrals-hero__art {
  position: absolute;
  top: 94px;
  right: 0;
  z-index: 1;
  width: 164px;
  height: 153px;
  object-fit: contain;
  pointer-events: none;
}

.referrals-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.referrals-header__back {
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

.referrals-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.referrals-header__title {
  margin: 0;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.referrals-header__action {
  position: absolute;
  right: 12px;
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

.referrals-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.referrals-hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 209px;
  max-width: calc(100% - 170px);
  margin-top: 32px;
  padding: 0 12px 18px 22px;
}

.referrals-hero__title {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.18;
  background: linear-gradient(135deg, #fff 0%, #fff 40%, rgb(196, 124, 255) 75%, rgb(160, 65, 237) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: #fff;
}

.referrals-hero__title-line {
  display: block;
}

.referrals-hero__subtitle {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.7);
}

.referrals-main {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 12px;
}

.referrals-card--stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  background: transparent;
}

.referrals-invite {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 12px;
  border-radius: 12px;
  border: 1px solid rgba(160, 65, 237, 0.5);
  background: rgba(34, 28, 49, 0.85);
}

.referrals-invite__row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  min-height: 20px;
}

.referrals-invite__label {
  flex-shrink: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.65);
}

.referrals-invite__value-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.referrals-invite__value {
  min-width: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.referrals-copy {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.referrals-copy__icon {
  display: block;
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.referrals-tier__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.referrals-tier__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 73px;
  padding: 10px 4px;
  border-radius: 12px;
  border: 1px solid rgba(160, 65, 237, 0.5);
  background: rgba(34, 28, 49, 0.85);
  text-align: center;
}

.referrals-tier__value {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
}

.referrals-tier__label {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'PingFang SC', sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.65);
}

.referrals-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(160, 65, 237, 0.5);
  background: rgba(34, 28, 49, 0.85);
}

.referrals-summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 21px;
}

.referrals-summary__label {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.65);
}

.referrals-summary__value {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.85);
  text-align: right;
}

.referrals-team {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
}

.referrals-team__title {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
}

.referrals-tabs {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  min-height: 26px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.referrals-tabs__item {
  position: relative;
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0 0 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  white-space: nowrap;
}

.referrals-tabs__item--active {
  font-size: 16px;
  font-weight: 500;
  color: #fff;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 22px;
    height: 4px;
    border-radius: 2px;
    background: rgb(160, 65, 237);
  }
}

.referrals-members {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
}

.referrals-loading {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.referrals-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0 56px;
}

.referrals-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.referrals-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}

.referrals-member {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 61px;
  padding: 12px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.referrals-member--record {
  flex-wrap: wrap;
  gap: 10px 6px;
}

.referrals-member__id {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 81px;
  flex-shrink: 0;
  min-width: 0;
}

.referrals-member__avatar {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.referrals-member__uid {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  min-width: 0;
}

.referrals-member__col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 66px;
  flex-shrink: 0;
  min-width: 0;
  text-align: center;
}

.referrals-member__col--date {
  width: 77px;
}

.referrals-member__col--record {
  width: calc(50% - 6px);
  align-items: flex-start;
  text-align: left;
}

.referrals-member__label {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'PingFang SC', sans-serif;
  font-size: 11px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.45);
}

.referrals-member__value {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Roboto', 'PingFang SC', sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  word-break: break-all;
}
</style>
