<template>
  <div class="content" :class="{ 'content--card': cardSurface }">
    <div class="content1">
      <!-- 币种 -->
      <div class="left">{{ _t18('recharge_coin') }}</div>
      <div class="right">{{ props.data.type }}</div>
    </div>
    <div class="content2">
      <!-- 状态 -->
      <div class="left">{{ _t18('recharge_status') }}</div>
      <div class="right">
        <!-- 审核中 成功 失败 -->
        <p
          class="status0"
          :class="{ 'st-wait': cardSurface }"
          v-if="props.data.status == 0"
        >
          {{ _t18('recharge_waiting') }}
        </p>
        <p
          class="status1"
          :class="{ 'st-ok': cardSurface }"
          v-if="props.data.status == 1"
        >
          {{ _t18('recharge_tab_success') }}
        </p>
        <p
          class="status2"
          :class="{ 'st-fail': cardSurface }"
          v-if="props.data.status == 2"
        >
          {{ _t18('recharge_tab_error') }}
        </p>
      </div>
    </div>
    <div class="content3">
      <!-- 时间 -->
      <div class="left">{{ _t18('recharge_time') }}</div>
      <div class="right ff-num">{{ _timeFormat(props.data.params?.createTime) }}</div>
    </div>
    <div class="content4">
      <!-- 充值地址  提现地址 -->
      <div class="top" v-if="$route.path.includes('recharge')">
        {{ _t18('recharge_address', ['bitmake']) }}
      </div>
      <div class="top" v-if="$route.path.includes('withdraw')">{{ _t18('withdraw_address') }}</div>

      <div class="bottom" v-if="$route.path.includes('withdraw')">
        <Copy :data="`${props.data.toAdress}`">
          <template #copyMsg>
            <span class="fw-num">{{ props.data.toAdress }}</span>
          </template>
        </Copy>
      </div>
      <div class="bottom" v-if="!$route.path.includes('withdraw')">
        <Copy :data="`${props.data.address}`">
          <template #copyMsg>
            <span class="fw-num">{{ props.data.address }}</span>
          </template>
        </Copy>
      </div>
    </div>
    <div class="content5">
      <!-- 订单号 -->
      <div class="top">{{ _t18('orderCode') }}</div>
      <div class="bottom">
        <Copy :data="`${props.data.serialId}`">
          <template #copyMsg>
            <span class="fw-num">{{ props.data.serialId }}</span>
          </template>
        </Copy>
      </div>
    </div>
  </div>
</template>

<script setup>
import { _toView, _hideAddress, _t18 } from '@/utils/public'
import Copy from '@/components/common/Copy/index.vue'
const props = defineProps({
  data: {
    type: Object
  },
  cardSurface: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.content {
  padding: 20px 15px;
  & > div {
    .left,
    .top {
      color: var(--ex-passive-font-color);
    }
  }

  .content1,
  .content2,
  .content3 {
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    align-content: center;
    .top {
      margin-bottom: 10px;
    }
    .right {
      .status0 {
        color: var(--ex-font-color23);
      }
      .status1 {
        color: var(--ex-font-color9);
      }
      .status2 {
        color:var(--ex-font-color3);
      }
    }
  }
  .content4,
  .content5 {
    margin-bottom: 15px;
    .bottom {
      font-weight: 500;
    }
  }
}

.content--card {
  padding: 16px 0 0;

  .content1,
  .content2,
  .content3 {
    margin-bottom: 16px;

    .left {
      color: #969799;
      font-size: 14px;
    }

    .right {
      font-size: 14px;
      color: #323233;
      text-align: right;
      max-width: 65%;
      word-break: break-word;
    }

    .st-wait {
      color: #1989fa !important;
    }

    .st-ok {
      color: #17ac74 !important;
    }

    .st-fail {
      color: #ee0a24 !important;
    }
  }

  .content4,
  .content5 {
    margin-bottom: 16px;

    .top {
      color: #969799;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .bottom {
      font-size: 14px;
      color: #323233;
      line-height: 1.5;
      word-break: break-all;
    }
  }
}
</style>
