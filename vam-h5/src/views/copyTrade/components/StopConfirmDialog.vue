<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :overlay-style="{ background: 'rgba(0,0,0,0.5)' }"
    @update:show="emit('update:show', $event)"
  >
    <div class="dialog-body">
      <div class="dialog-icon">
        <span>i</span>
      </div>
      <h3 class="dialog-title">{{ _t18('copy_trade_stop_confirm_title') }}</h3>
      <p class="dialog-desc">{{ _t18('copy_trade_stop_desc') }}</p>
      <div class="dialog-rows">
        <div v-for="row in rows" :key="row.label" class="dialog-row">
          <span>{{ row.label }}</span>
          <span class="ff-num" :class="row.cls">{{ row.value }}</span>
        </div>
      </div>
      <div class="dialog-actions">
        <button type="button" class="btn-cancel" @click="emit('update:show', false)">
          {{ _t18('cancel') }}
        </button>
        <button type="button" class="btn-confirm" :disabled="loading" @click="emit('confirm')">
          {{ _t18('copy_trade_confirm_stop') }}
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { _t18 } from '@/utils/public'

defineProps({
  show: { type: Boolean, default: false },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'confirm'])
</script>

<style lang="scss" scoped>
$green: #17ac74;

.dialog-body {
  padding: 28px 20px calc(24px + env(safe-area-inset-bottom, 0));
  text-align: center;
}
.dialog-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: $green;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 700;
  font-style: italic;
  color: #fff;
  box-shadow: 0 6px 20px rgba(23, 172, 116, 0.4);
}
.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px;
}
.dialog-desc {
  font-size: 13px;
  color: #888;
  line-height: 1.6;
  margin: 0 0 20px;
}
.dialog-rows {
  text-align: left;
  margin-bottom: 24px;
  border-top: 1px solid #f5f5f5;
}
.dialog-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
  span:first-child { color: #888; }
  .is-up { color: $green; }
  .is-down { color: #e8503a; }
}
.dialog-actions {
  display: flex;
  gap: 12px;
}
.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 48px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  border: none;
}
.btn-cancel {
  background: #fff;
  border: 1px solid #ddd;
  color: #333;
}
.btn-confirm {
  background: $green;
  color: #fff;
  box-shadow: 0 4px 12px rgba(23, 172, 116, 0.35);
  &:disabled { opacity: 0.6; }
}
</style>
