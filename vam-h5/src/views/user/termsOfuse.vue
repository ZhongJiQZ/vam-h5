<template>
  <LegalDocumentPage
    :title="_t18('register_howToUse')"
    :content="currentHtml"
    :loaded="loaded"
  />
</template>

<script setup>
import { rulesList } from '@/api/common/index'
import { _t18 } from '@/utils/public'
import LegalDocumentPage from './components/LegalDocumentPage.vue'

const currentHtml = ref('')
const loaded = ref(false)

onMounted(async () => {
  try {
    const res = await rulesList('REGISTRY_CLAUSE')
    if (res.code === 200) {
      currentHtml.value = res.data[0]?.content || ''
    }
  } catch (error) {
    // ignore
  } finally {
    loaded.value = true
  }
})
</script>
