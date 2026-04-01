<template>
  <div class="item">
    <div class="progress-line">
      <div class="progress-fill" :style="{ width: `${Math.min(100, Number(itemObj.process) || 0)}%` }" />
    </div>
    <div class="title-row">
      <div class="title-left">
        <span class="fund-icon-wrap" aria-hidden="true">
          <img
            :src="fundIconSrc"
            alt=""
            class="fund-icon"
            loading="lazy"
            decoding="async"
            @error="onFundIconError"
          />
        </span>
        <span class="title-text">{{ itemObj.title }}</span>
        <span
          v-if="itemObj.classify !== '0' && itemObj.classify !== '2'"
          class="vip-tag fw-num"
        >
          VIP{{ itemObj.level }}
        </span>
      </div>
      <div class="progress-badge">
        {{ _t18(`project_progress`) }} {{ itemObj.process }}%
      </div>
    </div>
    <div class="rate-banner" :style="{ backgroundImage: `url(${projectBg})` }">
      <div class="rate-value fw-num">{{ itemObj.avgRate }}%</div>
    </div>
    <div class="details">
      <div class="detail-row">
        <span class="label">{{ _t18(`starting-amount`) }}</span>
        <span class="value fw-num">
          {{ itemObj.limitMin }} {{ itemObj.coin ? itemObj.coin.toUpperCase() : '' }}
        </span>
      </div>
      <div class="detail-row">
        <span class="label">{{ _t18(`Investment_Limit`) }}</span>
        <span class="value fw-num">
          {{ itemObj.limitMax }} {{ itemObj.coin ? itemObj.coin.toUpperCase() : '' }}
        </span>
      </div>
      <div class="detail-row">
        <span class="label">{{ _t18(`Lock-up_days`) }}</span>
        <span class="value fw-num">{{ itemObj.days }}</span>
      </div>
    </div>
    <button
      type="button"
      class="btn-invest"
      @click="$router.push(`/financialDetails/${itemObj.id}`)"
    >
      {{ _t18(`vote_now`) }}
    </button>
  </div>
</template>
<script setup>
import { _t18 } from '@/utils/public'
import projectBg from '@/assets/images/financial/project-bg.png'
import defaultFundIcon from '@/assets/images/Frame 981370.png'

const props = defineProps({
  itemObj: {
    type: Object,
    default: () => ({})
  }
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
.item {
  background: #f6f7fa;
  border-radius: 14px;
  padding: 12px 0 14px;
  margin-bottom: 16px;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(1, 14, 26, 0.06);
}

.progress-line {
  height: 4px;
  margin: 0 14px;
  background: #e4e6eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #17ac74;
  border-radius: 999px;
  transition: width 0.25s ease;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 14px 0;
}

.title-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.fund-icon-wrap {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: #e8ebf0;
}

.fund-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
}

.title-text {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.35;
  word-break: break-word;
}

.vip-tag {
  flex-shrink: 0;
  padding: 2px 6px;
  font-size: 11px;
  color: #0d7a52;
  background: rgba(23, 172, 116, 0.12);
  border-radius: 4px;
}

.progress-badge {
  flex-shrink: 0;
  padding: 4px 10px;
  font-size: 12px;
  color: #0d7a52;
  background: rgba(23, 172, 116, 0.14);
  border-radius: 6px;
  white-space: nowrap;
}

.rate-banner {
  margin: 12px 14px 0;
  min-height: 112px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rate-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: #e85d75;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}

.details {
  padding: 14px 14px 4px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  color: #8b9099;
  flex-shrink: 0;
}

.value {
  color: #2a2f36;
  text-align: right;
  word-break: break-all;
}

.btn-invest {
  display: block;
  width: calc(100% - 28px);
  margin: 14px 14px 0;
  padding: 12px 16px;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  background: #010e1a;
  text-align: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  &:active {
    opacity: 0.92;
  }
}
</style>
