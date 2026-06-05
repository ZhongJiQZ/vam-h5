<template>
  <div class="inst-page" v-loading="pageLoading">
    <el-page-header @back="$router.back()" :content="detail.institutionName || $t('pc_copy_trade_inst_title')" />

    <div v-if="institutionId" class="body">
      <div class="hero">
        <img v-if="detail.logo" :src="detail.logo" class="logo" />
        <div v-else class="logo logo-empty" />
        <div>
          <h3>{{ detail.institutionName || "--" }}</h3>
          <p class="rate">{{ $t("pc_copy_trade_total_rate") }}: {{ formatRate(detail.totalProfitRate) }}%</p>
          <p class="subs">{{ $t("pc_copy_trade_inst_subscribers", { n: detail.useCount || 0 }) }}</p>
        </div>
      </div>
      <p v-if="detail.description" class="desc">{{ detail.description }}</p>

      <el-row :gutter="12" class="rules">
        <el-col :span="8"><div class="rule"><span>{{ $t("pc_copy_trade_join_date") }}</span><b>{{ detail.joinTime || detail.joinDate || "--" }}</b></div></el-col>
        <el-col :span="8"><div class="rule"><span>{{ $t("pc_copy_trade_trading_days") }}</span><b>{{ detail.tradingDays || "--" }}</b></div></el-col>
        <el-col :span="8"><div class="rule"><span>{{ $t("pc_copy_trade_range") }}</span><b>{{ detail.minAmount }}~{{ detail.maxAmount }}</b></div></el-col>
        <el-col :span="8"><div class="rule"><span>{{ $t("pc_copy_trade_trade_fee") }}</span><b>{{ detail.tradeFeeRate }}%</b></div></el-col>
        <el-col :span="8"><div class="rule"><span>{{ $t("pc_copy_trade_normal_share") }}</span><b>{{ detail.normalShareRate }}%</b></div></el-col>
        <el-col :span="8"><div class="rule"><span>{{ $t("pc_copy_trade_force_share") }}</span><b>{{ detail.forceShareRate }}%</b></div></el-col>
      </el-row>

      <el-tabs v-model="perfTab" @tab-click="loadPerformance">
        <el-tab-pane :label="$t('pc_copy_trade_inst_perf')" name="institution" />
        <el-tab-pane :label="$t('pc_copy_trade_my_perf')" name="my" />
      </el-tabs>

      <div class="range-row">
        <el-radio-group v-model="range" size="mini" @change="loadPerformance">
          <el-radio-button label="7d">{{ $t("pc_copy_trade_range_7d") }}</el-radio-button>
          <el-radio-button label="15d">{{ $t("pc_copy_trade_range_15d") }}</el-radio-button>
          <el-radio-button label="30d">{{ $t("pc_copy_trade_range_30d") }}</el-radio-button>
          <el-radio-button label="all">{{ $t("pc_copy_trade_range_all") }}</el-radio-button>
        </el-radio-group>
      </div>

      <div v-loading="perfLoading" class="perf">
        <p>{{ $t("pc_copy_trade_range_rate") }}: <b>{{ formatRate(perf.rangeTotalProfitRate) }}%</b></p>
        <p v-if="perfTab === 'my'">{{ $t("pc_copy_trade_total_profit") }}: <b>{{ perf.totalProfit || 0 }} USDT</b></p>

        <h4>{{ $t("pc_copy_trade_daily_chart") }}</h4>
        <el-table v-if="dailySeries.length" :data="dailySeries" size="mini" border>
          <el-table-column :label="$t('pc_copy_trade_date')">
            <template slot-scope="scope">{{ scope.row.date || scope.row.day || "--" }}</template>
          </el-table-column>
          <el-table-column :label="$t('pc_copy_trade_rate')">
            <template slot-scope="scope">{{ formatRate(scope.row.dailyRate || scope.row.rate) }}%</template>
          </el-table-column>
        </el-table>
        <el-empty v-else :description="$t('pc_copy_trade_no_chart')" />

        <h4>{{ $t("pc_copy_trade_coin_pref") }}</h4>
        <el-table v-if="coinPreference.length" :data="coinPreference" size="mini" border>
          <el-table-column :label="$t('pc_copy_trade_symbol')">
            <template slot-scope="scope">
              <div class="coin-cell">
                <img v-if="scope.row.icon" :src="scope.row.icon" class="coin-icon" alt="" />
                <span>{{ scope.row.symbol }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="count" :label="$t('pc_copy_trade_coin_count')" />
          <el-table-column prop="rate" :label="$t('pc_copy_trade_rate')">
            <template slot-scope="scope">{{ formatRate(scope.row.rate) }}%</template>
          </el-table-column>
        </el-table>
        <el-empty v-else :description="$t('pc_copy_trade_no_chart')" />
      </div>

      <div class="foot">
        <el-button type="primary" @click="goStrategies">{{ $t("pc_copy_trade_join_strategy") }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getCopyTradeInstitutionDetail,
  getCopyTradeInstitutionDailyChart,
  getCopyTradeInstitutionPerformance,
  getCopyTradeInstitutionCoinPreference,
  getCopyTradeMyDailyChart,
  getCopyTradeMyPerformance,
  getCopyTradeMyCoinPreference,
} from "@/api/copyTrade";
import { normalizeCoinPreference, buildInstitutionChartPayload } from "./utils";

export default {
  name: "CopyTradeInstitution",
  data() {
    return {
      institutionId: "",
      detail: {},
      pageLoading: true,
      perfTab: "institution",
      range: "7d",
      perf: {},
      coinPerf: {},
      perfLoading: false,
    };
  },
  computed: {
    dailySeries() {
      return this.perf.dailySeries || [];
    },
    coinPreference() {
      const fromApi = normalizeCoinPreference(this.coinPerf);
      if (fromApi.length) return fromApi;
      return normalizeCoinPreference(this.perf);
    },
  },
  created() {
    this.institutionId = this.$route.query.institutionId || this.$route.query.id || "";
    this.init();
  },
  methods: {
    formatRate(val) {
      const n = Number(val);
      return Number.isFinite(n) ? n.toFixed(2) : "0.00";
    },
    async init() {
      if (!this.institutionId) {
        this.pageLoading = false;
        return;
      }
      this.pageLoading = true;
      try {
        const res = await getCopyTradeInstitutionDetail({ institutionId: this.institutionId });
        if (res && res.data && res.data.code == 200) this.detail = res.data.data || {};
      } finally {
        this.pageLoading = false;
      }
      await this.loadPerformance();
    },
    async loadCoinPreference() {
      const payload = buildInstitutionChartPayload(this.institutionId, this.range);
      const isMy = this.perfTab === "my";
      const res = isMy
        ? await getCopyTradeMyCoinPreference(payload)
        : await getCopyTradeInstitutionCoinPreference(payload);
      let data = res && res.data && res.data.code == 200 ? res.data.data : null;
      let coins = normalizeCoinPreference(data);

      if (!coins.length) {
        const perfRes = isMy
          ? await getCopyTradeMyPerformance(payload)
          : await getCopyTradeInstitutionPerformance(payload);
        if (perfRes && perfRes.data && perfRes.data.code == 200) {
          data = perfRes.data.data || {};
          coins = normalizeCoinPreference(data);
        }
      }

      if (data) this.coinPerf = data;
    },
    async loadPerformance() {
      if (!this.institutionId) return;
      this.perfLoading = true;
      try {
        const payload = buildInstitutionChartPayload(this.institutionId, this.range);
        let res;
        if (this.perfTab === "my") {
          res = await getCopyTradeMyDailyChart(payload);
          if (!(res && res.data && res.data.code == 200)) res = await getCopyTradeMyPerformance(payload);
        } else {
          res = await getCopyTradeInstitutionDailyChart(payload);
          if (!(res && res.data && res.data.code == 200)) res = await getCopyTradeInstitutionPerformance(payload);
        }
        if (res && res.data && res.data.code == 200) this.perf = res.data.data || {};
        await this.loadCoinPreference();
      } finally {
        this.perfLoading = false;
      }
    },
    goStrategies() {
      this.$router.push({ path: "/copyTrade/strategies", query: { institutionId: this.institutionId } });
    },
  },
};
</script>

<style scoped lang="scss">
.inst-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 16px 20px;
}
.hero {
  display: flex;
  gap: 12px;
  margin: 16px 0;
}
.logo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}
.logo-empty {
  background: #edf8f2;
}
.rate {
  color: #17ac74;
  font-weight: 600;
}
.desc {
  color: #666;
  line-height: 1.6;
}
.rule {
  background: #f8faf9;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 12px;
  span {
    display: block;
    color: #888;
  }
}
.range-row {
  margin: 12px 0;
}
.perf h4 {
  margin: 16px 0 8px;
}
.foot {
  margin-top: 20px;
}
.coin-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.coin-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
</style>
