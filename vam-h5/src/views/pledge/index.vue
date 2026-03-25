<!-- 质押挖矿 -->
<script setup>
import { _t18 } from '@/utils/public'
import { getPledgeProductList, getPledgeShowInfo } from '@/api/pledge/index'
import { priceFormat } from '@/utils/decimal.js'
import { useRouter } from 'vue-router'
import Popup from '@/components/Popup/index.vue'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import Card from './components/card.vue'
import pledgeCoinIcon from '@/assets/images/Frame 981370.png'
import { onMounted } from 'vue'
import { rulesList } from '@/api/common/index'
const router = useRouter()

const showRule = ref(false)
const txt = _t18('defi_speak')
const popupContent = ref({})
const direction = ref('bottom')
let showPopup = () => {
  showRule.value = true
}
let closePopup = () => {
  showRule.value = false
}
const toView = (data) => {
  router.push({
    path: '/pledge/pledgeDetail',
    query: { data: encodeURI(JSON.stringify(data)) }
  })
}
const showInfo = ref({})
const projectList = ref([])
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

/**弹窗内容 */
const getPopupContent = async () => {
  const res = await rulesList('PLEDGE_EXPLAIN')
  if ((res.code = '200')) {
    popupContent.value = res.data
  }
}

onMounted(() => {
  getProjectList()
  getShowInfo()
  getPopupContent()
})
// const projectList = computed(() => {
//   let list = []
//   list = [
//     {
//       id: 1,
//       title: '项目一',
//       kegou: '5',
//       sum: '50',
//       xiane: '200-500',
//       rate: '0%-10%',
//       period: '15'
//     },
//     {
//       id: 2,
//       title: '项目二',
//       kegou: '10',
//       sum: '50',
//       xiane: '200-500',
//       rate: '0%-10%',
//       period: '20'
//     },
//     {
//       id: 3,
//       title: '项目三',
//       kegou: '15',
//       sum: '50',
//       xiane: '200-500',
//       rate: '0%-10%',
//       period: '25'
//     }
//   ]
//   return list
// })
const manual = computed(() => {
  let list = []
  list = [
    {
      title: '什么是质押挖矿？',
      content: [
        {
          childContent:
            '质押挖矿是本公司打造的一款帮助用户快捷进行链上质押获取奖励的工具产品。通过将数字资产质押在区块链网络，并获得基于POS（Proof of Stake，即权益证明）机制产生的奖励。在这个机制中，用户将数字资产委托给节点，节点在区块链上行使出块、打包交易等权利并获得奖励。用户根据锁仓数量按比例分享节点获得的奖励。'
        }
      ],
      notes: [
        ' 注：(非出借)每6小时一个阶段每天发送4次收益详情，您可以通过收益详情查看详细收益情况。 ',
        ' 注：(本产品属福利项引流产品目前名额有限，后续将对用户增设数字资产评估，只对达标用户开启该产品，所以先到先得)。 '
      ]
    },
    {
      title: '产品优势',
      content: [
        {
          childTitle: '稳健型',
          childContent: '质押挖矿可以获得第三方相对稳定的奖励，产品期限多样。'
        }
      ]
    },
    {
      title: '投向生息资产说明',
      content: [
        {
          childContent:
            '质押挖矿是将您的数字资产质押在区块链上，以支持该区块链网络的运营，并获得相应的奖励。'
        }
      ]
    },
    {
      title: '收益说明',
      content: [
        {
          childContent: 'T日申购成功后，T+1日00:00开始起息，02:00利息结算。'
        }
      ]
    },
    {
      title: '交易说明',
      content: [
        {
          childTitle: '买入规则',
          childContent: '支持随时申购。'
        }
      ]
    },
    {
      title: '风险提示',
      content: [
        {
          childContent: '提前赎回定期产品，系统将扣除该笔订单已经获得的部分收益。'
        }
      ]
    }
  ]
  return list
})
</script>
<template>
  <!-- 质押挖矿规则弹窗 -->
  <Popup
    :show="showRule"
    :direction="direction"
    @handelClose="closePopup"
    :title="txt"
    :content="popupContent"
  >
  </Popup>
  <div class="pledge-page">
    <DarkHeaderBar
      :title="_t18('defi_host_lockup')"
      :border_bottom="false"
      bg-color="transparent"
    >
      <template #right>
        <button
          type="button"
          class="pledge-header-icon-btn"
          aria-label="rules"
          @click="showPopup"
        >
          <svg-load name="guize" class="pledge-header-icon"></svg-load>
        </button>
        <button
          type="button"
          class="pledge-header-icon-btn"
          aria-label="history"
          @click="router.push('/pledge/pledgeOrder')"
        >
          <svg-load name="jilu" class="pledge-header-icon"></svg-load>
        </button>
      </template>
    </DarkHeaderBar>
    <!-- 顶部背景 + 收益信息 -->
    <div class="pledge-hero">
      <div class="userAccount">
        <div class="title">
          <img :src="pledgeCoinIcon" alt="" class="pledge-coin-icon pledge-coin-icon--hero" />
          <p class="fw-num">USDT</p>
        </div>
        <div class="fund">
          <image-load filePath="zhiyaimg.png" name="zhiyaimg" class="zhiyaimg"></image-load>
          <div class="top">
            <div class="left">
              <p class="fw-num">{{ priceFormat(showInfo.amount) || 0 }}</p>
              <!-- 正在托管 -->
              <span>{{ _t18('pledge_hosting') }}</span>
            </div>
            <div class="right">
              <p class="fw-num">{{ showInfo.orderNum || 0 }}</p>
              <!-- 委托订单 -->
              <span>{{ _t18('pledge_commissioned_order') }}</span>
            </div>
          </div>
          <div class="bottom">
            <div class="left">
              <p class="fw-num">{{ priceFormat(showInfo.todayProfit) || 0 }}</p>
              <!-- 今日收益 -->
              <span>{{ _t18('pledge_Today_Earnings') }}</span>
            </div>
            <div class="right">
              <p class="fw-num">{{ priceFormat(showInfo.profitMoney) || 0 }}</p>
              <!-- 累计收益 -->
              <span>{{ _t18('Cumulative_income') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 项目信息 -->
    <div class="pledge-list-wrap">
      <div class="project">
        <div class="projectList" v-if="projectList?.length > 0">
          <Card
            v-for="(item, index) in projectList"
            @click="toView(item)"
            :key="index"
            :cardData="item"
          ></Card>
        </div>
        <Nodata v-else></Nodata>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.pledge-header-icon-btn {
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

.pledge-header-icon {
  display: block;
  width: 22px;
  height: 22px;
  font-size: 22px;
  color: #fff;
}

.pledge-coin-icon {
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}

.pledge-coin-icon--hero {
  width: 34px;
  height: 34px;
}

.pledge-page {
  min-height: 100vh;
  background: #0a1f1f;
}

.pledge-hero {
  margin-top: calc(-1 * (60px + constant(safe-area-inset-top)));
  margin-top: calc(-1 * (60px + env(safe-area-inset-top, 0px)));
  padding: calc(60px + constant(safe-area-inset-top) + 68px) 0 28px;
  padding: calc(60px + env(safe-area-inset-top, 0px) + 68px) 0 28px;
  background: url('@/assets/images/pledge-bg.png') no-repeat center top;
  background-size: cover;
}

.pledge-list-wrap {
  background: #0a2424;
  border-radius: 22px 22px 0 0;
  margin-top: -12px;
  padding-top: 8px;
  min-height: 40vh;
}

.userAccount {
  font-size: 14px;
  padding: 0 15px;
  color: #fff;
  .title {
    padding: 12px 0 20px;
    display: flex;
    align-items: center;
    p {
      margin-left: 10px;
      font-size: 24px;
      color: #fff;
    }
  }
  .fund {
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 12px;
    position: relative;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    .zhiyaimg {
      position: absolute;
      font-size: 100px;
      transform: translate(-50%, -50%);
      left: 50%;
      top: 50%;
    }
    .top,
    .bottom {
      display: flex;
      justify-content: space-between;
      .left,
      .right {
        width: 100%;
        height: 100%;
        padding: 25px 15px;

        p,
        span {
          max-width: 100%;
          word-break: break-word;
        }
      }
      .right {
        border-left: 1px solid rgba(255, 255, 255, 0.12);
        text-align: right;
      }
      p {
        font-size: 18px;
        margin-bottom: 10px;
        color: #fff;
      }
      span {
        color: rgba(255, 255, 255, 0.65);
      }
    }
    .bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      p {
        color: #5cff8f;
      }
    }
    .title {
      margin-bottom: 14px;
      span {
        color: rgba(255, 255, 255, 0.65);
      }
    }
    .amount {
      font-size: 28px;
    }
  }
}
.project {
  padding: 0 15px 50px;
}
</style>
