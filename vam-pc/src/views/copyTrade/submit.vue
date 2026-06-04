<template>
  <div class="submit-page">
    <el-page-header @back="$router.back()" :content="$t('pc_copy_trade_submit_title')"></el-page-header>

    <div class="panel">
      <h3>{{ strategy.strategyName || "--" }}</h3>
      <p class="meta">{{ symbolPair(strategy.symbol) }} · {{ strategy.profitRate || 0 }}%/{{ strategy.cycleHours || 0 }}h</p>
      <p class="meta">{{ $t("pc_copy_trade_join_window") }}：{{ joinWindowText(strategy) }}</p>
      <p class="meta">
        {{ $t("pc_copy_trade_profit_share_rate") }}：{{ profitShareRateText(strategy.profitShareRate) }}
        ({{ $t("pc_copy_trade_profit_share_rate_desc") }})
      </p>
      <p class="meta" v-if="strategy.followStatusText">{{ $t("pc_copy_trade_status") }}：{{ strategy.followStatusText }}</p>
    </div>

    <div class="panel">
      <el-form label-width="100px">
        <el-form-item :label="$t('pc_copy_trade_amount')">
          <el-input v-model="amount" type="number" :placeholder="$t('pc_copy_trade_amount_placeholder')">
            <template slot="append">USDT</template>
          </el-input>
          <p class="range">{{ $t("pc_copy_trade_range") }}：{{ strategy.minAmount || 0 }} ~ {{ strategy.maxAmount || 0 }}</p>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">{{ $t("pc_copy_trade_follow_now") }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { submitCopyTrade } from "@/api/copyTrade";

export default {
  name: "CopyTradeSubmit",
  data() {
    return {
      strategy: {},
      amount: "",
      submitting: false,
    };
  },
  created() {
    this.parseStrategy();
  },
  methods: {
    parseStrategy() {
      const raw = this.$route.query.data;
      if (!raw) return;
      try {
        this.strategy = JSON.parse(decodeURIComponent(raw));
      } catch (e) {
        this.strategy = {};
      }
    },
    symbolPair(symbol) {
      const s = String(symbol || "").toUpperCase();
      if (!s) return "--";
      return s.includes("/") ? s : `${s}/USDT`;
    },
    joinWindowText(item) {
      const start = item?.joinStartTime;
      const end = item?.joinEndTime;
      if (start && end) return `${start} ~ ${end}`;
      if (start && !end) return `${start} ~ ${this.$t("pc_copy_trade_no_limit")}`;
      if (!start && end) return `${this.$t("pc_copy_trade_no_limit")} ~ ${end}`;
      return this.$t("pc_copy_trade_no_limit");
    },
    profitShareRateText(rate) {
      const n = Number(rate);
      if (!Number.isFinite(n) || n === 0) return this.$t("pc_copy_trade_profit_share_rate_none");
      return `${n}%`;
    },
    async submit() {
      if (this.strategy && this.strategy.canJoin === false) {
        this.$message.warning(this.strategy.followStatusText || this.$t("pc_copy_trade_unjoinable"));
        return;
      }
      const val = Number(this.amount);
      if (!val || val < Number(this.strategy.minAmount) || val > Number(this.strategy.maxAmount)) {
        this.$message.warning(this.$t("pc_copy_trade_amount_invalid"));
        return;
      }
      this.submitting = true;
      try {
        const res = await submitCopyTrade({ strategyId: this.strategy.id, amount: val });
        const msg = res?.data?.msg;
        this.$message.success(msg || this.$t("pc_copy_trade_submit_success"));
        this.$router.replace("/copyTrade/my");
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.submit-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}
.panel {
  background: #fff;
  border: 1px solid #eceff3;
  border-radius: 10px;
  padding: 16px;
  margin-top: 16px;
}
.meta {
  color: #8c93a1;
  margin-top: 8px;
  font-size: 13px;
}
.range {
  color: #8c93a1;
  font-size: 12px;
  margin-top: 8px;
}
</style>
