<template>
  <van-popup
    :show="show"
    round
    class="inst-sub-popup"
    :close-on-click-overlay="false"
    @update:show="emit('update:show', $event)"
    @open="onOpen"
  >
    <div class="sub-dialog">
      <div class="sub-dialog__avatar-wrap">
        <img
          v-if="item.logo"
          :src="item.logo"
          class="sub-dialog__avatar"
          alt=""
          @error="onLogoError"
        />
        <div v-else class="sub-dialog__avatar sub-dialog__avatar--ph" />
      </div>
      <h3 class="sub-dialog__title">{{ item.institutionName || item.title || '--' }}</h3>
      <p class="sub-dialog__hint">{{ _t18('copy_trade_inst_sub_modal_hint') }}</p>

      <input
        v-model="secretKey"
        type="text"
        class="sub-dialog__input"
        :placeholder="_t18('copy_trade_inst_secret_placeholder')"
        :disabled="locked"
        autocomplete="off"
        autocapitalize="off"
      />

      <p class="sub-dialog__warn">{{ _t18('copy_trade_inst_secret_lock_warn') }}</p>
      <p v-if="locked" class="sub-dialog__locked">{{ _t18('copy_trade_inst_locked') }}</p>

      <div class="sub-dialog__actions">
        <button
          type="button"
          class="sub-dialog__btn sub-dialog__btn--primary"
          :disabled="loading || locked"
          @click="handleConfirm"
        >
          {{ _t18('copy_trade_inst_subscribe') }}
        </button>
        <button
          type="button"
          class="sub-dialog__btn sub-dialog__btn--ghost"
          :disabled="loading"
          @click="emit('update:show', false)"
        >
          {{ _t18('cancel') }}
        </button>
      </div>

      <p class="sub-dialog__footer">{{ _t18('copy_trade_inst_secret_footer') }}</p>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { _t18 } from '@/utils/public'
import { institutionRowId, isInstitutionSecretLocked } from '../utils'
import { showToast } from 'vant'

const props = defineProps({
  show: { type: Boolean, default: false },
  item: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'confirm'])

const i18n = useI18n()
const t18 = (key, platform = []) => _t18(key, platform, i18n)

const secretKey = ref('')

const locked = computed(() => {
  const id = institutionRowId(props.item)
  return id ? isInstitutionSecretLocked(id) : false
})

function onOpen() {
  secretKey.value = ''
}

function onLogoError(e) {
  if (e?.target) e.target.style.display = 'none'
}

function handleConfirm() {
  const key = String(secretKey.value ?? '').trim()
  if (!key) {
    showToast(t18('copy_trade_inst_secret_required'))
    return
  }
  if (locked.value) {
    showToast(t18('copy_trade_inst_locked'))
    return
  }
  emit('confirm', { institutionId: institutionRowId(props.item), secretKey: key })
}

watch(
  () => props.show,
  (v) => {
    if (!v) secretKey.value = ''
  }
)
</script>

<style lang="scss" scoped>
$green: #17ac74;

:deep(.inst-sub-popup) {
  width: calc(100% - 48px);
  max-width: 340px;
  border-radius: 16px;
}

.sub-dialog {
  padding: 28px 20px 20px;
  text-align: center;

  &__avatar-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 14px;
  }

  &__avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;

    &--ph {
      background: linear-gradient(135deg, #edf8f2, #d9f1e4);
    }
  }

  &__title {
    margin: 0 0 12px;
    font-size: 18px;
    font-weight: 700;
    color: #111;
    line-height: 1.3;
  }

  &__hint {
    margin: 0 0 16px;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.5;
    text-align: left;
  }

  &__input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 15px;
    background: #fafafa;
    margin-bottom: 10px;

    &:disabled {
      opacity: 0.6;
      background: #f3f4f6;
    }
  }

  &__warn {
    margin: 0 0 8px;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.45;
    text-align: left;
  }

  &__locked {
    margin: 0 0 12px;
    font-size: 12px;
    color: #dc2626;
    text-align: left;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 16px;
  }

  &__btn {
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    border: 1px solid transparent;

    &--primary {
      background: $green;
      color: #fff;

      &:disabled {
        opacity: 0.55;
      }
    }

    &--ghost {
      background: #fff;
      color: #111;
      border-color: #d1d5db;
    }
  }

  &__footer {
    margin: 16px 0 0;
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.45;
  }
}
</style>
