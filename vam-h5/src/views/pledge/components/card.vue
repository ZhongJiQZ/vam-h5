<script setup>
import { _t18 } from '@/utils/public'
import pledgeCoinIcon from '@/assets/images/Frame 981370.png'
let props = defineProps({
  cardData: {
    type: Object
  }
})
const dataValue = ref(props.cardData)
</script>
<template>
  <div class="box">
    <div class="top">
      <div class="top_left">
        <img :src="pledgeCoinIcon" alt="" class="pledge-coin-icon" />
        <div class="title fw-bold">{{ dataValue.title }}</div>
      </div>
      <div class="top_right">{{ _t18('pledge_Buy', ['aams']) }}</div>
      <!-- <div class="top_right">
        可购：<span class="ff-num">{{ `${dataValue.kegou}/${dataValue.sum}` }}</span>
      </div> -->
    </div>
    <div class="content">
      <div class="left">
        <div class="content1">
          <!-- 限额 -->
          <p>{{ _t18('pledge_quota') }}</p>
          <span class="fw-num">{{ dataValue.limitMin }}~{{ dataValue.limitMax }}</span>
        </div>
        <div class="content2">
          <!-- 天数 -->
          <p>{{ _t18('pledge_number_days') }}</p>
          <span class="fw-num">{{ dataValue.days }}</span>
        </div>
        <div class="content3">
          <!-- 可购 -->
          <p>{{ _t18('pledge_available_purchase', ['aams']) }}</p>
          <span class="fw-num" v-if="['dev'].includes(_getConfig('_APP_ENV'))">{{ `${dataValue.buyPurchase}/${dataValue.timeLimit}` }}</span>
          <!-- buyPurchase -->
          <span class="fw-num" v-else>{{ `${dataValue.timeLimit}` }}</span>
        </div>
        <div class="content3">
          <!-- 收益率 -->
          <p>{{ _t18('pledge_rate_return') }}</p>
          <span class="fw-num rate">{{ dataValue.minOdds }}%~{{ dataValue.maxOdds }}%</span>
        </div>
      </div>
      <div class="right">
        <image-load filePath="zhiyacard.png" name="zhiyacard" class="zhiyacard"></image-load>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.box {
  margin-top: 0;
  cursor: pointer;
  border: none;
  border-radius: 0;
  background: transparent;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.78);

  & + .box {
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 4px 18px;
    .top_left {
      display: flex;
      align-items: center;
      .title {
        font-weight: bold;
        color: #fff;
      }
      .pledge-coin-icon {
        width: 22px;
        height: 22px;
        object-fit: contain;
        margin-right: 10px;
        flex-shrink: 0;
      }
    }
    .top_right {
      min-width: 88px;
      padding: 8px 18px;
      color: #fff;
      text-align: center;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
      -webkit-tap-highlight-color: transparent;
      border: none;
      background: linear-gradient(
        165deg,
        rgba(255, 255, 255, 0.22) 0%,
        rgba(255, 255, 255, 0.07) 45%,
        rgba(255, 255, 255, 0.05) 100%
      );
      backdrop-filter: blur(18px) saturate(1.15);
      -webkit-backdrop-filter: blur(18px) saturate(1.15);
      /* 无描边：用内高光模拟玻璃上沿更亮，避免整圈线框感 */
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.65),
        inset 0 -1px 0 rgba(0, 0, 0, 0.18),
        0 2px 14px rgba(0, 0, 0, 0.22);
    }
  }
  .content {
    display: flex;
    padding: 18px 4px 8px;
    justify-content: space-between;
    .left {
      display: flex;
      flex-direction: column;
      & > div {
        flex: 1;
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.78);
        font-size: 12px;
        p {
          min-width: 36px;
          color: rgba(255, 255, 255, 0.78);
        }
        span {
          margin-left: 20px;
          color: rgba(255, 255, 255, 0.96);
          font-size: 18px;
        }
        span.rate {
          color: #5cff8f;
        }
      }
    }
    .right {
      .zhiyacard {
        font-size: 120px;
      }
    }
  }
}
</style>
