<template>
  <div class="copy-page">
    <div class="page-top">
      <h2 class="page-title">{{ $t("pc_copy_trade_inst_title") }}</h2>
      <el-button size="mini" type="primary" plain @click="$router.push('/copyTrade/my')">
        {{ $t("pc_copy_trade_my") }}
      </el-button>
    </div>

    <el-row :gutter="16" v-loading="loading">
      <el-col
        v-for="item in institutionList"
        :key="institutionRowId(item)"
        :xs="24"
        :sm="12"
        :md="8"
      >
        <div class="card inst-card" @click="goInstitution(item)">
          <div class="head flex-between">
            <div class="left flex-center">
              <img v-if="item.logo" :src="item.logo" class="avatar" />
              <div v-else class="avatar avatar-empty"></div>
              <div>
                <p class="name">{{ item.institutionName || item.title }}</p>
                <p class="subs">
                  {{ $t("pc_copy_trade_inst_subscribers", { n: subscriberCount(item) }) }}
                  <span v-if="item.totalProfitRate != null" class="rate">
                    · {{ formatRate(item.totalProfitRate) }}%
                  </span>
                </p>
              </div>
            </div>
            <el-button
              size="mini"
              :type="isInstitutionSubscribed(item) ? 'success' : 'default'"
              @click.stop="onSubscribeClick(item)"
            >
              {{ subscribeBtnText(item) }}
            </el-button>
          </div>
          <p v-if="item.description" class="desc">{{ item.description }}</p>
        </div>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && institutionList.length === 0" :description="$t('pc_copy_trade_inst_empty')" />

    <el-dialog
      :title="subscribeTarget.institutionName || subscribeTarget.title"
      :visible.sync="showSubscribe"
      width="420px"
      @close="secretKey = ''"
    >
      <p class="sub-hint">{{ $t("pc_copy_trade_inst_sub_hint") }}</p>
      <el-input v-model="secretKey" :placeholder="$t('pc_copy_trade_inst_secret_ph')" :disabled="subscribeLocked" />
      <p class="sub-warn">{{ $t("pc_copy_trade_inst_lock_warn") }}</p>
      <span slot="footer">
        <el-button @click="showSubscribe = false">{{ $t("utils.cancel") }}</el-button>
        <el-button type="primary" :loading="subscribeLoading" :disabled="subscribeLocked" @click="confirmSubscribe">
          {{ $t("pc_copy_trade_inst_subscribe") }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCopyTradeConfig,
  getCopyTradeInstitutionList,
  subscribeCopyTradeInstitution,
} from "@/api/copyTrade";
import {
  normalizeInstitutionListResponse,
  institutionRowId,
  isInstitutionSubscribed,
  institutionSubscriberCount,
  isInstitutionSecretLocked,
  isSecretKeyLockMessage,
  setInstitutionSecretLock,
  patchInstitutionSubscribed,
} from "./utils";

export default {
  name: "CopyTradeIndex",
  data() {
    return {
      loading: false,
      institutionList: [],
      showSubscribe: false,
      subscribeTarget: {},
      secretKey: "",
      subscribeLoading: false,
    };
  },
  computed: {
    subscribeLocked() {
      const id = institutionRowId(this.subscribeTarget);
      return isInstitutionSecretLocked(id);
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    institutionRowId,
    isInstitutionSubscribed,
    subscriberCount: institutionSubscriberCount,
    formatRate(val) {
      const n = Number(val);
      return Number.isFinite(n) ? n.toFixed(2) : "0.00";
    },
    subscribeBtnText(item) {
      const fromApi = String((item && item.subscribeText) || "").trim();
      if (fromApi) return fromApi;
      return isInstitutionSubscribed(item)
        ? this.$t("pc_copy_trade_inst_subscribed")
        : this.$t("pc_copy_trade_inst_subscribe");
    },
    async loadData() {
      this.loading = true;
      try {
        const [cfg, listRes] = await Promise.all([
          getCopyTradeConfig(),
          getCopyTradeInstitutionList({}),
        ]);
        if (cfg && cfg.data && cfg.data.data) {
          const d = cfg.data.data;
          if (!d.enabled || !d.canCopy) {
            this.$message.warning(d.note || this.$t("pc_copy_trade_disabled"));
          }
        }
        const parsed = normalizeInstitutionListResponse(listRes);
        this.institutionList = parsed.list.filter((item) => {
          const st = item && item.status;
          return st === undefined || st === null || st === "" || st === 1 || st === "1";
        });
      } finally {
        this.loading = false;
      }
    },
    goInstitution(item) {
      const id = institutionRowId(item);
      if (!id) return;
      if (!isInstitutionSubscribed(item)) {
        this.onSubscribeClick(item);
        return;
      }
      this.$router.push({ path: "/copyTrade/institution", query: { institutionId: id } });
    },
    onSubscribeClick(item) {
      if (isInstitutionSubscribed(item)) return;
      const id = institutionRowId(item);
      if (!id) return;
      if (isInstitutionSecretLocked(id)) {
        this.$message.warning(this.$t("pc_copy_trade_inst_locked"));
        return;
      }
      this.subscribeTarget = item;
      this.showSubscribe = true;
    },
    async confirmSubscribe() {
      const institutionId = institutionRowId(this.subscribeTarget);
      if (!institutionId || !this.secretKey) {
        this.$message.warning(this.$t("pc_copy_trade_inst_secret_required"));
        return;
      }
      this.subscribeLoading = true;
      try {
        const res = await subscribeCopyTradeInstitution({
          institutionId,
          secretKey: this.secretKey.trim(),
        });
        if (res && res.data && res.data.code == 200) {
          this.$message.success(res.data.msg || this.$t("pc_copy_trade_inst_sub_ok"));
          this.institutionList = patchInstitutionSubscribed(
            this.institutionList,
            institutionId,
            (res.data && res.data.data) || {}
          );
          this.showSubscribe = false;
        } else {
          const msg = (res && res.data && res.data.msg) || this.$t("error");
          this.$message.error(msg);
          if (isSecretKeyLockMessage(msg)) setInstitutionSecretLock(institutionId);
        }
      } finally {
        this.subscribeLoading = false;
      }
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
.card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 16px;
  cursor: pointer;
}
.head .avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}
.avatar-empty {
  background: #edf8f2;
}
.name {
  margin: 0 0 4px;
  font-weight: 600;
}
.subs {
  margin: 0;
  font-size: 12px;
  color: #888;
}
.rate {
  color: #17ac74;
  font-weight: 600;
}
.desc {
  margin: 10px 0 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}
.sub-hint,
.sub-warn {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px;
}
</style>
