<!-- 复制 -->
<template>
  <div class="copy" @click="toCopy" :style="{ justifyContent: contentFix }">
    <slot name="copyMsg"></slot>
    <span v-if="noFlag" class="img" :style="{ width: fontSize, height: fontSize }" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </span>
  </div>
</template>

<script setup>
import { _t18 } from '@/utils/public'
import { useToast } from '@/hook/useToast'
const { _toast } = useToast()
import Copy from 'vue-clipboard3'
const props = defineProps({
  data: {
    type: [String, Number],
    default: ''
  },
  contentFix: {
    type: String,
    default: 'space-between'
  },
  fontSize: {
    type: String,
    default: '14px'
  },
  noFlag:{
    type: Boolean,
    default: true
  }
})
const { toClipboard } = Copy()
const toCopy = async () => {
  try {
    await toClipboard(`${props.data}`)
    _toast('copy_success')
  } catch (e) {
    _toast('copy_error')
  }
}
</script>

<style lang="scss" scoped>
.copy {
  padding: 5px 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  .img {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
    color: rgb(196, 124, 255);
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &:active .img {
    color: rgb(160, 65, 237);
  }
}
</style>
