<template>
  <van-dialog
    v-model:show="visible"
    :show-confirm-button="false"
    class="copy-stop-dialog"
    close-on-click-overlay
  >
    <div class="dialog-body">
      <div class="dialog-icon" :class="warnOpen ? 'dialog-icon--warn' : 'dialog-icon--info'">
        <span>i</span>
      </div>
      <h3 class="dialog-title">{{ titleText }}</h3>
      <p class="dialog-desc">{{ _t18('copy_trade_stop_desc') }}</p>
      <div class="dialog-rows">
        <div v-for="row in rows" :key="row.label" class="dialog-row">
          <span>{{ row.label }}</span>
          <span class="ff-num" :class="row.cls">{{ row.value }}</span>
        </div>
      </div>
      <div class="dialog-actions">
        <button type="button" class="btn-cancel" @click="visible = false">
          {{ _t18('cancel') }}
        </button>
        <button type="button" class="btn-confirm" :disabled="loading" @click="$emit('confirm')">
          {{ _t18('copy_trade_confirm_stop') }}
        </button>
      </div>
    </div>
  </van-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { _t18 } from '@/utils/public'

const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)

const props = defineProps({
  show: { type: Boolean, default: false },
  warnOpen: { type: Boolean, default: false },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'confirm'])

const visible = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v)
})

const titleText = computed(() =>
  props.warnOpen ? t18('copy_trade_stop_warn_title') : t18('copy_trade_stop_confirm_title')
)
</script>

<style lang="scss">
.copy-stop-dialog {
  border-radius: 16px;
  width: 320px;
}
</style>

<style lang="scss" scoped>
$green: #17ac74;

.dialog-body {
  padding: 24px 20px 20px;
  text-align: center;
}
.dialog-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  &--info {
    background: $green;
  }
  &--warn {
    background: #e8503a;
  }
}
.dialog-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 10px;
}
.dialog-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 16px;
  text-align: left;
}
.dialog-rows {
  text-align: left;
  margin-bottom: 20px;
}
.dialog-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
  .is-up {
    color: $green;
  }
  .is-down {
    color: #e8503a;
  }
}
.dialog-actions {
  display: flex;
  gap: 12px;
}
.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
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
  &:disabled {
    opacity: 0.6;
  }
}
</style>
