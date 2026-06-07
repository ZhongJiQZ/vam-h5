<template>
  <div class="detail-page" v-loading="loading">
    <el-page-header @back="$router.back()" :content="$t('pc_copy_trade_detail_title')"></el-page-header>

    <el-tabs v-model="activeName" @tab-click="changeTab" class="tabs">
      <el-tab-pane :label="$t('pc_copy_trade_tab_ongoing')" name="0"></el-tab-pane>
      <el-tab-pane :label="$t('pc_copy_trade_tab_ended')" name="1"></el-tab-pane>
    </el-tabs>

    <template v-if="orders.length">
      <div v-for="order in orders" :key="order.id" class="order-block">
        <div class="panel">
          <div class="head flex-between">
            <div class="head-left">
              <img v-if="order.icon" :src="order.icon" class="avatar" alt="" />
              <div v-else class="avatar avatar-empty"></div>
              <h3>{{ order.strategyName || meta.strategyName || "--" }}</h3>
            </div>
            <el-tag size="mini" :type="order.status === 0 ? 'success' : 'info'">
              {{ orderStatusText(order) }}
            </el-tag>
          </div>

          <el-row :gutter="12" class="meta-grid">
            <el-col :span="12">{{ $t("pc_copy_trade_amount") }}：{{ num(order.amount) }} USDT</el-col>
            <el-col :span="12">{{ $t("pc_copy_trade_symbol") }}：{{ copyTradePositionSymbol(order) }}</el-col>
            <el-col :span="12">{{ $t("pc_copy_trade_strategy_start_time") }}：{{ formatCopyTradeStrategyStartTime(order) }}</el-col>
            <el-col :span="12">{{ $t("pc_copy_trade_strategy_end_time") }}：{{ formatCopyTradeStrategyEndTime(order) }}</el-col>
            <el-col :span="12">{{ $t("pc_copy_trade_join_time") }}：{{ formatCopyTradeJoinTime(order) }}</el-col>
            <el-col v-if="order.status === 1" :span="12">{{ $t("pc_copy_trade_end_time") }}：{{ order.endTime || "--" }}</el-col>
            <el-col :span="12">{{ $t("pc_copy_trade_cycle_progress") }}：{{ cycleProgress(order) }}</el-col>
            <el-col :span="12">{{ $t("pc_copy_trade_target_profit") }}：{{ num(order.targetProfit) }} USDT</el-col>
            <el-col :span="12">{{ $t("pc_copy_trade_win_lose") }}：{{ winLose(order) }}</el-col>
            <el-col v-if="order.status === 1" :span="12">{{ $t("pc_copy_trade_profit_loss_breakdown") }}：+{{ num(order.params && order.params.totalProfitAmt) }}/-{{ num(order.params && order.params.totalLossAmt) }}</el-col>
            <el-col :span="12">{{ $t("pc_copy_trade_profit_share_rate") }}：{{ profitShareRateText(order.profitShareRate) }}</el-col>
            <el-col :span="12">{{ $t("pc_copy_trade_trade_fee") }}：{{ num(order.tradeFee) }} USDT</el-col>
            <el-col :span="12">{{ $t("pc_copy_trade_profit_share_amt") }}：{{ num(order.profitShareAmt) }} USDT</el-col>
          </el-row>

          <div v-if="order.status === 1" class="pnl-box">
            <div>{{ $t("pc_copy_trade_current_pnl") }}：<span :class="pnlClass(orderProfit(order))">{{ signNum(orderProfit(order)) }} USDT</span></div>
            <div>{{ $t("pc_copy_trade_pnl_rate") }}：<span :class="pnlClass(orderProfit(order))">{{ orderPnlRate(order) }}%</span></div>
            <div>{{ $t("pc_copy_trade_net_profit") }}：<span :class="pnlClass(orderNetProfit(order))">{{ signNum(orderNetProfit(order)) }} USDT</span></div>
          </div>

          <div v-if="activeName === '0' && isPrimaryOrder(order) && order.status === 0" class="action-btns">
            <el-button type="primary" plain @click="openAppend">{{ $t("pc_copy_trade_append") }}</el-button>
            <el-button class="stop-btn" type="danger" :loading="stopping" @click="confirmExit">
              {{ $t("pc_copy_trade_stop") }}
            </el-button>
          </div>
        </div>

        <div class="panel" v-if="order.records && order.records.length">
          <h4>{{ $t("pc_copy_trade_history_positions") }}</h4>
          <el-table :data="order.records" border>
            <el-table-column :label="$t('pc_copy_trade_direction')" width="120">
              <template slot-scope="scope">
                <template v-if="activeName === '0'">
                  <span class="cross-tag">{{ $t('pc_copy_trade_cross') }}</span>
                </template>
                <template v-else>
                  <el-tag size="mini" :type="scope.row.type === 0 ? 'success' : 'danger'">
                    {{ scope.row.type === 0 ? $t("pc_copy_trade_long") : $t("pc_copy_trade_short") }}
                  </el-tag>
                  <span v-if="recordLeverageText(scope.row)" class="leverage-tag">{{ recordLeverageText(scope.row) }}</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column :label="$t('pc_copy_trade_open_price')" min-width="110">
              <template slot-scope="scope">{{ scope.row.openPrice }}</template>
            </el-table-column>
            <el-table-column :label="$t('pc_copy_trade_close_price')" min-width="110">
              <template slot-scope="scope">{{ maskRecordValue(scope.row.closePrice) }}</template>
            </el-table-column>
            <el-table-column :label="$t('pc_copy_trade_pnl_usdt')" min-width="120">
              <template slot-scope="scope">
                <span :class="activeName === '0' ? '' : pnlClass(scope.row.earn)">{{ maskRecordValue(signNum(scope.row.earn)) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('pc_copy_trade_open_time')" min-width="160">
              <template slot-scope="scope">{{ scope.row.openTime || '--' }}</template>
            </el-table-column>
            <el-table-column :label="$t('pc_copy_trade_close_time')" min-width="160">
              <template slot-scope="scope">{{ maskRecordValue(scope.row.closeTime || '--') }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
    <el-empty v-else-if="!loading" :description="$t('pc_copy_trade_no_data')" />

    <el-dialog
      :title="$t('pc_copy_trade_append_title')"
      :visible.sync="appendVisible"
      width="420px"
      @open="onAppendOpen"
    >
      <p v-if="primaryOrder.strategyName" class="append-name">{{ primaryOrder.strategyName }}</p>
      <p class="append-tip">{{ $t("pc_copy_trade_append_tip") }}</p>
      <el-form label-width="100px">
        <el-form-item :label="$t('pc_copy_trade_append_amount')">
          <el-input v-model="appendAmount" type="number" :placeholder="$t('pc_copy_trade_append_amount_placeholder')">
            <template slot="append">USDT</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('pc_copy_trade_contract_balance')">
          <span>{{ num(contractBalance) }} USDT</span>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="appendVisible = false">{{ $t("utils.cancel") }}</el-button>
        <el-button type="primary" :loading="appendLoading" @click="confirmAppend">
          {{ $t("pc_copy_trade_append") }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getCopyTradeDetail, exitCopyTrade, appendCopyTrade } from "@/api/copyTrade";
import { mapGetters, mapActions } from "vuex";
import {
  copyTradeNetProfit,
  copyTradeTradeCount,
  copyTradePnlRate,
  copyTradePositionSymbol,
  formatCopyTradeStrategyStartTime,
  formatCopyTradeStrategyEndTime,
  formatCopyTradeJoinTime,
  normalizeCopyTradeDetailResponse,
} from "./utils";

export default {
  name: "CopyTradeDetail",
  data() {
    return {
      activeName: "0",
      loading: false,
      stopping: false,
      meta: {},
      orders: [],
      appendVisible: false,
      appendAmount: "",
      appendLoading: false,
    };
  },
  computed: {
    ...mapGetters(["userInfo"]),
    contractBalance() {
      if (this.userInfo && this.userInfo.asset && this.userInfo.asset.length > 0) {
        const cur = this.userInfo.asset.filter((item) => item.type == 3);
        return cur.length ? Number(cur[0].availableAmount || 0) : 0;
      }
      return 0;
    },
    primaryOrder() {
      const anchorId = this.$route.params.id;
      if (anchorId != null) {
        const matched = this.orders.find((o) => String(o.id) === String(anchorId));
        if (matched) return matched;
      }
      return this.orders[0] || {};
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    ...mapActions(["getUserInfo"]),
    async loadData() {
      this.loading = true;
      try {
        const id = this.$route.params.id;
        const res = await getCopyTradeDetail(id, Number(this.activeName));
        const parsed = normalizeCopyTradeDetailResponse(res);
        this.meta = parsed.meta;
        this.orders = parsed.orders;
      } finally {
        this.loading = false;
      }
    },
    changeTab() {
      this.loadData();
    },
    isPrimaryOrder(order) {
      return String(order.id) === String(this.primaryOrder.id);
    },
    orderStatusText(order) {
      if (this.meta.statusFilterText) return this.meta.statusFilterText;
      if (order.viewStatusText) return order.viewStatusText;
      if (order.params && order.params.statusText) return order.params.statusText;
      if (order.status === 0) return this.$t("pc_copy_trade_tab_ongoing");
      return this.$t("pc_copy_trade_tab_ended");
    },
    orderProfit(order) {
      if (Number(order.status) === 1) return Number(order.actualProfit || 0);
      return copyTradeNetProfit(order);
    },
    orderNetProfit(order) {
      return copyTradeNetProfit(order);
    },
    orderPnlRate(order) {
      if (Number(order.status) === 1) {
        const amount = Number(order.amount || 0);
        if (!amount) return "0.00";
        return ((this.orderProfit(order) / amount) * 100).toFixed(2);
      }
      return copyTradePnlRate(order);
    },
    cycleProgress(order) {
      const done = copyTradeTradeCount(order);
      const total = Number(order && order.expectedTradeCount != null ? order.expectedTradeCount : 0);
      return total ? `${done}/${total}` : `${done}`;
    },
    winLose(order) {
      const win = Number(order && order.params && order.params.winCount != null ? order.params.winCount : order.winCount != null ? order.winCount : 0);
      const lose = Number(order && order.params && order.params.loseCount != null ? order.params.loseCount : order.loseCount != null ? order.loseCount : 0);
      return `${win}/${lose}`;
    },
    async confirmExit() {
      this.$confirm(this.$t("pc_copy_trade_stop_confirm_desc"), this.$t("pc_copy_trade_tips"), {
        type: "warning",
      })
        .then(async () => {
          this.stopping = true;
          try {
            await exitCopyTrade({ id: this.primaryOrder.id });
            this.$message.success(this.$t("pc_copy_trade_exit_success"));
            this.loadData();
          } finally {
            this.stopping = false;
          }
        })
        .catch(() => {});
    },
    openAppend() {
      this.appendAmount = "";
      this.appendVisible = true;
    },
    onAppendOpen() {
      this.getUserInfo();
    },
    async confirmAppend() {
      const val = Number(this.appendAmount);
      if (!val || val <= 0) {
        this.$message.warning(this.$t("pc_copy_trade_append_amount_invalid"));
        return;
      }
      if (val > this.contractBalance) {
        this.$message.warning(this.$t("pc_copy_trade_insufficient_balance"));
        return;
      }
      this.appendLoading = true;
      try {
        const res = await appendCopyTrade({ id: this.primaryOrder.id, amount: val });
        this.$message.success((res && res.data && res.data.msg) || this.$t("pc_copy_trade_append_success"));
        this.appendVisible = false;
        this.loadData();
      } finally {
        this.appendLoading = false;
      }
    },
    formatCopyTradeStrategyStartTime,
    formatCopyTradeStrategyEndTime,
    formatCopyTradeJoinTime,
    copyTradePositionSymbol,
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
    recordLeverageText(record) {
      const n = Number(record && record.leverage);
      if (!Number.isFinite(n) || n <= 0) return "";
      const val = Number.isInteger(n) ? n : n.toFixed(2);
      return `${val}x`;
    },
    maskRecordValue(value) {
      if (this.activeName !== "0") return value;
      return "***";
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
.tabs {
  margin-top: 12px;
}
.order-block {
  margin-bottom: 8px;
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
.leverage-tag {
  margin-left: 6px;
  font-size: 12px;
  color: #667085;
}
.cross-tag {
  font-size: 12px;
  color: #667085;
}
.stop-btn {
  margin-top: 0;
}
.action-btns {
  margin-top: 14px;
  display: flex;
  gap: 12px;
}
.append-name {
  margin: 0 0 6px;
  font-weight: 600;
}
.append-tip {
  margin: 0 0 16px;
  font-size: 12px;
  color: #667085;
}
</style>
