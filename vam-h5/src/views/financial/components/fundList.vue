<template>
  <section v-if="listArray.length > 0 && !isShow" class="earn-list" :aria-label="_t18('financial')">
    <ItemFund v-for="item in listArray" :key="item.id" :itemObj="item" />
  </section>
  <Nodata v-if="listArray.length === 0 && isShow" />
</template>

<script setup>
import ItemFund from './itemFund.vue'
import { onMounted, ref } from 'vue'
import { getFinancial } from '@/api/financial/index'
import { _t18 } from '@/utils/public'

const listArray = ref([])
const isShow = ref(false)

const getInit = async () => {
  try {
    const res = await getFinancial({ classify: '' })
    if (res.code === 200) {
      listArray.value = res.rows
      isShow.value = listArray.value.length === 0
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  getInit()
})
</script>

<style lang="scss" scoped>
.earn-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
}
</style>
