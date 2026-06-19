<!-- 首页 -->
<script setup>
import Header from './components/FrontPage/header.vue'
import HeaderDiff from './components/FrontPage/headerDiff.vue'
import Menu from './components/FrontPage/menu.vue'
import Footer from './components/FrontPage/footer.vue'
import { DIFF_HOME_BANNER } from '@/config/index'
import { useMainStore } from '@/store/index.js'
const mainStore = useMainStore()
onMounted(() => {
  mainStore.getSettingConfig()
})
</script>

<template>
  <div class="home-page-wrap">
    <!-- Figma 4 个紫色高斯光晕背景 -->
    <div class="bg-glow bg-glow--1"></div>
    <div class="bg-glow bg-glow--2"></div>
    <div class="bg-glow bg-glow--3"></div>
    <div class="bg-glow bg-glow--4"></div>
    <!-- <HeaderDiff v-if="DIFF_HOME_BANNER.includes(_getConfig('_APP_ENV'))"></HeaderDiff> -->
    <!-- <Header v-else></Header> -->
    <Header />
    <Menu></Menu>
    <Footer></Footer>
  </div>
</template>

<style lang="scss" scoped>
.home-page-wrap {
  position: relative;
  background: #111111;
  min-height: 100vh;
  overflow-x: hidden;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #a642ec 0%, #802bda 60%, transparent 100%);
  filter: blur(60px);
  opacity: 0.18;
  pointer-events: none;
  z-index: 0;

  &--1 { /* 顶部右 (Figma Ellipse 9432) */
    top: -80px;
    right: -60px;
    width: 280px;
    height: 280px;
  }
  &--2 { /* 顶部左 (Figma Ellipse 9431) */
    top: 80px;
    left: -90px;
    width: 260px;
    height: 260px;
  }
  &--3 { /* 中部右 (Figma Ellipse 9433) - 金刚区附近 */
    top: 343px;
    right: -116px;
    width: 260px;
    height: 260px;
  }
  &--4 { /* 中下 (Figma Ellipse 9434) - 活动/币种附近 */
    top: 624px;
    left: -116px;
    width: 240px;
    height: 240px;
  }
}
</style>
