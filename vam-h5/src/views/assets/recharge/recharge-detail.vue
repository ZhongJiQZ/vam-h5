<!-- 充值详情 -->
<template>
  <div class="page-recharge-detail">
    <DarkHeaderBar
      :title="_t18('recharge_detail')"
      right="service"
      :border_bottom="true"
    />
    <div class="sheet">
      <div class="detail-card">
        <Amount :data="data" card-surface />
        <Info :data="data" card-surface />
      </div>
    </div>
  </div>
</template>

<script setup>
import { _t18 } from '@/utils/public'
import { getRechargeDetail } from '@/api/account'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import Amount from '../components/detailAmount.vue'
import Info from '../components/orderInfo.vue'

const route = useRoute()
const data = ref({})
const id = route.query.id

const getDetail = () => {
  getRechargeDetail(id).then((res) => {
    if (res.code == '200') {
      data.value = res.data
    }
  })
}
getDetail()
</script>

<style lang="scss" scoped>
.page-recharge-detail {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.sheet {
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 16px 0 28px;
  box-sizing: border-box;
}

.detail-card {
  margin: 0 15px;
  background: #f6f7fb;
  border-radius: 12px;
  padding: 8px 16px 20px;
  box-sizing: border-box;
}
</style>
