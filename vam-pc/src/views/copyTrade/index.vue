<template>
  <div class="copy-page">
    <div class="page-top">
      <div class="page-title-wrap">
        <h2 class="page-title">{{ $t("pc_copy_trade_inst_title") }}</h2>
        <el-button
          class="info-btn"
          type="text"
          icon="el-icon-info"
          :title="$t('pc_copy_trade_intro_doc_title')"
          @click="showIntro = true"
        />
      </div>
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

    <el-drawer
      :title="introDoc.title"
      :visible.sync="showIntro"
      direction="btt"
      size="75%"
      :wrapper-closable="true"
      custom-class="copy-doc-drawer"
    >
      <div v-if="introDoc.content" class="doc-content" v-html="introDoc.content"></div>
      <el-empty v-else :description="$t('pc_copy_trade_no_data')" />
      <div class="doc-drawer-foot">
        <el-button type="primary" @click="showIntro = false">{{ $t("utils.confirm") }}</el-button>
      </div>
    </el-drawer>
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
import { getCopyTradeIntroDoc } from "./documents";

export default {
  name: "CopyTradeIndex",
  data() {
    return {
      loading: false,
      institutionList: [],
      showSubscribe: false,
      showIntro: false,
      subscribeTarget: {},
      secretKey: "",
      subscribeLoading: false,
    };
  },
  computed: {
    introDoc() {
      return getCopyTradeIntroDoc((key) => this.$t(key));
    },
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
      const id = institutionRowId(item);
      if (!id) return;
      if (isInstitutionSubscribed(item)) {
        this.$router.push({ path: "/copyTrade/institution", query: { institutionId: id } });
        return;
      }
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
.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}
.page-title {
  margin: 0;
}
.info-btn {
  padding: 4px;
  font-size: 18px;
  color: #17ac74;
}
.doc-content {
  padding: 0 4px 16px;
  font-size: 14px;
  color: #374151;
  line-height: 1.7;
  word-break: break-word;
}
.doc-content :deep(p) {
  margin: 0 0 12px;
}
.doc-content :deep(h3) {
  margin: 16px 0 8px;
  font-size: 15px;
  color: #111;
}
.doc-drawer-foot {
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px));
  text-align: center;
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
