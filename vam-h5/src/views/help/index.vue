<template>
  <div class="help-page">
    <DarkHeaderBar
      :title="_t18(`help_center`)"
      bg-color="#010e1a"
      :border_bottom="false"
    />
    <div class="help-body">
      <div v-if="list.length > 0" class="help-panel">
        <div class="itemList" v-for="(item, index) in list" :key="index">
          <div class="title">
            <div class="title_top"></div>
            <div>{{ item.title }}</div>
          </div>
          <div v-if="item.infoList.length > 0">
            <div
              class="item"
              v-for="(items, indexs) in item.infoList"
              :key="indexs"
              @click="$router.push(`/helpDetail/${items.id}`)"
            >
              {{ items.question }}
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="isShow" class="help-panel help-panel--empty">
        <Nodata />
      </div>
    </div>
  </div>
</template>
<script setup>
import { _t18 } from '@/utils/public'
import { getHelpcenter } from '@/api/help/index'
import { onMounted, ref } from 'vue'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'

const list = ref([])
const isShow = ref(false)
onMounted(async () => {
  try {
    const res = await getHelpcenter()
    if (res.code === 200) {
      list.value = res.data
      list.value.length === 0 ? (isShow.value = true) : (isShow.value = false)
    }
  } catch (error) {}
})
</script>
<style lang="scss" scoped>
.help-page {
  min-height: 100vh;
  background: #010e1a;
  box-sizing: border-box;
}

.help-body {
  background: #f6f7fa;
  border-radius: 16px 16px 0 0;
  min-height: calc(100vh - 60px);
  padding: 12px 0 calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  box-shadow: 0 -8px 32px rgba(5, 16, 26, 0.12);
}

.help-panel {
  margin: 0 15px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(1, 14, 26, 0.06);
  box-sizing: border-box;
  min-height: 200px;
}

.help-panel--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}

.itemList {
  & + .itemList {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid rgba(1, 14, 26, 0.06);
  }

  .title {
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #2a2f36;
    font-weight: 600;

    .title_top {
      width: 3px;
      height: 12px;
      margin-right: 10px;
      border-radius: 2px;
      background: #010e1a;
      flex-shrink: 0;
    }
  }

  .item {
    margin-top: 16px;
    font-size: 14px;
    font-weight: 400;
    color: #2a2f36;
    line-height: 1.5;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
