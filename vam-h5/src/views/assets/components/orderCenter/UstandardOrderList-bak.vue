<template>
  <!-- <div style="padding:10px;color:red;">
    UstandardOrderList rendered ✅
  </div> --> 
  <div class="orderBox">
    <van-tabs v-model:active="curActive" shrink color="transparent"
      title-active-color="#17AC74" title-inactive-color="#5d626d">
      <van-tab v-for="(t, i) in tabList" :key="i" :name="t.value" :title="t.label">
        <div style="padding:10px;">
          active={{ curActive }} , rows={{ dataNewList.length }}
        </div>

        <van-cell v-for="(row, idx) in dataNewList" :key="idx" :border="false">
          <pre style="white-space:pre-wrap;">{{ row }}</pre>
        </van-cell>
      </van-tab>
    </van-tabs>

    <div class="tab_right">
      <svg-load name="shuaxin" class="entrustRImg" @click="handelRefresh" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { orderList } from '@/api/trade/index'

const tabList = ref([
  { label: '当前委托', value: 1 },
  { label: '历史委托', value: 3 },
])
const curActive = ref(1)

const dataNewList = ref([])
const pageNum = ref(1)
const pageSize = ref(5)

const handelRefresh = async () => {
  const status = curActive.value === 1 ? 0 : 1
  const res = await orderList({ status, pageSize: pageSize.value, pageNum: pageNum.value })
  dataNewList.value = res?.rows || []
}

handelRefresh()
</script>

<style scoped lang="scss">
.orderBox { position: relative; }
.tab_right {
  position: absolute;
  top: 0;
  right: 0;
  padding: 15px 5px;
}
</style>
