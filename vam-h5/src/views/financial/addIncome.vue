<template>
  <div class="add-income-page">
    <DarkHeaderBar
      :title="_t18('value_added _income')"
      bg-color="#010e1a"
      :border_bottom="false"
    />
    <div class="add-income-body">
      <div v-if="listArray.length > 0 && !isShow" class="funList">
        <ItemFund v-for="item in listArray" :key="item.id" :itemObj="item" />
      </div>
      <div v-else-if="listArray.length === 0 && isShow" class="add-income-panel add-income-panel--empty">
        <Nodata />
      </div>
    </div>
  </div>
</template>
<script setup>
import ItemFund from './components/itemFund.vue'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import { onMounted, ref } from 'vue'
import { getFinancial } from '@/api/financial/index'
import { _t18 } from '@/utils/public'

const listArray = ref([])
const isShow = ref(false)
const getInit = async () => {
  try {
    const data = {
      classify: '2'
    }
    const res = await getFinancial(data)
    if (res.code === 200) {
      listArray.value = res.rows
      listArray.value.length === 0 ? (isShow.value = true) : (isShow.value = false)
    }
  } catch (error) {}
}
onMounted(() => {
  getInit()
})
</script>
<style lang="scss" scoped>
.add-income-page {
  min-height: 100vh;
  background: #010e1a;
  box-sizing: border-box;
}

.add-income-body {
  background: #f6f7fa;
  border-radius: 16px 16px 0 0;
  min-height: calc(100vh - 60px);
  padding: 12px 0 calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  box-shadow: 0 -8px 32px rgba(5, 16, 26, 0.12);
}

.funList {
  padding: 0 15px;
}

.add-income-panel {
  margin: 0 15px;
  padding: 16px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(1, 14, 26, 0.06);
  box-sizing: border-box;
  min-height: 200px;
}

.add-income-panel--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}
</style>
