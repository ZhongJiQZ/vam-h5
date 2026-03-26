<template>
  <div class="help-detail-page">
    <DarkHeaderBar
      :title="_t18(`help_center`)"
      bg-color="#010e1a"
      :border_bottom="false"
    />
    <div class="help-detail-body">
      <div class="help-detail-panel">
        <div v-if="questionDetail.question" class="help-detail-head">
          <div class="title">{{ questionDetail.question }}</div>
          <div v-if="questionDetail.createTime" class="time">{{ questionDetail.createTime }}</div>
        </div>
        <div v-if="currentHtml" class="item-detail-html" v-html="currentHtml"></div>
        <Nodata v-else />
      </div>
    </div>
  </div>
</template>
<script setup>
import { _t18 } from '@/utils/public'
import { getHelpcenterDetail } from '@/api/help/index'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'

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
  background: #010e1a;
  box-sizing: border-box;
}

.help-detail-body {
  background: #f6f7fa;
  border-radius: 16px 16px 0 0;
  min-height: calc(100vh - 60px);
  padding: 12px 0 calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  box-shadow: 0 -8px 32px rgba(5, 16, 26, 0.12);
}

.help-detail-panel {
  margin: 0 15px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(1, 14, 26, 0.06);
  box-sizing: border-box;
  min-height: 200px;
}

.help-detail-head {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(1, 14, 26, 0.06);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #2a2f36;
  line-height: 1.4;
}

.time {
  margin-top: 8px;
  font-size: 13px;
  color: #8b939e;
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

  :deep(strong) {
    font-weight: 600;
  }
}
</style>
