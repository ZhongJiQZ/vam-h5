<template>
  <div class="page-language">
    <header class="lang-header">
      <button type="button" class="lang-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="lang-header__back-icon" />
      </button>
      <h1 class="lang-header__title">{{ _t18('sidebar_language') }}</h1>
    </header>

    <main class="lang-main">
      <ul class="lang-list">
        <li
          v-for="(item, index) in languageList"
          :key="index"
          class="lang-item"
          :class="{ 'lang-item--active': checked === index }"
          @click="setLanguage(item)"
        >
          <span class="lang-item__label">{{ item.remark }}</span>
          <span class="lang-item__radio" aria-hidden="true">
            <span v-if="checked === index" class="lang-item__radio-dot"></span>
          </span>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { _t18, _back } from '@/utils/public'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import { storageDict } from '@/config/dict'
import { useMainStore } from '@/store/index.js'

const mainStore = useMainStore()
const current = ref(localStorage.getItem(storageDict.LANGUAGE))

const setLanguage = (item) => {
  mainStore.setLanguage(item.dictValue)
  current.value = item.dictValue
}

const checked = computed(() => {
  let temp = 0
  mainStore.languageList.forEach((item, index) => {
    if (item.dictValue == current.value) {
      temp = index
    }
  })
  return temp
})

const languageList = computed(() => mainStore.languageList)
</script>

<style lang="scss" scoped>
.page-language {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

/* GXPEX 同款顶栏 */
.lang-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.lang-header__back {
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

.lang-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.lang-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

/* Body */
.lang-main {
  padding: 16px 14px 0;
}

/* 语言列表 — 一卡内多行，行间分隔 */
.lang-list {
  list-style: none;
  margin: 0;
  padding: 4px 18px;
  background: rgba(30, 21, 48, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.lang-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.18s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    opacity: 0.7;
  }
}

.lang-item__label {
  flex: 1;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.85);
}

.lang-item--active .lang-item__label {
  color: #fff;
  font-weight: 500;
}

/* 自定义 radio — 圆环 + 选中紫色实心点 */
.lang-item__radio {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.18s ease;
}

.lang-item--active .lang-item__radio {
  border-color: rgb(160, 65, 237);
}

.lang-item__radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(160, 65, 237);
  box-shadow: 0 0 8px rgba(160, 65, 237, 0.5);
}
</style>
