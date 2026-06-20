<template>
  <div class="assets-account">
    <div class="assets-summary">
      <span class="assets-summary__label">
        {{ t18Type(type) }}{{ _t18('asset_account', ['ebc']) }}
      </span>
      <div v-if="type === 'plat'" class="assets-summary__tools">
        <AssetsShortcuts />
      </div>
    </div>

    <div class="assets-balance">
      <div class="assets-balance__card">
        <div class="assets-balance__card-shapes" aria-hidden="true">
          <svg
            class="assets-balance__card-bg-purple"
            viewBox="0 0 670 214"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="assets-grad-card" gradientUnits="objectBoundingBox" x1="0" y1="0.5" x2="1" y2="0.5">
                <stop offset="0%" stop-color="rgba(160,65,236,0.650)" />
                <stop offset="60.9%" stop-color="rgba(81,76,253,0.650)" />
              </linearGradient>
            </defs>
            <path
              fill="url(#assets-grad-card)"
              fill-rule="nonzero"
              d="M459.7 0L24 0C10.75 0 0 10.75 0 24L0 190C0 203.25 10.75 214 24 214L646 214C659.25 214 670 203.25 670 190L670 43.31L670 24C670 10.75 659.25 0 646 0L459.7 0Z"
            />
          </svg>
        </div>
        <div class="assets-balance__card-content">
          <div class="assets-balance__amount-line">
            <span class="assets-balance__amount fw-num">{{ displayAmount }}</span>
            <span class="assets-balance__unit">USDT</span>
            <div class="assets-balance__icon-actions">
              <button
                type="button"
                class="assets-balance__refresh-btn"
                aria-label="refresh"
                @click="handleShuaxin"
              >
                <svg-load name="refresh" class="assets-balance__inline-icon" />
              </button>
              <button
                type="button"
                class="assets-balance__eye-btn"
                aria-label="toggle visibility"
                @click="handleYanjin"
              >
                <svg-load :name="showicon" class="assets-balance__inline-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="assets-balance__wallet-wrap">
        <img class="assets-balance__wallet" :src="walletImg" alt="" aria-hidden="true" />
      </div>

      <div class="assets-balance__panel">
        <svg
          class="assets-balance__panel-shape"
          viewBox="0 0 702 132"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="rgba(22,0,74,0.850)"
            fill-rule="nonzero"
            d="M678 0L377.68 0C375.62 0 373.64 0.8 372.15 2.22L356.92 16.81C353.87 19.73 349.08 19.78 345.97 16.93L329.83 2.11C328.35 0.75 326.42 0 324.42 0L24 0C10.75 0 0 10.75 0 24L0 108C0 121.25 10.75 132 24 132L678 132C691.25 132 702 121.25 702 108L702 24C702 10.75 691.25 0 678 0Z"
          />
        </svg>
        <div
          class="assets-balance__actions"
          :style="{ gridTemplateColumns: `repeat(${visibleActions.length}, 1fr)` }"
        >
          <button
            v-for="(item, index) in visibleActions"
            :key="index"
            type="button"
            class="assets-balance__action"
            @click="toRecharge(item.url)"
          >
            <span class="assets-balance__action-icon">
              <AssetsIcon :name="item.icon" :size="28" />
            </span>
            <span>{{ item.title }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { dispatchCustomEvent } from '@/utils'
import { _t18, _toView, _numberWithCommas } from '@/utils/public'
import { DIFF_RECHARGE_COSTORM } from '@/config/index'
import walletImg from '@/assets/images/gxpex/assets/wallet.png'
import AssetsIcon from '../AssetsIcon.vue'
import AssetsShortcuts from '../AssetsShortcuts.vue'

const props = defineProps({
  amount: {
    type: String,
  },
  type: {
    type: String,
  },
  showicon: {
    type: String,
  },
})

const emit = defineEmits(['handleYanjin', 'handleShuaxin'])

const handleYanjin = () => emit('handleYanjin')
const handleShuaxin = () => emit('handleShuaxin')

const displayAmount = computed(() => _numberWithCommas(props.amount || '0'))

const currencyAbout = computed(() => {
  if (props.type === 'plat') {
    return [
      { icon: 'deposit', title: _t18('asset_recharge', ['latcoin']), url: '/recharge', isShow: true },
      { icon: 'withdraw', title: _t18('asset_withdraw', ['latcoin']), url: '/withdraw', isShow: true },
      { icon: 'swap', title: _t18('asset_swap'), url: '/swap', isShow: true },
      { icon: 'transfer', title: _t18('asset_transfer'), url: '/transfer', isShow: true },
    ]
  }
  return [
    { icon: 'transfer', title: _t18('asset_transfer'), url: '/transfer', isShow: true },
  ]
})

const visibleActions = computed(() => currencyAbout.value.filter((item) => item.isShow))

const toRecharge = (url) => {
  if (DIFF_RECHARGE_COSTORM.includes(__config._APP_ENV) && url === '/recharge') {
    dispatchCustomEvent('event_serviceChange')
  } else {
    _toView(url)
  }
}

const t18Type = (type) => {
  if (type === 'plat') return _t18('asset_platform')
  if (type === 'finance') return _t18('asset_finance')
  if (type === 'contract') return _t18('asset_contarct')
  return type
}
</script>

<style lang="scss" scoped>
.assets-account {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.assets-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 23px;
  padding: 0 2px;
}

.assets-summary__label {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  color: #fff;
}

.assets-summary__tools {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.assets-balance {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 114px;
  grid-template-rows: 100px auto;
  gap: 0;
  position: relative;
  overflow: visible;
}

.assets-balance__card {
  grid-column: 1 / -1;
  grid-row: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 114px;
  grid-template-rows: 100px;
  height: 100px;
  width: calc(100% - 16px);
  margin-inline: auto;
  position: relative;
  z-index: 1;
  overflow: visible;
}

.assets-balance__card-shapes {
  grid-column: 1 / -1;
  grid-row: 1;
  height: 100px;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
}

.assets-balance__card-bg-purple {
  display: block;
  width: 100%;
  height: 107px;
}

.assets-balance__card-content {
  grid-column: 1;
  grid-row: 1;
  z-index: 1;
  align-self: end;
  width: fit-content;
  max-width: none;
  padding: 0 0 51px 22px;
}

.assets-balance__amount-line {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 6px 8px;
  width: fit-content;
  max-width: none;
}

.assets-balance__icon-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 4px;
}

.assets-balance__refresh-btn,
.assets-balance__eye-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1;
}

.assets-balance__inline-icon {
  display: block;
  width: 12px;
  height: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);

  :deep(.icon) {
    width: 12px;
    height: 12px;
  }
}

.assets-balance__amount {
  font-family: 'PingFang SC', sans-serif;
  font-size: 25px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
  white-space: nowrap;
  flex-shrink: 0;
}

.assets-balance__unit {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #fff;
  white-space: nowrap;
  flex-shrink: 0;
}

.assets-balance__wallet-wrap {
  grid-column: 2;
  grid-row: 1;
  align-self: start;
  justify-self: end;
  position: relative;
  z-index: 2;
  width: 114px;
  height: 114px;
  margin-top: 13px;
  margin-right: 9px;
  pointer-events: none;
}

.assets-balance__wallet {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center top;
}

.assets-balance__panel {
  grid-column: 1 / -1;
  grid-row: 2;
  position: relative;
  z-index: 3;
  width: 100%;
  height: 66px;
  margin-top: -25px;
  padding: 9px 0 9px;
  overflow: visible;
}

.assets-balance__panel-shape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  display: block;
  pointer-events: none;
  overflow: visible;
}

.assets-balance__actions {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  height: 49px;
  padding-inline: 12px;
  align-items: start;
}

.assets-balance__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #fff;

  span:last-child {
    font-family: 'Roboto', sans-serif;
    font-size: 12px;
    line-height: 1.42;
    color: #fff;
    white-space: nowrap;
  }
}

.assets-balance__action-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
