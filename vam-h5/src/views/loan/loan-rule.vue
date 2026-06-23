<script setup>
import { ref, onMounted } from 'vue'
import { _t18, _back } from '@/utils/public'
import { dispatchCustomEvent } from '@/utils'
import { rulesList } from '@/api/common/index'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const currentHtml = ref('')

onMounted(async () => {
  try {
    const res = await rulesList('LOANS_RULE')
    if (res.code === 200) {
      currentHtml.value = res.data[0]?.content || ''
    }
  } catch (error) {
    void error
  }
})

const goService = () => dispatchCustomEvent('event_serviceChange')
</script>

<template>
  <div class="loan-rule-page">
    <header class="loan-rule-header">
      <button type="button" class="loan-rule-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="loan-rule-header__back-icon" />
      </button>
      <h1 class="loan-rule-header__title">{{ _t18('loan_rule') }}</h1>
      <button
        type="button"
        class="loan-rule-header__service"
        aria-label="service"
        @click="goService"
      >
        <img :src="iconService" alt="" />
      </button>
    </header>

    <main class="loan-rule-body">
      <section class="loan-rule-panel">
        <div v-if="currentHtml" class="loan-rule-html" v-html="currentHtml" />
        <div v-else class="loan-rule-empty">
          <img :src="iconEmpty" alt="" class="loan-rule-empty__icon" />
          <p class="loan-rule-empty__text">{{ _t18('no_data') }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.loan-rule-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 140px 140px at -5% 35%, rgba(128, 43, 218, 0.55), transparent 70%),
    radial-gradient(ellipse 160px 160px at 105% 15%, rgba(128, 43, 218, 0.45), transparent 70%),
    radial-gradient(ellipse 130px 130px at 90% 75%, rgba(128, 43, 218, 0.35), transparent 70%),
    #111111;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

.loan-rule-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.loan-rule-header__back,
.loan-rule-header__service {
  position: absolute;
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

.loan-rule-header__back {
  left: 12px;
}

.loan-rule-header__service {
  right: 12px;

  img {
    display: block;
    width: 20px;
    height: 20px;
    object-fit: contain;
    opacity: 0.85;
  }
}

.loan-rule-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.loan-rule-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.loan-rule-body {
  padding: 12px 15px 0;
  box-sizing: border-box;
}

.loan-rule-panel {
  padding: 18px 16px;
  background: rgb(34, 28, 49);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-sizing: border-box;
  min-height: 200px;
}

.loan-rule-html {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  word-wrap: break-word;

  :deep(img) {
    max-width: 100%;
    height: auto;
    vertical-align: middle;
    border-radius: 8px;
  }

  :deep(p) {
    margin: 0 0 12px;
    color: rgba(255, 255, 255, 0.85);
  }

  :deep(p:last-child) {
    margin-bottom: 0;
  }

  :deep(strong),
  :deep(b) {
    font-weight: 600;
    color: #fff;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    color: #fff;
    margin: 16px 0 10px;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 12px;
    padding-left: 22px;
    color: rgba(255, 255, 255, 0.85);
  }

  :deep(li) {
    margin-bottom: 6px;
  }

  :deep(a) {
    color: rgb(196, 124, 255);
    text-decoration: none;
  }

  :deep(blockquote) {
    margin: 0 0 12px;
    padding: 10px 14px;
    border-left: 3px solid rgba(160, 65, 237, 0.6);
    background: rgba(160, 65, 237, 0.08);
    border-radius: 0 8px 8px 0;
    color: rgba(255, 255, 255, 0.78);
  }

  :deep(code) {
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
    color: rgb(196, 124, 255);
    font-size: 13px;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 12px;
  }

  :deep(th),
  :deep(td) {
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 8px 10px;
    text-align: left;
    color: rgba(255, 255, 255, 0.85);
  }

  :deep(th) {
    background: rgba(255, 255, 255, 0.04);
    color: #fff;
    font-weight: 600;
  }
}

.loan-rule-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0 24px;
}

.loan-rule-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.loan-rule-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
