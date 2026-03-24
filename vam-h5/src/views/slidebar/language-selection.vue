<template>
  <div class="page-language">
    <DarkHeaderBar
      :title="_t18('sidebar_language')"
      right="service"
      :border_bottom="true"
    />
    <div class="card">
      <div class="section-head">
        <span class="section-title">{{ _t18('sidebar_language') }}</span>
        <img :src="languageIcon" alt="" class="section-icon" />
      </div>
      <van-radio-group :model-value="checked">
        <van-radio
          v-for="(item, index) in languageList"
          :key="index"
          :name="index"
          shape="round"
          label-position="left"
          checked-color="#17ac74"
          class="lang-row"
          @click="setLanguage(item)"
        >
          {{ item.remark }}
        </van-radio>
      </van-radio-group>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import languageIcon from '@/assets/images/language.png'
import { storageDict } from '@/config/dict'
import { useMainStore } from '@/store/index.js'

const mainStore = useMainStore()
const current = ref(localStorage.getItem(storageDict.LANGUAGE))

const setLanguage = (item) => {
  mainStore.setLanguage(item.dictValue)
  current.value = item.dictValue
}

const checked = computed(() => {
  let temp = 0
  mainStore.languageList.forEach((item, index) => {
    if (item.dictValue == current.value) {
      temp = index
    }
  })
  return temp
})

const languageList = mainStore.languageList
</script>

<style lang="scss" scoped>
.page-language {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.card {
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 20px 15px 28px;
  box-sizing: border-box;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #646566;
}

.section-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
}

.card :deep(.lang-row.van-radio) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
  margin: 0;
}

.card :deep(.lang-row .van-radio__label) {
  flex: 1;
  margin-left: 0;
  margin-right: 12px;
  font-size: 15px;
  color: #646566;
  line-height: 1.4;
}

.card :deep(.lang-row .van-radio__icon) {
  flex-shrink: 0;
}
</style>
