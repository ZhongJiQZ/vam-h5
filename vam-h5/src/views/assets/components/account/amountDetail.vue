<template>
  <div class="assetDetails">
    <div v-if="assetDetails?.length" class="asset-list-group">
      <div class="asset-list-bar">
        {{ _t18('asset_detail', ['ebc']) }}
      </div>
      <div v-for="(item, index) in assetDetails" :key="index" class="asset-card">
        <div class="top">
          <svg-load
            v-if="item.title == 'USDT'"
            style="width: 30px"
            :name="item.icon"
            class="currencyIcon"
          />
          <img v-else :src="item.loge" style="width: 30px" />
          <p class="fw-num">{{ item.title }}</p>
        </div>
        <div class="bottom">
          <div>
            <p class="til">{{ _t18('asset_available') }}</p>
            <p class="num fw-num">
              {{ amountFormat(item.keyong) }}
            </p>
          </div>
          <div>
            <p class="til">
              {{ _t18('asset_occupation') }}
            </p>
            <p class="num fw-num">
              {{ amountFormat(item.zhanyong, 4) }}
            </p>
          </div>
          <div>
            <p class="til">{{ _t18('asset_equivalent', ['bitmake', 'ebc']) }}(USDT)</p>
            <p class="num fw-num">
              {{ amountFormat(item.zhehe) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { _hide, _t18, _numberWithCommas } from '@/utils/public.js'
import { priceFormat } from '@/utils/decimal.js'
const props = defineProps({
  assetDetails: {
    type: Object
  },
  showNum: {
    type: Boolean
  }
})

/**
 * 金额格式化
 * @param {*} amount
 * @param {*} hide
 * @param {*} decimal
 */
const amountFormat = (amount, decimal = 0) => {
  let tempVal = priceFormat(amount, decimal)
  if (props.showNum) {
    tempVal = _numberWithCommas(tempVal)
  } else {
    tempVal = _hide(tempVal)
  }
  return tempVal
}
</script>

<style lang="scss" scoped>
.assetDetails {
  padding: 0 0 100px;
}

.asset-list-group {
  margin: 0 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 12px;
}

.asset-list-bar {
  background: #f6f7fb;
  border-radius: 10px;
  padding: 12px 15px;
  font-size: 14px;
  color: #7a8c99;
}

.asset-card {
  background: #f6f7fb;
  border-radius: 10px;
  padding: 14px 15px;

  .top {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    img {
      border-radius: 100%;
      width: 22px;
      height: 22px;
      margin-right: 8px;
    }

    .currencyIcon {
      font-size: 14px;
      margin-right: 8px;
    }

    p {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--ex-font-color6);
    }
  }

  .bottom {
    display: flex;
    justify-content: space-between;
    gap: 8px;

    & > div {
      flex: 1;
      text-align: center;
      min-width: 0;

      .til {
        margin: 0;
        padding: 0 0 6px;
        font-size: 12px;
        color: var(--ex-passive-font-color);
      }

      .num {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--ex-font-color6);
      }

      &:first-child {
        text-align: start;
      }

      &:last-child {
        text-align: end;
      }
    }
  }
}
</style>
