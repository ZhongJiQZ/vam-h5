<template>
  <header class="ct-header" :class="{ 'ct-header--border': borderBottom }">
    <button
      v-if="showBack"
      type="button"
      class="ct-header__back"
      aria-label="back"
      @click="onBack"
    >
      <img :src="iconBack" alt="" class="ct-header__back-icon" />
    </button>
    <h1 v-if="title" class="ct-header__title">{{ title }}</h1>
    <slot name="title" />
    <div class="ct-header__right">
      <slot name="right" />
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { _back } from '@/utils/public'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'

const router = useRouter()

const props = defineProps({
  title: { type: String, default: '' },
  backTo: { type: String, default: '' },
  backwardNum: { type: Number, default: -1 },
  showBack: { type: Boolean, default: true },
  borderBottom: { type: Boolean, default: false }
})

function onBack() {
  if (props.backTo) {
    router.push(props.backTo)
  } else if (props.backwardNum !== -1) {
    router.go(props.backwardNum)
  } else {
    _back()
  }
}
</script>

<style lang="scss" scoped>
.ct-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;

  &--border {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__back {
    position: absolute;
    left: 12px;
    top: calc(14px + env(safe-area-inset-top));
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  &__back-icon {
    display: block;
    width: 10px;
    height: 18px;
    object-fit: contain;
    opacity: 0.9;
  }

  &__title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.2;
    color: #fff;
    text-align: center;
  }

  &__right {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    margin-top: calc(env(safe-area-inset-top) / 2);
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
