<!-- 充值币种列表 -->
<template>
  <div class="recharge-list">
    <p class="section-title">{{ _t18('coinList') }}</p>
    <div class="list">
      <div
        v-for="(item, index) in props.data"
        :key="index"
        class="list-row"
        role="button"
        tabindex="0"
        @click="toClick(item)"
      >
        <div class="left">
          <div class="coin-wrap">
            <svg-load :name="item.icon" class="coin"></svg-load>
          </div>
          <span class="coin-name">{{ item.title }}</span>
        </div>
        <van-icon name="arrow" class="chevron" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { _t18 } from '@/utils/public'

const router = useRouter()
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const toClick = (item) => {
  router.push(`/recharge-apply?type=${item.title}&coin=${item.icon}`)
}
</script>

<style lang="scss" scoped>
.recharge-list {
  padding: 0;
}

.section-title {
  font-size: 14px;
  color: #969799;
  margin: 0 0 16px;
  text-align: left;
  line-height: 1.4;
}

.list-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  min-height: 52px;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.left {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.coin-wrap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 12px;
}

.coin {
  font-size: 22px;
}

.coin-name {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  flex-shrink: 0;
  color: #c8c9cc;
  font-size: 16px;
  margin-left: 8px;
}
</style>
