<template>
  <div class="fa-page">
    <header class="fa-header">
      <button type="button" class="fa-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="fa-header__back-icon" />
      </button>
      <h1 class="fa-header__title">{{ _t18('financial agreement') }}</h1>
    </header>

    <main class="fa-main">
      <section class="card">
        <div v-if="currentHtml" class="item-detail-html" v-html="currentHtml"></div>
        <div v-else class="fa-empty">
          <img :src="iconEmpty" alt="" class="fa-empty__icon" />
          <p class="fa-empty__text">{{ _t18('no_data') }}</p>
        </div>
      </section>
    </main>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { rulesList } from '@/api/common/index'
import { _t18, _back } from '@/utils/public'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const currentHtml = ref(null)
onMounted(async () => {
  try {
    const res = await rulesList('FINANCIAL_AGREEMENT')
    if (res.code === 200) {
      currentHtml.value = res.data[0].content
    }
  } catch (error) {
    void error
  }
})
</script>
<style lang="scss" scoped>
.fa-page {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏 */
.fa-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.fa-header__back {
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

.fa-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.fa-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.fa-main {
  padding: 12px 0 0;
}

.card {
  background: #1a1626;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin: 0 14px 12px;
  padding: 16px;
  box-sizing: border-box;
  min-height: 200px;
}

/* 协议正文：服务端 HTML，强制覆色到亮色 */
.item-detail-html {
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.78);
  word-wrap: break-word;

  :deep(*) {
    color: rgba(255, 255, 255, 0.78) !important;
    background: transparent !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(strong),
  :deep(b) {
    color: #fff !important;
    font-weight: 600;
  }

  :deep(a) {
    color: rgb(196, 124, 255) !important;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    vertical-align: middle;
    border-radius: 8px;
    background: transparent !important;
  }

  :deep(p) {
    margin: 0 0 12px;
  }

  :deep(p:last-child) {
    margin-bottom: 0;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 20px;
    margin: 0 0 12px;
  }

  :deep(li) {
    margin-bottom: 6px;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 14px;
  }

  :deep(th),
  :deep(td) {
    padding: 6px 8px;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
  }
}

/* 空态 */
.fa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 0 12px;
}

.fa-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.fa-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
