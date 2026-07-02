<template>
  <div class="legal-doc-page">
    <header class="legal-doc-header">
      <button type="button" class="legal-doc-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="legal-doc-header__back-icon" />
      </button>
      <h1 class="legal-doc-header__title">{{ title }}</h1>
    </header>

    <main class="legal-doc-main">
      <div v-if="content" class="legal-doc-content" v-html="content"></div>
      <Nodata v-else-if="loaded" />
    </main>
  </div>
</template>

<script setup>
import { _back } from '@/utils/public'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'

defineProps({
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  loaded: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.legal-doc-page {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

.legal-doc-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.legal-doc-header__back {
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
}

.legal-doc-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.legal-doc-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.legal-doc-main {
  padding: 16px 14px 0;
}

.legal-doc-content {
  padding: 18px 16px;
  background: rgba(30, 21, 48, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.7;
  word-break: break-word;

  :deep(p),
  :deep(span),
  :deep(div),
  :deep(li),
  :deep(td),
  :deep(th) {
    color: rgba(255, 255, 255, 0.85) !important;
    background-color: transparent !important;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 16px 0 8px;
    font-weight: 600;
    color: #fff !important;
    background-color: transparent !important;
  }

  :deep(h1) {
    font-size: 18px;
  }

  :deep(h2) {
    font-size: 16px;
  }

  :deep(h3),
  :deep(h4) {
    font-size: 15px;
  }

  :deep(p) {
    margin: 0 0 12px;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 12px;
    padding-left: 20px;
  }

  :deep(a) {
    color: rgb(160, 65, 237) !important;
    text-decoration: underline;
  }

  :deep(img) {
    display: block;
    width: 100%;
    max-width: 100%;
    margin: 12px 0;
    border-radius: 8px;
  }

  :deep(table) {
    width: 100%;
    margin: 12px 0;
    border-collapse: collapse;
  }

  :deep(td),
  :deep(th) {
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 8px;
  }
}
</style>
