<template>
  <div class="my-page">
    <el-page-header @back="$router.back()" :content="$t('pc_copy_trade_my')"></el-page-header>

    <el-tabs v-model="activeName" @tab-click="changeTab" class="tabs">
      <el-tab-pane :label="$t('pc_copy_trade_tab_ongoing')" name="0"></el-tab-pane>
      <el-tab-pane :label="$t('pc_copy_trade_tab_ended')" name="1"></el-tab-pane>
    </el-tabs>

    <div class="list" v-loading="loading">
      <div v-for="item in list" :key="item.id" class="card" @click="toDetail(item.id)">
        <div class="head flex-between">
          <div class="head-left">
            <img v-if="item.icon" :src="item.icon" class="avatar" alt="" />
            <div v-else class="avatar avatar-empty"></div>
            <div class="title">{{ item.strategyName }}</div>
          </div>
          <el-tag size="mini" :type="activeName === '0' ? 'success' : 'info'">
            {{ item.params && item.params.statusText ? item.params.statusText : (activeName === "0" ? $t("pc_copy_trade_tab_ongoing") : $t("pc_copy_trade_tab_ended")) }}
          </el-tag>
        </div>

        <el-row :gutter="10" class="meta-grid">
          <el-col :span="12">{{ $t("pc_copy_trade_amount") }}：{{ num(item.amount) }} USDT</el-col>
          <el-col :span="12">{{ $t("pc_copy_trade_symbol") }}：{{ symbolPair(item.symbol) }}</el-col>
          <el-col :span="12">{{ $t("pc_copy_trade_join_time") }}：{{ item.startTime || "--" }}</el-col>
          <el-col :span="12">{{ $t("pc_copy_trade_end_time") }}：{{ item.endTime || "--" }}</el-col>
          <el-col :span="12">{{ $t("pc_copy_trade_cycle_progress") }}：{{ cycleProgress(item) }}</el-col>
          <el-col :span="12">{{ $t("pc_copy_trade_current_pnl") }}：<span :class="pnlClass(currentPnl(item))">{{ signNum(currentPnl(item)) }} USDT</span></el-col>
        </el-row>

        <div class="card-foot" @click.stop>
          <el-button
            v-if="activeName === '0'"
            size="mini"
            type="primary"
            plain
            @click="openAppend(item)"
          >
            {{ $t("pc_copy_trade_append") }}
          </el-button>
          <div class="detail-link" @click="toDetail(item.id)">{{ $t("pc_copy_trade_view_detail") }} ></div>
        </div>
      </div>
    </div>

    <el-dialog
      :title="$t('pc_copy_trade_append_title')"
      :visible.sync="appendVisible"
      width="420px"
      @open="onAppendOpen"
    >
      <p v-if="appendItem.strategyName" class="append-name">{{ appendItem.strategyName }}</p>
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

    <div class="pager" v-if="total > 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page.sync="pageNum"
        :page-size="pageSize"
        :total="total"
        @current-change="loadData"
      />
    </div>
    <el-empty v-if="!loading && total === 0" :description="$t('pc_copy_trade_no_data')" />
  </div>
</template>

<script>
import { getCopyTradeList, appendCopyTrade } from "@/api/copyTrade";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "CopyTradeMy",
  data() {
    return {
      activeName: "0",
      loading: false,
      list: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      appendVisible: false,
      appendItem: {},
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
  },
  created() {
    this.loadData();
  },
  methods: {
    ...mapActions(["getUserInfo"]),
    async loadData() {
      this.loading = true;
      try {
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          status: Number(this.activeName),
        };
        if (this.$route.query.institutionId) params.institutionId = this.$route.query.institutionId;
        const res = await getCopyTradeList(params);
        this.list = (res && res.data && res.data.rows) || [];
        this.total = Number((res && res.data && res.data.total) || 0);
      } finally {
        this.loading = false;
      }
    },
    changeTab() {
      this.pageNum = 1;
      this.loadData();
    },
    toDetail(id) {
      this.$router.push(`/copyTrade/detail/${id}`);
    },
    openAppend(item) {
      this.appendItem = item || {};
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
        const res = await appendCopyTrade({ id: this.appendItem.id, amount: val });
        this.$message.success((res && res.data && res.data.msg) || this.$t("pc_copy_trade_append_success"));
        this.appendVisible = false;
        this.loadData();
      } finally {
        this.appendLoading = false;
      }
    },
    symbolPair(symbol) {
      const s = String(symbol || "").toUpperCase();
      if (!s) return "--";
      return s.includes("/") ? s : `${s}/USDT`;
    },
    cycleProgress(item) {
      const done = Number(item && item.tradeCount != null ? item.tradeCount : 0);
      const total = Number(item && item.expectedTradeCount != null ? item.expectedTradeCount : 0);
      return total ? `${done}/${total}` : `${done}`;
    },
    currentPnl(item) {
      if (!item) return 0;
      if (item.params && item.params.totalSettledProfit != null) return item.params.totalSettledProfit;
      return item.actualProfit != null ? item.actualProfit : 0;
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
.my-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 0 20px 0;
  box-sizing: border-box;
}
.tabs {
  margin-top: 12px;
}
.card {
  background: #fff;
  border: 1px solid #eceff3;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  cursor: pointer;
}
.head {
  margin-bottom: 8px;
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
.title {
  font-size: 16px;
  font-weight: 600;
}
.meta-grid {
  color: #667085;
  font-size: 13px;
  line-height: 26px;
}
.up {
  color: #17ac74;
}
.down {
  color: #f04438;
}
.detail-link {
  text-align: right;
  color: #17ac74;
  font-size: 12px;
  cursor: pointer;
}
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
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
.pager {
  margin-top: 16px;
  text-align: right;
}
</style>
