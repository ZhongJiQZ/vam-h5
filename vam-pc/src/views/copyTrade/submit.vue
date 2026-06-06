<template>
  <div class="submit-page" v-loading="pageLoading">
    <el-page-header @back="$router.back()" :content="$t('pc_copy_trade_submit_title')"></el-page-header>

    <div class="panel">
      <h3>{{ strategy.strategyName || "--" }}</h3>
      <p class="meta">{{ symbolPair(strategy.symbol) }} · {{ strategy.profitRate || 0 }}%/{{ strategy.cycleHours || 0 }}h</p>
      <p class="meta">{{ $t("pc_copy_trade_join_window") }}：{{ joinWindowText(strategy) }}</p>
      <p class="meta" v-if="strategy.tradeFeeRate != null">
        {{ $t("pc_copy_trade_trade_fee") }}：{{ strategy.tradeFeeRate }}%
      </p>
      <p class="meta">
        {{ $t("pc_copy_trade_profit_share_rate") }}：{{ profitShareRateText(strategy.profitShareRate) }}
        ({{ $t("pc_copy_trade_profit_share_rate_desc") }})
      </p>
      <p class="meta" v-if="strategy.followStatusText">{{ $t("pc_copy_trade_status") }}：{{ strategy.followStatusText }}</p>
    </div>

    <div class="panel">
      <el-form label-width="100px">
        <el-form-item v-if="needSecretKey" :label="$t('pc_copy_trade_inst_secret_ph')">
          <el-input v-model="secretKey" />
        </el-form-item>
        <el-form-item :label="$t('pc_copy_trade_amount')">
          <el-input v-model="amount" type="number" :placeholder="$t('pc_copy_trade_amount_placeholder')">
            <template slot="append">USDT</template>
          </el-input>
          <p class="range">{{ $t("pc_copy_trade_range") }}：{{ amountRangeText }}</p>
          <p class="range">{{ $t("pc_copy_trade_contract_balance") }}：{{ displayBalance }} USDT</p>
        </el-form-item>
        <el-form-item v-if="agreementDoc || riskDoc">
          <el-button v-if="agreementDoc" type="text" @click="showDoc(agreementDoc)">{{ $t("pc_copy_trade_agreement") }}</el-button>
          <el-button v-if="riskDoc" type="text" @click="showDoc(riskDoc)">{{ $t("pc_copy_trade_risk") }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">{{ $t("pc_copy_trade_follow_now") }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-drawer
      :title="activeDoc && activeDoc.title ? activeDoc.title : ''"
      :visible.sync="docDrawerVisible"
      direction="btt"
      size="75%"
      :wrapper-closable="true"
      custom-class="copy-doc-drawer"
    >
      <div v-if="activeDoc && activeDoc.content" class="doc-content" v-html="activeDoc.content"></div>
      <el-empty v-else :description="$t('pc_copy_trade_no_data')" />
      <div class="doc-drawer-foot">
        <el-button type="primary" @click="docDrawerVisible = false">{{ $t("utils.confirm") }}</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { submitCopyTrade, getCopyTradeStrategyDetail, getCopyTradeDocuments, getCopyTradeInstitutionDetail } from "@/api/copyTrade";
import {
  symbolPair,
  normalizeStrategyDetail,
  resolveStrategyAmountRange,
  parseCopyTradeStrategyQuery,
  formatAmountRangeText,
} from "./utils";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "CopyTradeSubmit",
  data() {
    return {
      strategy: {},
      institution: {},
      amount: "",
      secretKey: "",
      submitting: false,
      pageLoading: false,
      agreementDoc: null,
      riskDoc: null,
      docDrawerVisible: false,
      activeDoc: null,
    };
  },
  computed: {
    ...mapGetters(["userInfo"]),
    needSecretKey() {
      if (this.strategy.subscribed) return false;
      return this.strategy.secretKeyRequired !== false;
    },
    contractBalance() {
      if (this.userInfo && this.userInfo.asset && this.userInfo.asset.length > 0) {
        const cur = this.userInfo.asset.filter((item) => item.type == 3);
        return cur.length ? Number(cur[0].availableAmount || 0) : 0;
      }
      return 0;
    },
    displayBalance() {
      if (this.strategy.contractBalance != null && this.strategy.contractBalance !== "") {
        return this.strategy.contractBalance;
      }
      return this.contractBalance;
    },
    amountLimits() {
      return resolveStrategyAmountRange(this.strategy, this.institution);
    },
    amountRangeText() {
      const limits = this.amountLimits;
      return formatAmountRangeText(limits.minAmount, limits.maxAmount, "0");
    },
  },
  created() {
    this.parseStrategy();
    this.getUserInfo();
    if (this.$route.query.strategyId) this.loadStrategyDetail();
  },
  methods: {
    ...mapActions(["getUserInfo"]),
    symbolPair,
    parseStrategy() {
      const parsed = parseCopyTradeStrategyQuery(this.$route.query.data);
      if (parsed) {
        this.strategy = normalizeStrategyDetail(Object.assign({}, parsed, { id: parsed.id || this.$route.query.strategyId }));
      } else if (this.$route.query.strategyId) {
        this.strategy = { id: this.$route.query.strategyId };
      } else {
        this.strategy = {};
      }
      this.applyAmountLimits();
    },
    applyAmountLimits() {
      const limits = resolveStrategyAmountRange(this.strategy, this.institution);
      if (limits.minAmount != null) this.$set(this.strategy, "minAmount", limits.minAmount);
      if (limits.maxAmount != null) this.$set(this.strategy, "maxAmount", limits.maxAmount);
    },
    async loadStrategyDetail() {
      const strategyId = this.$route.query.strategyId || this.strategy.id;
      if (!strategyId) return;
      this.pageLoading = true;
      try {
        const res = await getCopyTradeStrategyDetail({ strategyId });
        if (res && res.data && res.data.code == 200 && res.data.data) {
          this.strategy = normalizeStrategyDetail(
            Object.assign({}, this.strategy, res.data.data, { id: res.data.data.id || strategyId })
          );
        }
        const institutionId = this.$route.query.institutionId || this.strategy.institutionId;
        if (institutionId) {
          const [instRes, a, r] = await Promise.all([
            getCopyTradeInstitutionDetail({ institutionId }),
            getCopyTradeDocuments({ type: "agreement", institutionId }),
            getCopyTradeDocuments({ type: "risk", institutionId }),
          ]);
          if (instRes && instRes.data && instRes.data.code == 200 && instRes.data.data) {
            this.institution = instRes.data.data;
          }
          if (a && a.data && a.data.code == 200) this.agreementDoc = a.data.data;
          if (r && r.data && r.data.code == 200) this.riskDoc = r.data.data;
        }
        this.applyAmountLimits();
      } finally {
        this.pageLoading = false;
      }
    },
    joinWindowText(item) {
      const start = item && item.joinStartTime;
      const end = item && item.joinEndTime;
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
    showDoc(doc) {
      if (!doc || !doc.content) return;
      this.activeDoc = doc;
      this.docDrawerVisible = true;
    },
    async submit() {
      if (this.strategy && this.strategy.canJoin === false) {
        this.$message.warning(this.strategy.followStatusText || this.$t("pc_copy_trade_unjoinable"));
        return;
      }
      const val = Number(this.amount);
      const limits = this.amountLimits;
      if (!val || limits.minAmount == null || limits.maxAmount == null || val < Number(limits.minAmount) || val > Number(limits.maxAmount)) {
        this.$message.warning(this.$t("pc_copy_trade_amount_invalid"));
        return;
      }
      if (val > Number(this.displayBalance)) {
        this.$message.warning(this.$t("pc_copy_trade_insufficient_balance"));
        return;
      }
      if (this.needSecretKey && !String(this.secretKey || "").trim()) {
        this.$message.warning(this.$t("pc_copy_trade_inst_secret_required"));
        return;
      }
      this.submitting = true;
      try {
        const payload = { strategyId: this.strategy.id, amount: val };
        if (this.needSecretKey) payload.secretKey = this.secretKey.trim();
        const res = await submitCopyTrade(payload);
        const msg = res && res.data && res.data.msg;
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
.doc-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.7;
  word-break: break-word;
  padding: 0 4px 16px;
}
.doc-drawer-foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 20px 20px;
  background: #fff;
  border-top: 1px solid #eee;
  text-align: center;
}
</style>

<style lang="scss">
.copy-doc-drawer .el-drawer__body {
  padding-bottom: 72px;
  overflow-y: auto;
}
</style>
