<script setup>
import { computed, ref, watch } from 'vue'
import { _t18, _getConfig } from '@/utils/public'
import iconUsdt from '@/assets/images/gxpex/staking/icon-usdt.svg'
import cardArt from '@/assets/images/gxpex/staking/card-art.png'

const props = defineProps({
  cardData: {
    type: Object
  }
})

const emit = defineEmits(['buy'])

const dataValue = computed(() => props.cardData || {})
const listIconSrc = ref(iconUsdt)

function remoteIconUrl(raw) {
  if (typeof raw !== 'string') return ''
  const u = raw.trim()
  return u.length ? u : ''
}

function syncListIcon() {
  const remote = remoteIconUrl(props.cardData?.icon)
  listIconSrc.value = remote || iconUsdt
}

function onListIconError() {
  listIconSrc.value = iconUsdt
}

watch(
  () => [props.cardData?.id, props.cardData?.icon],
  () => {
    syncListIcon()
  },
  { immediate: true }
)

const availableText = computed(() => {
  if (['dev'].includes(_getConfig('_APP_ENV'))) {
    return `${dataValue.value.buyPurchase}/${dataValue.value.timeLimit}`
  }
  return `${dataValue.value.timeLimit ?? 0}`
})

const onBuy = () => {
  emit('buy')
}
</script>

<template>
  <article class="staking-card" @click="onBuy">
    <div class="staking-card__head">
      <div class="staking-card__coin">
        <img :src="listIconSrc" alt="" class="staking-card__coin-icon" @error="onListIconError" />
        <span class="staking-card__symbol">{{ dataValue.title || 'USDT' }}</span>
      </div>
      <button type="button" class="staking-card__buy" @click.stop="onBuy">
        {{ _t18('pledge_Buy', ['aams']) }}
      </button>
    </div>
    <div class="staking-card__body">
      <img class="staking-card__art" :src="cardArt" alt="" aria-hidden="true" />
      <div class="staking-card__stats">
        <div class="staking-card__stat">
          <span class="staking-card__stat-label">{{ _t18('pledge_quota') }}</span>
          <span class="staking-card__stat-value">{{ dataValue.limitMin }}~{{ dataValue.limitMax }}</span>
        </div>
        <div class="staking-card__stat">
          <span class="staking-card__stat-label">{{ _t18('pledge_number_days') }}</span>
          <span class="staking-card__stat-value">{{ dataValue.days }}</span>
        </div>
        <div class="staking-card__stat">
          <span class="staking-card__stat-label">{{ _t18('pledge_available_purchase', ['aams']) }}</span>
          <span class="staking-card__stat-value">{{ availableText }}</span>
        </div>
        <div class="staking-card__stat">
          <span class="staking-card__stat-label">{{ _t18('pledge_rate_return') }}</span>
          <span class="staking-card__stat-value staking-card__stat-value--accent">
            {{ dataValue.minOdds }}%~{{ dataValue.maxOdds }}%
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.staking-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
  cursor: pointer;
}

.staking-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 32px;
}

.staking-card__coin {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.staking-card__coin-icon {
  width: 24px;
  height: 24px;
  display: block;
  flex-shrink: 0;
  object-fit: contain;
  border-radius: 50%;
}

.staking-card__symbol {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
}

.staking-card__buy {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 47px;
  height: 24px;
  padding: 0 10px;
  border: none;
  border-radius: 999px;
  background: rgb(160, 65, 237);
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  cursor: pointer;
}

.staking-card__body {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.staking-card__art {
  flex-shrink: 0;
  width: 75px;
  height: 75px;
  object-fit: contain;
}

.staking-card__stats {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.staking-card__stat {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.staking-card__stat-label {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.65);
}

.staking-card__stat-value {
  font-family: 'Roboto', sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  color: #fff;
  text-align: right;
}

.staking-card__stat-value--accent {
  color: rgb(160, 65, 237);
}
</style>
