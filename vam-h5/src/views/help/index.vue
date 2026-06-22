<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { _t18 } from '@/utils/public'
import { getHelpcenter } from '@/api/help/index'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconFaqQuestion from '@/assets/images/gxpex/help/icon-faq-question.svg'
import iconFaqInfo from '@/assets/images/gxpex/help/icon-faq-info.svg'
import iconFaqGuide from '@/assets/images/gxpex/help/icon-faq-guide.svg'
import iconChevronRight from '@/assets/images/gxpex/help/icon-chevron-right.svg'

const router = useRouter()
const list = ref([])
const isShow = ref(false)

function getFaqIcon(sectionIndex, itemIndex) {
  if (sectionIndex === 0) return iconFaqQuestion
  return itemIndex % 2 === 0 ? iconFaqInfo : iconFaqGuide
}

function isTallQuestion(question) {
  return String(question || '').length > 42
}

function goDetail(id) {
  router.push(`/helpDetail/${id}`)
}

onMounted(async () => {
  try {
    const res = await getHelpcenter()
    if (res.code === 200) {
      list.value = res.data
      isShow.value = list.value.length === 0
    }
  } catch (error) {}
})
</script>

<template>
  <div class="page page--help-center">
    <header class="help-header">
      <button type="button" class="help-header__back" aria-label="back" @click="router.back()">
        <img :src="iconBack" alt="" class="help-header__back-icon" />
      </button>
      <h1 class="help-header__title">{{ _t18('help_center') }}</h1>
    </header>

    <main class="help-main">
      <template v-if="list.length > 0">
        <section v-for="(section, sectionIndex) in list" :key="sectionIndex" class="help-section">
          <h2 class="help-section__title">{{ section.title }}</h2>
          <div v-if="section.infoList?.length" class="help-faq-list">
            <button
              v-for="(item, itemIndex) in section.infoList"
              :key="item.id ?? itemIndex"
              type="button"
              class="help-faq"
              :class="{ 'help-faq--tall': isTallQuestion(item.question) }"
              @click="goDetail(item.id)"
            >
              <span class="help-faq__lead">
                <img :src="getFaqIcon(sectionIndex, itemIndex)" alt="" class="help-faq__icon" />
              </span>
              <span class="help-faq__question">{{ item.question }}</span>
              <span class="help-faq__chevron" aria-hidden="true">
                <img :src="iconChevronRight" alt="" class="help-faq__chevron-icon" />
              </span>
            </button>
          </div>
        </section>
      </template>
      <div v-else-if="isShow" class="help-empty">
        <Nodata />
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.page--help-center {
  position: relative;
  min-height: 100vh;
  background: #111111;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.help-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.help-header__back {
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

.help-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.help-header__title {
  margin: 0;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.help-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 12px 0;
}

.help-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-section__title {
  margin: 0;
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
}

.help-faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-faq {
  display: grid;
  grid-template-columns: 20px 1fr 12px;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: rgb(34, 28, 49);
  text-align: left;
  cursor: pointer;
}

.help-faq--tall {
  align-items: flex-start;
  min-height: 63px;
}

.help-faq__lead {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.help-faq__icon {
  display: block;
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.help-faq__question {
  min-width: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  color: #fff;
}

.help-faq--tall .help-faq__question {
  padding-top: 2px;
}

.help-faq__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.help-faq--tall .help-faq__chevron {
  margin-top: 4px;
}

.help-faq__chevron-icon {
  display: block;
  width: 12px;
  height: 12px;
  object-fit: contain;
}

.help-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}
</style>
