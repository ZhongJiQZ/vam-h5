<template>
  <div class="term-service-page">
    <DarkHeaderBar
      :title="_t18(`sidebar_termsService`)"
      bg-color="#010e1a"
      :border_bottom="false"
      right="service"
    />
    <div class="term-service-body">
      <div class="term-service-panel">
        <div v-if="currentHtml" class="item-detail-html" v-html="currentHtml"></div>
        <Nodata v-else />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { _t18 } from '@/utils/public'
import { rulesList } from '@/api/common/index'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'

const currentHtml = ref(null)
onMounted(async () => {
  try {
    const res = await rulesList('TERMS_CLAUSE')
    if (res.code === 200) {
      currentHtml.value = res.data[0].content
    }
  } catch (error) {}
})
</script>
<style lang="scss" scoped>
.term-service-page {
  min-height: 100vh;
  background: #010e1a;
  box-sizing: border-box;
}

.term-service-body {
  background: #f6f7fa;
  border-radius: 16px 16px 0 0;
  min-height: calc(100vh - 60px);
  padding: 12px 0 calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  box-shadow: 0 -8px 32px rgba(5, 16, 26, 0.12);
}

.term-service-panel {
  margin: 0 15px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(1, 14, 26, 0.06);
  box-sizing: border-box;
  min-height: 200px;
}

.item-detail-html {
  font-size: 13px;
  line-height: 1.65;
  color: #2a2f36;
  word-wrap: break-word;

  :deep(img) {
    max-width: 100%;
    height: auto;
    vertical-align: middle;
  }

  :deep(p) {
    margin: 0 0 12px;
  }

  :deep(p:last-child) {
    margin-bottom: 0;
  }
}
</style>
