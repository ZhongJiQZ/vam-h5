<!-- 加载 image-->
<script setup name="img-load">
import { computed, ref, onMounted } from 'vue'
import { resolveImageLoadUrl } from '@/utils/imagePreload'

const props = defineProps({
  /**
   * 路径
   */
  filePath: { type: String, default: '' },
  /**
   * 定制平台
   */
  platform: { type: Array, default: () => [] },
  /**
   * 公共主题资源
   */
  isPublic: { type: Boolean, default: true },
  /** native img loading: eager | lazy */
  loading: { type: String, default: 'lazy' },
  /** high | low | auto */
  fetchpriority: { type: String, default: 'auto' }
})

const path = computed(() => resolveImageLoadUrl(props.filePath, props.platform))

const imgRef = ref(null)
const emit = defineEmits(['load', 'error'])

onMounted(() => {
  if (imgRef.value && imgRef.value.complete) {
    emit('load')
  }
})
</script>
<template>
  <img
    ref="imgRef"
    :src="path"
    class="img"
    :loading="loading"
    :fetchpriority="fetchpriority"
    @load="$emit('load', $event)"
    @error="$emit('error', $event)"
  />
</template>
<style lang="scss" scoped>
.img {
  width: 1em;
  height: 1em;
}
</style>
