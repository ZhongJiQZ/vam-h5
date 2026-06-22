<template>
  <div class="add-income-page">
    <header class="ai-header">
      <button type="button" class="ai-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="ai-header__back-icon" />
      </button>
      <h1 class="ai-header__title">{{ _t18('value_added _income') }}</h1>
    </header>

    <main class="ai-main">
      <div v-if="listArray.length > 0" class="ai-list">
        <ItemFund v-for="item in listArray" :key="item.id" :itemObj="item" />
      </div>

      <div v-else-if="isShow" class="ai-empty">
        <img :src="iconEmpty" alt="" class="ai-empty__icon" />
        <p class="ai-empty__text">{{ _t18('no_data') }}</p>
      </div>
    </main>
  </div>
</template>
<script setup>
import ItemFund from './components/itemFund.vue'
import { onMounted, ref } from 'vue'
import { getFinancial } from '@/api/financial/index'
import { _t18, _back } from '@/utils/public'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const listArray = ref([])
const isShow = ref(false)

const getInit = async () => {
  try {
    const data = { classify: '2' }
    const res = await getFinancial(data)
    if (res.code === 200) {
      listArray.value = res.rows || []
    }
  } catch (error) {
    void error
  } finally {
    isShow.value = listArray.value.length === 0
  }
}

onMounted(() => {
  getInit()
})
</script>
<style lang="scss" scoped>
.add-income-page {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏 */
.ai-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.ai-header__back {
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

.ai-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.ai-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

/* Body */
.ai-main {
  padding: 14px 14px 0;
}

.ai-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 空态 */
.ai-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0 24px;
}

.ai-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.ai-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
