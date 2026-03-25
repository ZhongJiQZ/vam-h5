<!-- 提现 -->
<template>
  <div class="page-withdraw">
    <DarkHeaderBar
      :title="_t18('withdraw', ['latcoin'])"
      right=""
      :border_bottom="true"
    />
    <div class="card">
      <List :data="coinList" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { _t18 } from '@/utils/public'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import List from './withdraw-list.vue'
import { filterCoin2 } from '@/utils/public'
import { useMainStore } from '@/store/index.js'

const mainStore = useMainStore()

const coinList = computed(() => {
  const list = []
  mainStore.getWithdrawList.forEach((item) => {
    if (item.status == '1') {
      const obj = {
        type: 1,
        ratio: item.ratio || '',
        fee: item.fee
      }
      if (item.type == 0) {
        obj.icon = item.rechargeType
        obj.title = item.rechargeName
      } else {
        obj.icon = 'card'
        obj.title = _t18('withdraw_card')
        obj.card = filterCoin2(item.rechargeType).toLocaleUpperCase()
      }
      list.push(obj)
    }
  })
  return list
})
</script>

<style lang="scss" scoped>
.page-withdraw {
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
</style>
