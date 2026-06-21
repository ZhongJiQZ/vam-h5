<template>
  <section class="assets-list" :aria-label="_t18('asset_detail', ['ebc'])">
    <h2 class="assets-list__title">{{ _t18('asset_detail', ['ebc']) }}</h2>

    <article v-for="(item, index) in assetDetails" :key="index" class="assets-row">
      <div class="assets-row__head">
        <span class="assets-row__icon">
          <svg-load
            v-if="item.title === 'USDT'"
            :name="item.icon"
            class="assets-row__icon-svg"
          />
          <img v-else-if="item.loge" :src="item.loge" alt="" class="assets-row__icon-img" />
        </span>
        <span class="assets-row__symbol">{{ item.title }}</span>
      </div>
      <div class="assets-row__stats">
        <div class="assets-row__stat">
          <span class="assets-row__stat-label">{{ _t18('asset_available') }}</span>
          <span class="assets-row__stat-value fw-num">{{ amountFormat(item.keyong) }}</span>
        </div>
        <div class="assets-row__stat">
          <span class="assets-row__stat-label">{{ _t18('asset_occupation') }}</span>
          <span class="assets-row__stat-value fw-num">{{ amountFormat(item.zhanyong, 4) }}</span>
        </div>
        <div class="assets-row__stat">
          <span class="assets-row__stat-label">
            {{ _t18('asset_equivalent', ['bitmake', 'ebc']) }}(USDT)
          </span>
          <span class="assets-row__stat-value fw-num">{{ amountFormat(item.zhehe) }}</span>
        </div>
      </div>
    </article>

    <Nodata v-if="!assetDetails?.length" />
  </section>
</template>

<script setup>
import { _hide, _t18, _numberWithCommas } from '@/utils/public.js'
import { priceFormat } from '@/utils/decimal.js'

const props = defineProps({
  assetDetails: {
    type: Array,
    default: () => [],
  },
  showNum: {
    type: Boolean,
    default: true,
  },
})

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
.assets-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 18px;
  padding-bottom: 12px;
}

.assets-list__title {
  margin: 0;
  padding: 0 2px 8px;
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  color: #fff;
}

.assets-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.assets-row__head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
}

.assets-row__icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.assets-row__icon-svg,
.assets-row__icon-img {
  width: 24px;
  height: 24px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.assets-row__symbol {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.85);
}

.assets-row__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 8px;
}

.assets-row__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  &:nth-child(1) {
    align-items: flex-start;
    text-align: left;
  }

  &:nth-child(2) {
    align-items: center;
    text-align: center;
  }

  &:nth-child(3) {
    align-items: flex-end;
    text-align: right;
  }
}

.assets-row__stat-label {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  line-height: 1.15;
  color: rgba(255, 255, 255, 0.45);
}

.assets-row__stat-value {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 1.18;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
}
</style>
