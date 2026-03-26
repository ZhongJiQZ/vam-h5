<!-- 理财 -->
<template>
  <div class="financial-page">
    <HeaderBar
      v-if="['paxpay'].includes(_getConfig('_APP_ENV'))"
      :currentName="_t18('financial', ['paxpay'])"
      :border_bottom="false"
    />
    <FinancialTopBar v-else />
    <Header />
    <FundList />
  </div>
</template>
<script setup>
import FinancialTopBar from './components/FinancialTopBar.vue'
import Header from './components/header.vue'
import FundList from './components/fundList.vue'
</script>
<style lang="scss" scoped>
.financial-page {
  min-height: 100vh;
  background: #eef0f4;
  box-sizing: border-box;
}
</style>
