<template>
  <div class="strategies-page">
    <el-page-header @back="$router.back()" :content="$t('pc_copy_trade_join_strategy')" />

    <el-row :gutter="16" v-loading="loading" class="list">
      <el-col v-for="item in list" :key="item.id" :xs="24" :sm="12" :md="8">
        <div class="card" @click="toSubmit(item)">
          <div class="head">
            <img v-if="item.icon" :src="item.icon" class="avatar" />
            <div v-else class="avatar avatar-empty" />
            <div>
              <p class="name">{{ item.strategyName }}</p>
            </div>
            <el-tag size="mini">{{ item.followStatusText || $t("pc_copy_trade_follow_now") }}</el-tag>
          </div>
          <p>{{ $t("pc_copy_trade_strategy_start_time") }}: {{ formatCopyTradeStrategyStartTime(item) }}</p>
          <p>{{ $t("pc_copy_trade_strategy_end_time") }}: {{ formatCopyTradeStrategyEndTime(item) }}</p>
          <p>{{ $t("pc_copy_trade_profit_rate_range") }}: {{ formatStrategyProfitRateRange(item) }}</p>
          <p>{{ $t("pc_copy_trade_range") }}: {{ item.minAmount }} ~ {{ item.maxAmount }} USDT</p>
        </div>
      </el-col>
    </el-row>
    <el-empty v-if="!loading && !list.length" :description="$t('pc_copy_trade_empty')" />
  </div>
</template>

<script>
import { getCopyTradeInstitutionStrategyList } from "@/api/copyTrade";
import {
  formatCopyTradeStrategyStartTime,
  formatCopyTradeStrategyEndTime,
  formatStrategyProfitRateRange,
  isStrategyFollowing
} from "./utils";

export default {
  name: "CopyTradeStrategies",
  data() {
    return { loading: false, list: [] };
  },
  created() {
    this.loadData();
  },
  methods: {
    formatCopyTradeStrategyStartTime,
    formatCopyTradeStrategyEndTime,
    formatStrategyProfitRateRange,
    async loadData() {
      const institutionId = this.$route.query.institutionId;
      if (!institutionId) return;
      this.loading = true;
      try {
        const res = await getCopyTradeInstitutionStrategyList({ institutionId });
        this.list = res && res.data && res.data.code == 200 && Array.isArray(res.data.data) ? res.data.data : [];
      } finally {
        this.loading = false;
      }
    },
    toSubmit(item) {
      if (isStrategyFollowing(item)) {
        this.$router.push("/copyTrade/my");
        return;
      }
      if (item && item.canJoin === false) {
        this.$message.warning(item.followStatusText || this.$t("pc_copy_trade_unjoinable"));
        return;
      }
      this.$router.push({
        path: "/copyTrade/submit",
        query: {
          strategyId: item.id,
          institutionId: this.$route.query.institutionId || item.institutionId,
          data: encodeURIComponent(JSON.stringify(item)),
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
.strategies-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 16px 20px;
}
.list {
  margin-top: 16px;
}
.card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 16px;
  cursor: pointer;
  background: #fff;
}
.head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.avatar-empty {
  background: #edf8f2;
}
.name {
  margin: 0;
  font-weight: 600;
}
.symbol {
  margin: 0;
  font-size: 12px;
  color: #888;
}
</style>
