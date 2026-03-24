<!-- 快捷充币 -->
<template>
  <div class="page-recharge">
    <DarkHeaderBar
      :title="_t18('recharge_fast', ['aams', 'robinhood2'])"
      :border_bottom="true"
    />
    <div class="card">
      <List :data="coinList" />
      <div
        v-if="['das', 'dev'].includes(_getConfig('_APP_ENV'))"
        class="custorm"
        @click="dispatchCustomEvent('event_serviceChange')"
      >
        <div class="left">
          <image-load filePath="defi/custorm.png" class="service-img"></image-load>
          <span class="text">{{ _t18('findCustorm') }}</span>
        </div>
        <van-icon name="arrow" class="chevron" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { dispatchCustomEvent } from '@/utils'
import { _t18 } from '@/utils/public'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import List from './recharge-list.vue'
import { filterCoin2 } from '@/utils/public'
import { useMainStore } from '@/store/index.js'

const mainStore = useMainStore()

const coinList = computed(() => {
  return mainStore.getRechargeList.map((item) => {
    return {
      icon: filterCoin2(item.coin),
      type: 0,
      title: item.coinName,
      address: item.address
    }
  })
})
</script>

<style lang="scss" scoped>
.page-recharge {
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

.custorm {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ebedf0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-tap-highlight-color: transparent;

  .left {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .service-img {
    width: 22px;
    height: 22px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .text {
    font-size: 14px;
    color: #323233;
  }

  .chevron {
    flex-shrink: 0;
    color: #c8c9cc;
    font-size: 16px;
  }
}
</style>
