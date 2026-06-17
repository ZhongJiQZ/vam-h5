<template>
  <van-popup
    :show="show"
    round
    position="bottom"
    @update:show="emit('update:show', $event)"
  >
    <div class="popup-explain">
      <div class="popup-explain__header">
        <span>{{ _t18('copy_trade_intro_doc_title') }}</span>
        <van-icon name="close" size="24" @click="emit('update:show', false)" />
      </div>
      <h3 class="popup-explain__title">{{ _t18('copy_trade_mask_explain_title') }}</h3>
      <p class="popup-explain__intro">{{ _t18('copy_trade_mask_explain_intro') }}</p>
      <div class="popup-explain__section">
        <h4 class="popup-explain__subtitle">{{ _t18('copy_trade_mask_explain_s1_title') }}</h4>
        <p>{{ _t18('copy_trade_mask_explain_s1_content') }}</p>
      </div>
      <div class="popup-explain__section">
        <h4 class="popup-explain__subtitle">{{ _t18('copy_trade_mask_explain_s2_title') }}</h4>
        <p>{{ _t18('copy_trade_mask_explain_s2_content') }}</p>
      </div>
      <div class="popup-explain__section">
        <h4 class="popup-explain__subtitle">{{ _t18('copy_trade_mask_explain_s3_title') }}</h4>
        <p>{{ _t18('copy_trade_mask_explain_s3_content') }}</p>
      </div>
      <div class="popup-explain__section popup-explain__section--conclusion">
        <h4 class="popup-explain__subtitle">{{ _t18('copy_trade_mask_explain_conclusion_title') }}</h4>
        <p>{{ _t18('copy_trade_mask_explain_conclusion_content') }}</p>
      </div>
      <button type="button" class="popup-explain__btn" @click="emit('update:show', false)">
        {{ _t18('copy_trade_explain_got_it') }}
      </button>
    </div>
  </van-popup>
</template>

<script setup>
import { _t18 } from '@/utils/public'

defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show'])
</script>

<style lang="scss" scoped>
.popup-explain {
  max-height: 70vh;
  padding: 48px 16px 24px;
  overflow-y: auto;
  color: #374151;
  font-size: 13px;
  line-height: 1.6;
  position: relative;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &__header {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 16px 16px 12px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f1f1;
    box-sizing: border-box;

    span {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }
  }

  &__title {
    margin: 6px 0 12px;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.5;
    color: #111827;
  }

  &__intro {
    margin: 0 0 14px;
    color: #4b5563;
  }

  &__section {
    margin-bottom: 14px;

    &--conclusion {
      margin-bottom: 16px;
    }

    p {
      margin: 0;
      color: #4b5563;
    }
  }

  &__subtitle {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
    color: #111827;
  }

  &__btn {
    width: 100%;
    height: 44px;
    border: none;
    border-radius: 8px;
    background: #16a34a;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
