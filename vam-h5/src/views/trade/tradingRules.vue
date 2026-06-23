<!-- 交易规则 -->
<template>
  <div class="trading-rules-page">
    <header class="trading-rules-header">
      <button type="button" class="trading-rules-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="trading-rules-header__back-icon" />
      </button>
      <h1 class="trading-rules-header__title">{{ currentName }}</h1>
    </header>

    <main class="trading-rules-body">
      <section class="trading-rules-panel">
        <div v-if="currentHtml" class="trading-rules-html" v-html="currentHtml" />
        <div v-else class="trading-rules-empty">
          <img :src="iconEmpty" alt="" class="trading-rules-empty__icon" />
          <p class="trading-rules-empty__text">{{ _t18('no_data') }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { rulesList } from '@/api/common/index'
import { _t18, _back } from '@/utils/public'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const route = useRoute()

const currentName2 = computed(() => {
  switch (Number(route.query.type)) {
    case 0:
      return _t18('Second_Contract_Rules')
    case 1:
      return _t18('Currency_Trading_Rules')
    case 2:
      return _t18('Ustandard_contract_rules')
    default:
      return _t18('Second_Contract_Rules')
  }
})

const currentName = ref(currentName2.value)
const currentHtml = ref('')

const getList = async (type) => {
  try {
    const res = await rulesList(type)
    if (res.code === 200) {
      currentHtml.value = res.data?.[0]?.content || ''
      currentName.value = res.data?.[0]?.title || currentName2.value
    }
  } catch (error) {
    void error
  }
}

onMounted(() => {
  switch (Number(route.query.type)) {
    case 0:
      getList('PERIOD_EXPLAIN')
      break
    case 1:
      getList('COIN_EXPLAIN')
      break
    case 2:
      getList('U_STANDARD_EXPLAIN')
      break
    default:
      getList('PERIOD_EXPLAIN')
      break
  }
})
</script>

<style lang="scss" scoped>
.trading-rules-page {
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

.trading-rules-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.trading-rules-header__back {
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

.trading-rules-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.trading-rules-header__title {
  margin: 0;
  max-width: calc(100% - 96px);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
  word-break: break-word;
}

.trading-rules-body {
  padding: 12px 15px 0;
  box-sizing: border-box;
}

.trading-rules-panel {
  padding: 18px 16px;
  background: rgb(34, 28, 49);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-sizing: border-box;
  min-height: 200px;
}

.trading-rules-html {
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

.trading-rules-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0 24px;
}

.trading-rules-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.trading-rules-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
