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
                <!-- 邀请码 -->
                <p class="ff-num">{{ _t18('plug_shareCode') }}：{{ sharkCode }}</p>
              </template>
            </Copy>
          </div>
          <div class="shareLink">
            <p class="ff-num">{{ _t18('plug_shareLink') }}：</p>
            <Copy :data="`${shareLink}${sharkCode}`">
              <template #copyMsg>
                <!-- 推广链接 -->
                <p class="ff-num link">{{ shareLink }}{{ sharkCode }}</p>
              </template>
            </Copy>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="plug-page">
    <DarkHeaderBar
      :title="_t18('plug')"
      :border_bottom="false"
      bg-color="transparent"
    >
      <template #right>
        <button
          type="button"
          class="plug-header-rule-btn"
          aria-label="rules"
          @click="showPopup"
        >
          <img :src="plugHeaderRuleIcon" alt="" class="plug-header-rule-img" />
        </button>
      </template>
    </DarkHeaderBar>
    <!-- 团队信息 -->
    <div class="banner">
      <div class="plug-hero">
        <div class="shareContent">
          <!-- 邀请好友一起赚币 -->
          <p class="shareContent_title fw-bold">{{ _t18('plug_invite', ['aams']) }}</p>
          <!-- 邀请好友，充值即刻获取佣金 -->
          <p class="shareContent_info">{{ _t18('plug_toInvite') }}</p>
          <div class="sharkCode">
            <Copy :data="sharkCode" :contentFix="'start'" :fontSize="'12px'">
              <template #copyMsg>
                <!-- 邀请码 -->
                <p class="ff-num">{{ _t18('plug_shareCode') }}：{{ sharkCode }}</p>
              </template>
            </Copy>
          </div>
          <div class="shareLink" :contentFix="'start'">
            <Copy :data="`${shareLink}${sharkCode}`" :fontSize="'12px'">
              <template #copyMsg>
                <!-- 推广链接 -->
                <p class="ff-num">{{ _t18('plug_shareLink') }}：{{ shareLink }}{{ sharkCode }}</p>
              </template>
            </Copy>
          </div>
        </div>
        <div v-if="!['das'].includes(_getConfig('_APP_ENV'))" class="teamInfo">
          <!-- 一代人数 -->
          <div>
            <p>{{ _t18('plug_oneNum', ['aams']) }}</p>
            <span class="ff-num">{{ teamInfo.oneCount || 0 }}</span>
          </div>
          <!-- 二代人数 -->
          <div>
            <p>{{ _t18('plug_twoNum', ['aams']) }}</p>
            <span class="ff-num">{{ teamInfo.twoCount || 0 }}</span>
          </div>
          <!-- 三代人数 -->
          <div>
            <p>{{ _t18('plug_threeNum', ['aams']) }}</p>
            <span class="ff-num">{{ teamInfo.threeCount || 0 }}</span>
          </div>
          <!-- 推广总人数 -->
          <div>
            <p>{{ _t18('plug_sum', ['aams']) }}</p>
            <span class="fw-num">{{ teamInfo.sumCount || 0 }}</span>
          </div>
          <!-- 佣金金额 -->
          <div>
            <p>{{ _t18('plug_amount', ['aams']) }}(USDT)</p>
            <span class="ff-num">{{ formatMoney(teamInfo.sumAmount)}}</span>
          </div>
          <div>
            <p>{{ _t18('plug_records', ['aams']) }}</p>
            <span class="ff-num">{{ teamInfo.totalRecords || 0 }}</span>
          </div>
         <!-- 当日推广总人数 -->
          <div>
            <p>{{ _t18('plug_today_sum', ['aams']) }}</p>
            <span class="ff-num">{{ teamInfo.todaySumCount || 0 }}</span>
          </div>
           <!-- 当日佣金金额 -->
          <div>
            <p>{{ _t18('plug_today_amount', ['aams']) }}(USDT)</p>
            <span class="ff-num">{{ teamInfo.todaySumAmount || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!['das'].includes(_getConfig('_APP_ENV'))">
      <!-- 我的推广/我的团队 -->
      <div class="promotion_my" v-if="!['bitfly'].includes(_getConfig('_APP_ENV'))">
        <div class="title fw-bold">{{ _t18('plug_myShare', ['aams']) }}</div>
        <!--我的推广-->
        <Tab
          :tabList="tabList"
          :active="curIndex"
          @change="changeIndex"
          :lineWidth="0"
          :flexBetween="true"
          title-inactive-color="rgba(255, 255, 255, 0.5)"
          title-active-color="#17AC74"
          indicator-color="#17AC74"
        >
          <!-- 加载中动画 -->
          <template #tabContent>  
            <Nodata v-if="teamList.length <= 0 && !showLoading && !showCommissionRecords "></Nodata>
            <div v-if="!showCommissionRecords"  class="contentBox">
              <div class="header">
              <!--用户ID  返佣金额  注册时间 -->
              <p>{{ _t18('plug_userId') }}</p>
              <p>{{ _t18('plug_back') }}(USDT)</p>
              <p>{{ _t18('plug_registerTime') }}</p> 
            </div>
            <van-loading v-if="showLoading" />
              <div  class="content" v-for="(item, index) in teamList" :key="index">
                <p class="ff-num">{{ item.fromId || '' }}</p>
                <p class="ff-num">{{ formatMoney(item.sumAmount)}}</p>
                <!-- <p>{{ item.createTime?_timeFormat(item.createTime, 'HH:mm MM/DD', true):'' }}</p> -->
                <p class="ff-num">
                  {{
                    item.createTime
                      ? _timeFormat(item.params?.createTime, 'YY/MM/DD HH:mm', true)
                      : ''
                  }}
                </p>
              </div>
            </div>

            <div  v-if="showCommissionRecords"  class="contentBox"> 
              <div class="header">
                <p>{{ _t18('plug_fromId') }}</p>
                <p>{{ _t18('plug_commissionType') }}</p>
                <p>{{ _t18('plug_back') }}(USDT)</p>
                <p>{{ _t18('plug_commissionTime') }}</p> 
              </div>
              <div  class="content" v-for="(item, index) in commissionRecordsList" :key="index">
                <p class="ff-num">{{ item.fromId || '' }}</p>
                <p class="ff-num">{{ getCommissionType(item.type) }}</p>
                <p class="ff-num">{{ item.sumAmount || 0 }}</p> 
                <p class="ff-num">
                  {{
                    item.createTime
                      ? _timeFormat(item.params?.createTime, 'YY/MM/DD HH:mm', true)
                      : ''
                  }}
                </p>
              </div>
            </div>
           
          </template>
        </Tab>
      </div>
    </div>

    <!-- 质押挖矿规则弹窗 -->
    <Popup
      :show="showRule"
      @handelClose="closePopup"
      :title="txt"
      :content="popupContent"
      :direction="direction"
    >
    </Popup>
  </div>
</template>

<script setup>
import { NO_SHOW_MEMBER } from '@/config/index'
import { _t18 } from '@/utils/public'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import plugHeaderRuleIcon from '@/assets/images/Frame 10711.png'
import QRCode from '@/components/common/QRCode/index.vue'
import Copy from '@/components/common/Copy/index.vue'
import Tab from '@/components/Tab/index.vue'
import Popup from '@/components/Popup/index.vue'
import { useUserStore } from '@/store/user/index'
import { getAgentInfo, getAgentList,getCommissionRecords } from '@/api/plug.js'
import { onMounted } from 'vue'
import { rulesList } from '@/api/common/index'

const useStore = useUserStore()
const userInfo = useStore.userInfo
const sharkCode = userInfo?.user?.activeCode
// const shareLink = process.env.VITE_APP_PLATFORM || `https://xhqb.net/#/i&`
const shareLink = `${location.origin}/#/i&`
// 推广中心数据
const showLoading = ref(true)
const showCommissionRecords = ref(false)
const teamInfo = ref({})
const teamList = ref([])
const commissionRecordsList  = ref([])//佣金记录
const popupContent = ref({})
const getTeamInfo = async () => {
  const res = await getAgentInfo()
  if ((res.code == 200)) {
      teamInfo.value = res.data
  }
}
const formatMoney = (val)=>{
    return Number(val || 0).toFixed(2)
  }
const getTeamList = async () => {
  showLoading.value = true
  showCommissionRecords.value = false;
  const res = await getAgentList({ params: { leve: curIndex.value + 1 } })
  if ((res.code == 200)) {
    setTimeout(() => {
      showLoading.value = false
      teamList.value = res.data
    }, 500)
  }
}

const getCommissionType = (type)=>{
  if (type == 1) return _t18('plug_recharge');
  if (type == 2) return _t18('plug_mining');
  if (type == 3) return _t18('plug_ustandard');
}

const getCommissionRecordsList = async () => {
  showLoading.value = true
  showCommissionRecords.value = true;
  const res = await getCommissionRecords({ params: { leve: curIndex.value + 1 } })
  if ((res.code == 200)) {
    setTimeout(() => {
      showLoading.value = false
      commissionRecordsList.value = res.data
    }, 500)
  }
}

const getPopupContent = async () => {
  const res = await rulesList('PROMOTION_CENTER_EXPLAIN')
  if ((res.code == 200)) {
    popupContent.value = res.data
  }
}
onMounted(() => {
  getTeamInfo()
  getTeamList()
  getPopupContent()
})
// const teamInfo = computed(() => {
//   let obj = {}
//   obj = { one: 10, two: 20, three: 30, sum: '60', amount: 10000000 }
//   return obj
// })
const showRule = ref(false)
const txt = _t18('plug_rule') //规则
const direction = ref('bottom')
let showPopup = () => {
  showRule.value = true
}
let closePopup = () => {
  showRule.value = false
}
const curIndex = ref(0)
const tabList = computed(() => {
  let list = []
  // list = ['一代', '二代', '三代']
  list = [
      _t18('plug_one', ['aams']), 
      _t18('plug_two', ['aams']),
      _t18('plug_three', ['aams']),
      _t18('plug_myCommissionRecords', ['aams'])
  ]
  return list
})
const changeIndex = (v) => {
  curIndex.value = v
  teamList.value = []
  if (v != 3) {
    getTeamList()
  }else {
    console.log("commission records - ");
    getCommissionRecordsList();
  }
}
</script>

<style lang="scss" scoped>
* {
  color: var(--ex-default-font-color);
  font-size: 14px;
}

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

.plug-page {
  min-height: 100vh;
  background: #0a1f1f;
}

.plug-header-rule-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin: -8px;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.plug-header-rule-img {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.banner {
  .plug-hero {
    margin-top: calc(-1 * (60px + constant(safe-area-inset-top)));
    margin-top: calc(-1 * (60px + env(safe-area-inset-top, 0px)));
    padding: calc(60px + constant(safe-area-inset-top) + 12px) 15px 24px;
    padding: calc(60px + env(safe-area-inset-top, 0px) + 12px) 15px 24px;
    background: url('@/assets/images/plug-bg.png') no-repeat center top;
    background-size: cover;

    .shareContent {
      width: 100%;
      max-width: 92%;

      .shareContent_title {
        font-size: 22px;
        color: #fff;
        line-height: 1.35;
      }

      .shareContent_info {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.72);
        padding: 10px 0 28px;
      }

      .sharkCode,
      .shareLink {
        p {
          line-height: 1.35;
          font-size: 12px;
          word-break: break-all;
          color: rgba(255, 255, 255, 0.92);
        }
      }
    }

    .teamInfo {
      margin-top: 14px;
      padding: 18px 6px 12px;
      display: flex;
      flex-wrap: wrap;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);

      & > div {
        width: 33.33%;
        padding: 15px 5px;
        text-align: center;

        p {
          height: 30px;
          color: rgba(255, 255, 255, 0.62);
          margin-bottom: 15px;
          word-wrap: break-word;
        }

        span {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
      }
    }
  }

  img {
    width: 100%;
    height: auto;
  }
}

.plug-page .promotion_my {
  background: #071818;
  border-radius: 22px 22px 0 0;
  padding-bottom: 20px;
  margin-top: 6px;

  .title {
    padding: 22px 15px 16px;
    color: rgba(255, 255, 255, 0.96);
    font-weight: bold;
    font-size: 16px;
  }

  .header {
    padding: 15px 15px 10px;
    display: flex;

    & > p:first-child {
      text-align: left;
    }

    & > p:last-child {
      text-align: right;
    }

    p {
      font-size: 12px;
      flex: 1;
      color: rgba(255, 255, 255, 0.55);
      text-align: center;
    }
  }

  .contentBox {
    height: 50vh;
    overflow: auto;
  }

  .content {
    padding: 15px 0;
    display: flex;

    & > p:first-child {
      text-align: left;
    }

    & > p:last-child {
      text-align: right;
    }

    p {
      padding: 0 15px;
      font-size: 12px;
      flex: 1;
      text-align: center;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.88);
    }
  }

  /* Tab 组件 betweenClass 会使用浅色 --ex-home-list-bgcolor，在深色推广页强制与面板一致 */
  :deep(.van-tabs__wrap),
  :deep(.van-tabs__nav) {
    background: #071818 !important;
  }

  :deep(.tabContent) {
    border-top-color: rgba(255, 255, 255, 0.08);
  }
}

.van-loading {
  text-align: center;
  padding: 30px;
}
</style>
