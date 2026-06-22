<template>
  <div class="help-detail-page">
    <header class="hd-header">
      <button type="button" class="hd-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="hd-header__back-icon" />
      </button>
      <h1 class="hd-header__title">{{ _t18(`help_center`) }}</h1>
    </header>

    <div class="help-detail-body">
      <div class="help-detail-panel">
        <div v-if="questionDetail.question" class="help-detail-head">
          <div class="title">{{ questionDetail.question }}</div>
          <div v-if="questionDetail.createTime" class="time">{{ questionDetail.createTime }}</div>
        </div>
        <div v-if="currentHtml" class="item-detail-html" v-html="currentHtml"></div>
        <div v-else class="help-detail-empty">
          <img :src="iconEmpty" alt="" class="help-detail-empty__icon" />
          <p class="help-detail-empty__text">{{ _t18('no_data') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { _t18, _back } from '@/utils/public'
import { getHelpcenterDetail } from '@/api/help/index'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const Route = useRoute()
const currentHtml = ref('')
const questionDetail = ref({})
onMounted(async () => {
  if (Route.params.id) {
    try {
      const res = await getHelpcenterDetail(Route.params.id)
      if (res.code === 200) {
        questionDetail.value = res.data
        currentHtml.value = res.data.content
      }
    } catch (error) {}
  }
})
</script>
<style lang="scss" scoped>
.help-detail-page {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

.hd-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.hd-header__back {
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

.hd-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.hd-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.help-detail-body {
  min-height: calc(100vh - 60px);
  padding: 12px 15px 0;
  box-sizing: border-box;
}

.help-detail-panel {
  padding: 18px 16px;
  background: rgba(30, 21, 48, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-sizing: border-box;
  min-height: 200px;
}

.help-detail-head {
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
}

.time {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

.item-detail-html {
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

.help-detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0 24px;
}

.help-detail-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.help-detail-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
