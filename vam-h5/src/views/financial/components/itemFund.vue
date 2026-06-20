<template>
  <article class="earn-card">
    <div class="earn-card__hero">
      <div class="earn-card__top">
        <div class="earn-card__coin">
          <span class="earn-card__coin-icon">
            <img
              :src="fundIconSrc"
              alt=""
              loading="lazy"
              decoding="async"
              @error="onFundIconError"
            />
          </span>
          <span class="earn-card__symbol">{{ itemObj.title }}</span>
          <span
            v-if="itemObj.classify !== '0' && itemObj.classify !== '2'"
            class="earn-card__vip fw-num"
          >
            VIP{{ itemObj.level }}
          </span>
        </div>
        <div class="earn-card__progress">
          <span class="earn-card__progress-text">
            {{ _t18('project_progress') }} {{ itemObj.process }}%
          </span>
          <div class="earn-card__progress-track">
            <div
              class="earn-card__progress-fill"
              :style="{ width: `${Math.min(100, Number(itemObj.process) || 0)}%` }"
            />
          </div>
        </div>
      </div>
      <div class="earn-card__yield">
        <img class="earn-card__yield-bg" :src="yieldBg" alt="" aria-hidden="true" />
        <span class="earn-card__rate fw-num">{{ itemObj.avgRate }}%</span>
      </div>
    </div>

    <div class="earn-card__stats">
      <div class="earn-card__stat">
        <span class="earn-card__stat-label">{{ _t18('starting-amount') }}</span>
        <span class="earn-card__stat-value fw-num">
          {{ itemObj.limitMin }} {{ itemObj.coin ? itemObj.coin.toUpperCase() : '' }}
        </span>
      </div>
      <div class="earn-card__stat">
        <span class="earn-card__stat-label">{{ _t18('Investment_Limit') }}</span>
        <span class="earn-card__stat-value fw-num">
          {{ itemObj.limitMax }} {{ itemObj.coin ? itemObj.coin.toUpperCase() : '' }}
        </span>
      </div>
      <div class="earn-card__stat">
        <span class="earn-card__stat-label">{{ _t18('Lock-up_days') }}</span>
        <span class="earn-card__stat-value fw-num">{{ itemObj.days }}</span>
      </div>
    </div>

    <button type="button" class="earn-card__cta" @click="$router.push(`/financialDetails/${itemObj.id}`)">
      {{ _t18('vote_now') }}
    </button>
  </article>
</template>

<script setup>
import { _t18 } from '@/utils/public'
import yieldBg from '@/assets/images/gxpex/earn/yield-bg.png'
import defaultFundIcon from '@/assets/images/Frame 981370.png'

const props = defineProps({
  itemObj: {
    type: Object,
    default: () => ({}),
  },
})

const fundIconSrc = ref(defaultFundIcon)

function remoteIconUrl(raw) {
  if (typeof raw !== 'string') return ''
  const u = raw.trim()
  return u.length ? u : ''
}

function syncFundIcon() {
  const remote = remoteIconUrl(props.itemObj?.icon)
  fundIconSrc.value = remote || defaultFundIcon
}

function onFundIconError() {
  fundIconSrc.value = defaultFundIcon
}

watch(
  () => [props.itemObj?.id, props.itemObj?.icon],
  () => {
    syncFundIcon()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.earn-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgb(34, 28, 49);
  border-radius: 12px;
}

.earn-card__hero {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.earn-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.earn-card__coin {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  min-height: 24px;
  padding: 0 8px 0 2px;
  border-radius: 12px;
  background: rgb(27, 27, 27);
  flex-shrink: 0;
}

.earn-card__coin-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
}

.earn-card__symbol {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
}

.earn-card__vip {
  flex-shrink: 0;
  padding: 1px 4px;
  font-size: 10px;
  color: #a041ed;
  background: rgba(160, 65, 237, 0.15);
  border-radius: 4px;
}

.earn-card__progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
  max-width: 127px;
}

.earn-card__progress-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  line-height: 1.42;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.earn-card__progress-track {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.earn-card__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  transition: width 0.25s ease;
}

.earn-card__yield {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  background: #000;
  overflow: hidden;
}

.earn-card__yield-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.45;
}

.earn-card__rate {
  position: relative;
  z-index: 1;
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.18;
  color: rgb(160, 65, 237);
}

.earn-card__stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.earn-card__stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 15px;
}

.earn-card__stat-label,
.earn-card__stat-value {
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.25;
  color: rgba(255, 255, 255, 0.85);
}

.earn-card__stat-value {
  color: #fff;
  text-align: right;
}

.earn-card__cta {
  width: 100%;
  min-height: 40px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(90deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  color: #fff;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:active {
    opacity: 0.92;
  }
}
</style>
