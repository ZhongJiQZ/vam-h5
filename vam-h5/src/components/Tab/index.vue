<!-- Tab切换组件 -->
<template>
  <van-tabs
    :active="props.active"
    @clickTab="change"
    :title-inactive-color="titleInactiveColor"
    :title-active-color="titleActiveColor"
    :color="indicatorColor"
    :line-width="lineWidth"
    :line-height="lineHeight"
    :class="[flexBetween ? 'betweenClass' : '', boldActiveTab ? 'tab--bold-active' : '']"
  >
    <van-tab v-for="(item, index) in props.tabList" :key="index" :title="item">
      <div class="tabContent">
        <slot name="tabContent"></slot>
      </div>
    </van-tab>
  </van-tabs>
</template>

<script setup>
const props = defineProps({
  tabList: {
    type: Array,
    default: []
  },
  active: {
    type: Number
  },
  lineWidth: {
    type: [String, Number],
    default: '16'
  },
  lineHeight: {
    type: [String, Number],
    default: '3'
  },
  titleInactiveColor: {
    type: String,
    default: '#333'
  },
  titleActiveColor: {
    type: String,
    default: '#17AC74'
  },
  indicatorColor: {
    type: String,
    default: '#17AC74'
  },
  /** 选中 Tab 加粗（如充值记录页） */
  boldActiveTab: {
    type: Boolean,
    default: false
  },
  // 两端对齐
  flexBetween: {
    type: Boolean,
    default: false
  }
})

const active2 = ref(0)
const emit = defineEmits(['change'])
const change = (e) => {
  active2.value = e.name
}
watch(active2, (newValue) => {
  emit('change', active2.value)
})
</script>

<style lang="scss" scoped>
// :deep(.van-tabs__wrap) {
//   margin: 10px 0 15px;
// }
// :deep(.van-tabs__nav--line) {
//   padding-bottom: 8px;
// }
:deep(.van-tab--active) {
  font-weight: normal;
}

.tab--bold-active :deep(.van-tab--active) {
  font-weight: 600 !important;
}
.tabContent {
  border-top: 1px solid var(--ex-border-color);
  p {
    color: var(--ex-passive-font-color);
    padding: 30px 0;
    text-align: center;
  }
}
.van-loading {
  text-align: center;
  padding: 30px;
}
.betweenClass {
  :deep(.van-tabs__nav) {
    background: var(--ex-home-list-bgcolor) !important ;
    .van-tab:first-child {
      justify-content: flex-start !important;
      margin-left: 15px;
    }
    .van-tab:nth-last-child(2) {
      justify-content: flex-end !important;
      margin-right: 15px;
    }
  }
}
</style>
