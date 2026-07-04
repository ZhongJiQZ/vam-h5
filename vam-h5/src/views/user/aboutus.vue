<template>
  <div class="au-page">
    <header class="au-header">
      <button type="button" class="au-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="au-header__back-icon" />
      </button>
      <h1 class="au-header__title">{{ _t18('sidebar_aboutUS') }}</h1>
    </header>

    <div v-if="currentHtml" class="au-content" v-html="currentHtml"></div>

    <div v-else class="au-empty">
      <img :src="iconEmpty" alt="" class="au-empty__icon" />
      <p class="au-empty__text">{{ _t18('no_data') }}</p>
    </div>
  </div>
</template>

<script setup>
import { rulesList } from '@/api/common/index'
import { _t18, _back } from '@/utils/public'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const currentHtml = ref(null)
onMounted(async () => {
  try {
    const res = await rulesList('BRIEF_EXPLAIN')
    if (res.code === 200) {
      currentHtml.value = res.data[0].content
    }
  } catch (error) {}
})
</script>

<style scoped>
.au-page {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

.au-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 14px;
}
.au-header__back {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}
.au-header__back-icon {
  width: 20px;
  height: 20px;
  display: block;
}
.au-header__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  line-height: 1;
}

.au-content {
  margin: 8px 14px 0;
  padding: 16px;
  background: #1a1626;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.78);
  word-wrap: break-word;
}
.au-content :deep(*) {
  color: rgba(255, 255, 255, 0.78) !important;
  background: transparent !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.au-content :deep(h1),
.au-content :deep(h2),
.au-content :deep(h3),
.au-content :deep(h4),
.au-content :deep(strong),
.au-content :deep(b) {
  color: #fff !important;
}
.au-content :deep(a) {
  color: rgb(196, 124, 255) !important;
}
.au-content :deep(img) {
  width: 100%;
  border-radius: 8px;
  margin: 8px 0;
}
.au-content :deep(p) {
  margin: 0 0 12px;
}
.au-content :deep(p:last-child) {
  margin-bottom: 0;
}

.au-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}
.au-empty__icon {
  width: 120px;
  height: auto;
  margin-bottom: 12px;
  display: block;
}
.au-empty__text {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
