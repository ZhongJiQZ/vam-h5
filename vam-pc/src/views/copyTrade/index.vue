<template>
  <div class="copy-page">
    <div class="page-top">
      <h2 class="page-title">{{ $t("pc_copy_trade_title") }}</h2>
      <el-button size="mini" type="primary" plain @click="$router.push('/copyTrade/my')">
        {{ $t("pc_copy_trade_my") }}
      </el-button>
    </div>

    <!-- <div v-if="configNote" class="note">{{ configNote }}</div> -->

    <el-row :gutter="16" v-loading="loading">
      <el-col v-for="item in list" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
        <div class="card">
          <div class="head flex-between">
            <div class="left flex-center">
              <img v-if="item.icon" :src="item.icon" class="avatar" />
              <div v-else class="avatar avatar-empty"></div>
              <div>
                <p class="name">{{ item.strategyName }}</p>
                <p class="symbol">{{ symbolPair(item.symbol) }}</p>
              </div>
            </div>
          <el-tag size="mini" :type="statusType(item)">{{ item.followStatusText || $t("pc_copy_trade_unknown_status") }}</el-tag>
          </div>

          <div class="meta">{{ $t("pc_copy_trade_rate") }}：<span class="rate">{{ item.profitRate }}% / {{ item.cycleHours }}h</span></div>
          <div class="meta">{{ $t("pc_copy_trade_join_window") }}：{{ joinWindowText(item) }}</div>
          <div class="meta">{{ $t("pc_copy_trade_amount") }}：{{ item.minAmount }} ~ {{ item.maxAmount }} USDT</div>
          <div class="desc" v-if="item.description">{{ item.description }}</div>

          <el-button
            class="btn"
            type="primary"
            size="small"
            :disabled="item.canJoin === false"
            @click="toSubmit(item)"
          >
            {{ item.canJoin === false ? (item.followStatusText || $t("pc_copy_trade_unjoinable")) : $t("pc_copy_trade_follow_now") }}
          </el-button>
        </div>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && list.length === 0" :description="$t('pc_copy_trade_empty')">
      <el-button size="mini" type="primary" @click="$router.push('/copyTrade/my')">
        {{ $t("pc_copy_trade_my") }}
      </el-button>
    </el-empty>
  </div>
</template>

<script>
import { getCopyTradeConfig, getCopyTradeStrategyList } from "@/api/copyTrade";

export default {
  name: "CopyTradeIndex",
  data() {
    return {
      loading: false,
      configNote: "",
      list: [],
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const [cfg, res] = await Promise.all([getCopyTradeConfig(), getCopyTradeStrategyList()]);
    if (cfg && cfg.data && cfg.data.data) {
          const d = cfg.data.data;
          this.configNote = d.note || "";
          if (!d.enabled || !d.canCopy) {
            this.$message.warning(d.note || this.$t("pc_copy_trade_disabled"));
          }
        }
        this.list = res && res.data && res.data.data ? res.data.data : [];
      } finally {
        this.loading = false;
      }
    },
    symbolPair(symbol) {
      const s = String(symbol || "").toUpperCase();
      if (!s) return "--";
      return s.includes("/") ? s : `${s}/USDT`;
    },
    statusType(item) {
      const s = Number(item && item.followStatus != null ? item.followStatus : 0);
      if (s === 0) return "success";
      if (s === 1) return "";
      return "info";
    },
    joinWindowText(item) {
      const start = item && item.joinStartTime;
      const end = item && item.joinEndTime;
      if (start && end) return `${start} ~ ${end}`;
      if (start && !end) return `${start} ~ ${this.$t("pc_copy_trade_no_limit")}`;
      if (!start && end) return `${this.$t("pc_copy_trade_no_limit")} ~ ${end}`;
      return this.$t("pc_copy_trade_no_limit");
    },
    toSubmit(item) {
      if (item && item.canJoin === false) {
        this.$message.warning(item.followStatusText || this.$t("pc_copy_trade_unjoinable"));
        return;
      }
      this.$router.push({
        path: "/copyTrade/submit",
        query: { data: encodeURIComponent(JSON.stringify(item)) },
      });
    },
  },
};
</script>

<style scoped lang="scss">
.copy-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 0 20px 0;
  box-sizing: border-box;
}
.page-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.page-title {
  margin: 0;
}
.note {
  margin-bottom: 14px;
  background: #fff6e6;
  border-radius: 6px;
  padding: 10px 12px;
  color: #9b6b00;
  font-size: 12px;
}
.card {
  background: #fff;
  border: 1px solid #eceff3;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 16px;
}
.head {
  margin-bottom: 10px;
}
.left {
  gap: 10px;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-empty {
  background: #eef2f8;
}
.name {
  margin: 0;
  font-weight: 600;
}
.symbol {
  margin: 4px 0 0;
  font-size: 12px;
  color: #8c93a1;
}
.meta {
  font-size: 12px;
  color: #667085;
  margin-top: 6px;
}
.rate {
  color: #17ac74;
  font-weight: 600;
}
.desc {
  margin-top: 8px;
  font-size: 12px;
  color: #8c93a1;
}
.btn {
  margin-top: 12px;
  width: 100%;
}
</style>
