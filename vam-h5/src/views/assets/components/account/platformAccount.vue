<template>
  <div>
    <Amount
      :amount="showNum ? amountSum : _hide(amountSum)"
      @handleYanjin="handleYanjin"
      @handleShuaxin="handleShuaxin"
      :type="type"
      :showicon="showNum ? 'yanjin-k' : 'yanjin-g'"
    ></Amount>
    <!-- 平台 -->
    <AmountDetail :assetDetails="assetDetails" :showNum="showNum"></AmountDetail>
  </div>
</template>

<script setup>
import { _hide } from '@/utils/public.js'
import Amount from './amount.vue'
import AmountDetail from './amountDetail.vue'
const props = defineProps({
  assetDetails: {
    type: Array,
    default: () => [],
  },
  amountSum: {
    type: String,
    default: '0',
  },
  showNum: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    default: '',
  },
})

// 点击小眼睛 show/hide eye
const emit = defineEmits(['handleYanjin','handleShuaxin'])
const handleYanjin = () => {
  emit('handleYanjin')
}
const handleShuaxin = () => {
  emit('handleShuaxin')
}
</script>

<style lang="scss" scoped></style>
