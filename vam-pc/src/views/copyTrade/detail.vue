<template>
  <div class="detail-page" v-loading="loading">
    <el-page-header @back="$router.back()" :content="$t('pc_copy_trade_detail_title')"></el-page-header>

    <div class="panel" v-if="detail.id">
      <div class="head flex-between">
        <div class="head-left">
          <img v-if="detail.icon" :src="detail.icon" class="avatar" alt="" />
          <div v-else class="avatar avatar-empty"></div>
          <h3>{{ detail.strategyName || "--" }}</h3>
        </div>
        <el-tag size="mini" :type="detail.status === 0 ? 'success' : 'info'">
          {{ detail.params && detail.params.statusText ? detail.params.statusText : (detail.status === 0 ? $t("pc_copy_trade_tab_ongoing") : $t("pc_copy_trade_tab_ended")) }}
        </el-tag>
      </div>

      <el-row :gutter="12" class="meta-grid">
        <el-col :span="12">{{ $t("pc_copy_trade_amount") }}：{{ num(detail.amount) }} USDT</el-col>
        <el-col :span="12">{{ $t("pc_copy_trade_symbol") }}：{{ symbolPair(detail.symbol) }}</el-col>
        <el-col :span="12">{{ $t("pc_copy_trade_join_time") }}：{{ detail.startTime || "--" }}</el-col>
        <el-col :span="12">{{ $t("pc_copy_trade_end_time") }}：{{ detail.endTime || "--" }}</el-col>
        <el-col :span="12">{{ $t("pc_copy_trade_cycle_progress") }}：{{ cycleProgress }}</el-col>
        <el-col :span="12">{{ $t("pc_copy_trade_target_profit") }}：{{ num(detail.targetProfit) }} USDT</el-col>
        <el-col :span="12">{{ $t("pc_copy_trade_win_lose") }}：{{ winLose }}</el-col>
        <el-col :span="12">{{ $t("pc_copy_trade_profit_loss_breakdown") }}：+{{ num(detail.params && detail.params.totalProfitAmt) }}/-{{ num(detail.params && detail.params.totalLossAmt) }}</el-col>
        <el-col :span="12">{{ $t("pc_copy_trade_profit_share_rate") }}：{{ profitShareRateText(detail.profitShareRate) }}</el-col>
        <el-col :span="12">{{ $t("pc_copy_trade_trade_fee") }}：{{ num(detail.tradeFee) }} USDT</el-col>
        <el-col :span="12">{{ $t("pc_copy_trade_profit_share_amt") }}：{{ num(detail.profitShareAmt) }} USDT</el-col>
      </el-row>

      <div class="pnl-box">
        <div>{{ $t("pc_copy_trade_current_pnl") }}：<span :class="pnlClass(displayProfit)">{{ signNum(displayProfit) }} USDT</span></div>
        <div>{{ $t("pc_copy_trade_pnl_rate") }}：<span :class="pnlClass(displayProfit)">{{ pnlRate }}%</span></div>
        <div>{{ $t("pc_copy_trade_net_profit") }}：<span :class="pnlClass(netProfit)">{{ signNum(netProfit) }} USDT</span></div>
      </div>

      <el-button
        v-if="detail.status === 0"
        class="stop-btn"
        type="danger"
        :loading="stopping"
        @click="confirmExit"
      >
        {{ $t("pc_copy_trade_stop") }}
      </el-button>
    </div>

    <div class="panel" v-if="records.length">
      <h4>{{ $t("pc_copy_trade_history_positions") }}</h4>
      <el-table :data="records" border>
        <el-table-column :label="$t('pc_copy_trade_direction')" width="90">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.type === 0 ? 'success' : 'danger'">
              {{ scope.row.type === 0 ? $t("pc_copy_trade_long") : $t("pc_copy_trade_short") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="openPrice" :label="$t('pc_copy_trade_open_price')" min-width="110" />
        <el-table-column prop="closePrice" :label="$t('pc_copy_trade_close_price')" min-width="110" />
        <el-table-column :label="$t('pc_copy_trade_pnl_usdt')" min-width="120">
          <template slot-scope="scope">
            <span :class="pnlClass(scope.row.earn)">{{ signNum(scope.row.earn) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="openTime" :label="$t('pc_copy_trade_open_time')" min-width="160" />
        <el-table-column prop="closeTime" :label="$t('pc_copy_trade_close_time')" min-width="160" />
      </el-table>
    </div>
  </div>
</template>

<script>
import { getCopyTradeDetail, exitCopyTrade } from "@/api/copyTrade";

export default {
  name: "CopyTradeDetail",
  data() {
    return {
      loading: false,
      stopping: false,
      detail: {},
      records: [],
    };
  },
  computed: {
    displayProfit() {
      if (Number(this.detail.status) === 1) return Number(this.detail.actualProfit || 0);
      if (this.detail && this.detail.params && this.detail.params.totalSettledProfit != null) {
        return Number(this.detail.params.totalSettledProfit || 0);
      }
      return Number(this.detail && this.detail.actualProfit != null ? this.detail.actualProfit : 0);
    },
    pnlRate() {
      const amount = Number(this.detail.amount || 0);
      if (!amount) return "0.00";
      return ((this.displayProfit / amount) * 100).toFixed(2);
    },
    cycleProgress() {
      const done = Number(this.detail && this.detail.tradeCount != null ? this.detail.tradeCount : 0);
      const total = Number(this.detail && this.detail.expectedTradeCount != null ? this.detail.expectedTradeCount : 0);
      return total ? `${done}/${total}` : `${done}`;
    },
    winLose() {
      const win = Number(this.detail && this.detail.params && this.detail.params.winCount != null ? this.detail.params.winCount : 0);
      const lose = Number(this.detail && this.detail.params && this.detail.params.loseCount != null ? this.detail.params.loseCount : 0);
      return `${win}/${lose}`;
    },
    netProfit() {
      if (this.detail && this.detail.netProfit != null && this.detail.netProfit !== "") {
        return Number(this.detail.netProfit || 0);
      }
      return Number(this.detail && this.detail.actualProfit != null ? this.detail.actualProfit : 0);
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const id = this.$route.params.id;
        const res = await getCopyTradeDetail(id);
        this.detail = res && res.data && res.data.data ? res.data.data : {};
        this.records = this.detail.records || [];
      } finally {
        this.loading = false;
      }
    },
    async confirmExit() {
      this.$confirm(this.$t("pc_copy_trade_stop_confirm_desc"), this.$t("pc_copy_trade_tips"), {
        type: "warning",
      })
        .then(async () => {
          this.stopping = true;
          try {
            await exitCopyTrade({ id: this.detail.id });
            this.$message.success(this.$t("pc_copy_trade_exit_success"));
            this.loadData();
          } finally {
            this.stopping = false;
          }
        })
        .catch(() => {});
    },
    symbolPair(symbol) {
      const s = String(symbol || "").toUpperCase();
      if (!s) return "--";
      return s.includes("/") ? s : `${s}/USDT`;
    },
    profitShareRateText(rate) {
      const n = Number(rate);
      if (!Number.isFinite(n) || n === 0) return this.$t("pc_copy_trade_profit_share_rate_none");
      return `${n}%`;
    },
    pnlClass(v) {
      const n = Number(v);
      if (n > 0) return "up";
      if (n < 0) return "down";
      return "";
    },
    num(v) {
      const n = Number(v || 0);
      return n.toFixed(2);
    },
    signNum(v) {
      const n = Number(v || 0);
      const p = n > 0 ? "+" : "";
      return `${p}${n.toFixed(2)}`;
    },
  },
};
</script>

<style scoped lang="scss">
.detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 0 20px 0;
  box-sizing: border-box;
}
.panel {
  background: #fff;
  border: 1px solid #eceff3;
  border-radius: 10px;
  padding: 16px;
  margin-top: 16px;
}
.head {
  margin-bottom: 10px;
}
.head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.avatar-empty {
  background: #eef2f8;
}
h3,
h4 {
  margin: 0;
}
.meta-grid {
  color: #667085;
  font-size: 13px;
  line-height: 28px;
}
.pnl-box {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e7eaf0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}
.up {
  color: #17ac74;
}
.down {
  color: #f04438;
}
.stop-btn {
  margin-top: 14px;
}
</style>
