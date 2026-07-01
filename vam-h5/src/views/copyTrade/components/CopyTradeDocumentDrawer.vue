<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :overlay-style="{ background: 'rgba(0,0,0,0.6)' }"
    :style="{ height: '78vh' }"
    @update:show="emit('update:show', $event)"
  >
    <div class="doc-drawer">
      <div class="doc-drawer__head">
        <h3 class="doc-drawer__title">{{ title }}</h3>
        <button type="button" class="doc-drawer__close" aria-label="close" @click="close">
          ×
        </button>
      </div>
      <div class="doc-drawer__body">
        <div v-if="content" class="doc-drawer__content" v-html="content"></div>
        <p v-else class="doc-drawer__empty">{{ _t18('no_data') }}</p>
      </div>
      <div class="doc-drawer__foot">
        <button type="button" class="doc-drawer__btn" @click="close">
          {{ _t18('btnConfirm') }}
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { _t18 } from '@/utils/public'

const props = defineProps({
  show: { type: Boolean, default: false },
  doc: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:show'])

const i18n = useI18n()

const title = computed(() => props.doc?.title || '')
const content = computed(() => props.doc?.content || '')

function close() {
  emit('update:show', false)
}
</script>

<style lang="scss" scoped>
@use '../styles/theme.scss' as ct;

:deep(.van-popup) {
  @include ct.ct-popup-sheet;
}

.doc-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ct.$ct-card-bg-alt;
  color: ct.$ct-text-primary;
}

.doc-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 15px 12px;
  border-bottom: 1px solid ct.$ct-divider;
  flex-shrink: 0;
}

.doc-drawer__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  line-height: 1.4;
}

.doc-drawer__close {
  border: none;
  background: none;
  font-size: 24px;
  line-height: 1;
  color: ct.$ct-text-muted;
  padding: 0 4px;
  cursor: pointer;
}

.doc-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 15px;
  -webkit-overflow-scrolling: touch;
}

.doc-drawer__content {
  font-size: 14px;
  color: #fff;
  line-height: 1.7;
  word-break: break-word;

  :deep(p) {
    margin: 0 0 12px;
    color: #fff;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 16px 0 8px;
    font-size: 15px;
    color: #fff;
  }
}

.doc-drawer__empty {
  margin: 0;
  text-align: center;
  color: ct.$ct-text-muted;
  font-size: 14px;
  padding: 40px 0;
}

.doc-drawer__foot {
  flex-shrink: 0;
  padding: 10px 15px calc(10px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid ct.$ct-divider;
}

.doc-drawer__btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 999px;
  @include ct.ct-btn-primary;
  font-size: 16px;
  font-weight: 600;
}
</style>
