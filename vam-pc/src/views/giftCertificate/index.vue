<template>
  <div class="gift-cert-pc">
    <div class="page-head">
      <h1 class="page-title">{{ $t("gift_cert.title") }}</h1>
      <div class="page-head-actions">
        <el-button
          type="warning"
          plain
          icon="el-icon-present"
          @click="openMyCodes"
          >{{ $t("gift_cert.my_codes_open") }}</el-button
        >
      </div>
    </div>

    <div class="page-body">
      <p v-if="batchesLoaded && !batches.length" class="empty-hint">
        {{ $t("gift_cert.empty_activity") }}
      </p>

      <div v-if="primaryBatch" class="batch-pill">
        <span class="label">{{ $t("gift_cert.current_activity") }}</span>
        <span class="name">{{
          primaryBatch.name || $t("gift_cert.voucher_name_fallback")
        }}</span>
      </div>

      <el-card class="block-card" shadow="hover">
        <div class="code-actions">
          <el-input
            v-model="voucherCode"
            clearable
            :placeholder="$t('gift_cert.placeholder_code')"
            class="code-input"
          />
          <el-button
            type="primary"
            :loading="claimLoading"
            @click="onClaim"
            >{{ $t("gift_cert.redeem") }}</el-button
          >
          <el-button
            type="primary"
            plain
            :loading="allocateLoading"
            :disabled="!progress.canClaim"
            @click="onAllocate"
            >{{ $t("gift_cert.claim") }}</el-button
          >
        </div>
        <div class="progress-block">
          <p class="progress-caption">
            {{
              $t("gift_cert.progress_recharged", {
                cur: progressDisplayCur,
                tgt: progressDisplayTgt,
                sym: progressCurrency,
              })
            }}
          </p>
          <el-progress
            :percentage="progressPercentCapped"
            :stroke-width="12"
            :show-text="false"
            color="#409EFF"
          />
        </div>
      </el-card>

      <el-card class="block-card feed-card" shadow="hover">
        <div class="feed-title">
          <span class="dot" />
          <span>{{ $t("gift_cert.section_live") }}</span>
        </div>
        <div class="feed-window">
          <div
            v-if="feedLines.length"
            class="feed-marquee"
            :style="{ '--feed-duration': Math.max(feedLines.length * 4, 12) + 's' }"
          >
            <div class="feed-track">
              <p
                v-for="(line, idx) in feedLines"
                :key="'a-' + idx"
                class="feed-line"
              >
                {{ line }}
              </p>
              <p
                v-for="(line, idx) in feedLines"
                :key="'b-' + idx"
                class="feed-line"
              >
                {{ line }}
              </p>
            </div>
          </div>
          <p v-else class="feed-empty">{{ $t("gift_cert.feed_empty") }}</p>
        </div>
      </el-card>

      <el-card class="block-card rules-card" shadow="never">
        <section class="rule-block">
          <h3>{{ $t("gift_cert.rule_participate_title") }}</h3>
          <p>
            {{
              $t("gift_cert.rule_participate_body", { hint: conditionHint })
            }}
          </p>
        </section>
        <section class="rule-block">
          <h3>{{ $t("gift_cert.rule_guide_title") }}</h3>
          <p>{{ $t("gift_cert.rule_guide_body") }}</p>
        </section>
        <section class="rule-block rule-block--last">
          <h3>{{ $t("gift_cert.rule_trial_title") }}</h3>
          <p>{{ $t("gift_cert.rule_trial_body") }}</p>
        </section>
      </el-card>
    </div>

    <el-dialog
      :title="$t('gift_cert.my_codes_title')"
      :visible.sync="myCodesDialogVisible"
      width="480px"
      append-to-body
      custom-class="gift-my-codes-dialog"
    >
      <div v-loading="myCodesLoading" class="my-codes-dialog-body">
        <p v-if="!myCodesLoading && !myCodesRows.length" class="dlg-empty">
          {{ $t("gift_cert.my_codes_empty") }}
        </p>
        <ul v-else class="my-codes-list">
          <li
            v-for="(row, idx) in myCodesRows"
            :key="row.key"
            class="my-codes-row"
            :class="{ 'is-inactive': row.inactive }"
          >
            <span class="code-text">{{ row.code }}</span>
            <el-button
              size="mini"
              :plain="!row.inactive"
              :class="{ 'is-muted': row.inactive }"
              @click="copyCode(row.code)"
              >{{ $t("gift_cert.copy_btn") }}</el-button
            >
          </li>
        </ul>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { Message } from "element-ui";
import {
  giftAllocate,
  giftBatchList,
  giftClaim,
  giftClaimFeed,
  giftMyCodes,
  giftProgress,
} from "@/api/giftCertificate";

export default {
  name: "GiftCertificatePc",
  data() {
    return {
      batches: [],
      batchesLoaded: false,
      voucherCode: "",
      claimLoading: false,
      allocateLoading: false,
      feedRaw: [],
      progress: {
        segmentProgress: 0,
        segmentTarget: 0,
        slotsEarned: 0,
        claimableRemaining: 0,
        canClaim: false,
        milestoneRepeat: 0,
        currency: "",
        conditionLimit: null,
        percent: null,
      },
      myCodesDialogVisible: false,
      myCodesLoading: false,
      myCodesRows: [],
    };
  },
  computed: {
    ...mapGetters(["isLogin"]),
    primaryBatch() {
      return this.batches[0] || null;
    },
    primaryBatchId() {
      const id = this.primaryBatch && this.primaryBatch.id;
      return id != null && id !== "" ? id : null;
    },
    progressCurrency() {
      const b = this.primaryBatch;
      return (
        this.progress.currency ||
        (b && (b.currency || b.coin || b.asset)) ||
        "USDC"
      );
    },
    conditionHint() {
      const lim =
        this.progress.conditionLimit ||
        (this.primaryBatch &&
          (this.primaryBatch.condition_limit || this.primaryBatch.conditionLimit)) ||
        "1000 USDC";
      return typeof lim === "number"
        ? `${lim} ${this.progressCurrency}`
        : `${lim}`;
    },
    progressDisplayCur() {
      const g =
        this.primaryBatch && this.primaryBatch.giftCertificateProgress;
      if (g && g.segmentProgress != null) return g.segmentProgress;
      return (
        this.progress.segmentProgress ||
        (g && (g.currentValue ?? g.totalRecharge)) ||
        0
      );
    },
    progressDisplayTgt() {
      const g =
        this.primaryBatch && this.primaryBatch.giftCertificateProgress;
      if (g && g.segmentTarget != null) return g.segmentTarget;
      const t =
        this.progress.segmentTarget ||
        (g && g.conditionLimit) ||
        (this.primaryBatch && this.primaryBatch.conditionLimit);
      return t != null && t !== "" ? t : "-";
    },
    progressPercent() {
      if (
        typeof this.progress.percent === "number" &&
        !Number.isNaN(this.progress.percent)
      ) {
        return Math.min(100, Math.max(0, Math.round(this.progress.percent)));
      }
      const cur = Number(this.progressDisplayCur) || 0;
      const tgt = Number(this.progressDisplayTgt) || 0;
      if (tgt <= 0) return 0;
      return Math.min(100, Math.round((cur / tgt) * 100));
    },
    progressPercentCapped() {
      return Math.min(100, Math.max(0, this.progressPercent));
    },
    feedLines() {
      const list = this.feedRaw;
      if (!Array.isArray(list) || !list.length) return [];
      const t = this.$t.bind(this);
      return list.map((item) => this.formatFeedLine(item, t)).filter(Boolean);
    },
  },
  watch: {
    $route() {
      this.setDocTitle();
    },
  },
  created() {
    this.init();
  },
  methods: {
    setDocTitle() {
      document.title = this.$t("gift_cert.title");
    },
    async init() {
      this.setDocTitle();
      await this.loadBatches();
      await Promise.all([this.loadFeed(), this.loadProgress()]);
    },
    normalizeList(res) {
      const body = res && res.data ? res.data : {};
      const d = body.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(body.rows)) return body.rows;
      if (d && Array.isArray(d.list)) return d.list;
      if (d && Array.isArray(d.records)) return d.records;
      return [];
    },
    formatFeedLine(item, tFn) {
      if (item == null) return "";
      if (typeof item === "string") return item;
      const uid =
        item.maskUid ||
        item.maskedUid ||
        (item.uid != null
          ? String(item.uid).replace(/(\d{2})\d+(\d{2})/, "$1*****$2")
          : "");
      const amt = item.amount ?? item.voucherAmount ?? item.usdc ?? "";
      const cur = item.currency ?? "USDC";
      if (item.zh || item.cn) return item.zh || item.cn;
      if (item.en) return item.en;
      if (uid && amt !== "") {
        return tFn("gift_cert.feed_congrats", { uid, amt, cur });
      }
      if (item.msg || item.message) return item.msg || item.message;
      try {
        return JSON.stringify(item);
      } catch (e) {
        return String(item);
      }
    },
    applyEmbeddedProgress(batch) {
      const g = batch && batch.giftCertificateProgress;
      if (!g) return;
      const segP = g.segmentProgress;
      const segT = g.segmentTarget;
      if (segP != null && segT != null) {
        this.progress.segmentProgress = segP;
        this.progress.segmentTarget = segT;
        this.progress.percent = null;
      } else {
        this.progress.segmentProgress = g.currentValue ?? g.totalRecharge ?? 0;
        this.progress.segmentTarget =
          g.conditionLimit ?? batch.conditionLimit ?? 0;
        this.progress.percent = typeof g.percent === "number" ? g.percent : null;
      }
      this.progress.slotsEarned = g.slotsEarned ?? 0;
      this.progress.claimableRemaining = g.claimableRemaining ?? 0;
      this.progress.canClaim = !!g.canClaim;
      this.progress.milestoneRepeat =
        g.milestoneRepeat ?? batch.milestoneRepeat ?? 0;
      this.progress.conditionLimit =
        g.conditionLimit ?? batch.conditionLimit ?? null;
    },
    async loadBatches() {
      try {
        const res = await giftBatchList({});
        this.batches = this.normalizeList(res);
        const first = this.batches[0];
        if (first) this.applyEmbeddedProgress(first);
        else {
          this.progress.segmentProgress = 0;
          this.progress.segmentTarget = 0;
          this.progress.canClaim = false;
          this.progress.milestoneRepeat = 0;
          this.progress.percent = null;
          this.progress.conditionLimit = null;
        }
      } finally {
        this.batchesLoaded = true;
      }
    },
    async loadFeed() {
      try {
        const res = await giftClaimFeed({});
        this.feedRaw = this.normalizeList(res);
      } catch (e) {
        this.feedRaw = [];
      }
    },
    async loadProgress() {
      const id = this.primaryBatchId;
      if (id == null) {
        this.progress.segmentProgress = 0;
        this.progress.segmentTarget = 0;
        this.progress.canClaim = false;
        this.progress.milestoneRepeat = 0;
        this.progress.percent = null;
        return;
      }
      try {
        const res = await giftProgress({ batchId: id });
        const body = res && res.data ? res.data : {};
        const d = body.data != null ? body.data : body;
        const segP = d.segmentProgress ?? d.segment_progress;
        const segT = d.segmentTarget ?? d.segment_target;
        if (segP != null && segT != null) {
          this.progress.segmentProgress = segP;
          this.progress.segmentTarget = segT;
          this.progress.percent = null;
        } else {
          this.progress.segmentProgress =
            d.currentValue ?? d.current ?? d.totalRecharge ?? 0;
          this.progress.segmentTarget =
            d.conditionLimit ??
            d.target ??
            d.condition_limit ??
            (this.primaryBatch && this.primaryBatch.conditionLimit) ??
            0;
          this.progress.percent =
            typeof d.percent === "number" ? d.percent : null;
        }
        this.progress.slotsEarned = d.slotsEarned ?? 0;
        this.progress.claimableRemaining =
          d.claimableRemaining ?? d.claimable_remaining ?? 0;
        this.progress.canClaim = !!(d.canClaim ?? d.can_claim);
        this.progress.milestoneRepeat =
          d.milestoneRepeat ?? d.milestone_repeat ?? 0;
        this.progress.currency = d.currency ?? d.coin ?? "";
        this.progress.conditionLimit =
          d.condition_limit ??
          d.conditionLimit ??
          (this.primaryBatch && this.primaryBatch.conditionLimit) ??
          null;
      } catch (e) {
        if (this.primaryBatch) this.applyEmbeddedProgress(this.primaryBatch);
      }
    },
    normalizeMyCodeRow(item, index) {
      if (typeof item === "string") {
        return {
          code: item,
          inactive: false,
          key: "c-" + index + "-" + item.slice(0, 12),
        };
      }
      const code =
        item.code ??
        item.giftCode ??
        item.certificateCode ??
        item.voucherCode ??
        item.redeemCode ??
        "";
      const status = item.status ?? item.useStatus ?? item.state;
      const inactive = !!(
        item.used === true ||
        item.isUsed === true ||
        item.usedFlag === 1 ||
        item.usedFlag === "1" ||
        status === 2 ||
        status === "2" ||
        status === "USED" ||
        status === "used" ||
        status === "EXPIRED" ||
        status === "expired" ||
        item.redeemed === true ||
        item.isExpired === true
      );
      return {
        code: String(code),
        inactive,
        key: String(item.id || String(index) + "-" + code).slice(0, 48),
      };
    },
    normalizeMyCodesRows(res) {
      return this.normalizeList(res)
        .map((item, index) => this.normalizeMyCodeRow(item, index))
        .filter((r) => r.code);
    },
    async fetchMyCodesList() {
      this.myCodesLoading = true;
      this.myCodesRows = [];
      try {
        const res = await giftMyCodes({});
        this.myCodesRows = this.normalizeMyCodesRows(res);
      } catch (e) {
        this.myCodesRows = [];
      } finally {
        this.myCodesLoading = false;
      }
    },
    openMyCodes() {
      if (!this.isLogin) {
        Message.warning(this.$t("gift_cert.toast_login"));
        this.$router.push({ path: "/user/login" });
        return;
      }
      this.myCodesDialogVisible = true;
      this.$nextTick(() => this.fetchMyCodesList());
    },
    copyCode(text) {
      if (!text) return;
      this.$copyText(String(text)).then(
        () => {
          Message.success(this.$t("utils.copySuccess"));
        },
        () => {
          Message.error(this.$t("utils.copyFail"));
        }
      );
    },
    async onClaim() {
      const code = (this.voucherCode || "").trim();
      if (!code) {
        Message.warning(this.$t("gift_cert.toast_input_code"));
        return;
      }
      if (!this.isLogin) {
        Message.warning(this.$t("gift_cert.toast_login"));
        this.$router.push({ path: "/user/login" });
        return;
      }
      this.claimLoading = true;
      try {
        await giftClaim({ code });
        Message.success(this.$t("gift_cert.toast_claim_ok"));
        this.voucherCode = "";
        await this.loadBatches();
        await this.loadProgress();
        this.loadFeed();
      } catch (e) {
        /* axios 拦截器已提示 */
      } finally {
        this.claimLoading = false;
      }
    },
    async onAllocate() {
      const id = this.primaryBatchId;
      if (id == null) {
        Message.warning(this.$t("gift_cert.toast_no_activity"));
        return;
      }
      if (!this.isLogin) {
        Message.warning(this.$t("gift_cert.toast_login"));
        this.$router.push({ path: "/user/login" });
        return;
      }
      if (!this.progress.canClaim) {
        Message.warning(this.$t("gift_cert.toast_allocate_denied"));
        return;
      }
      this.allocateLoading = true;
      try {
        await giftAllocate({ batchId: id });
        Message.success(this.$t("gift_cert.toast_allocate_ok"));
        await this.loadBatches();
        await this.loadProgress();
        this.loadFeed();
      } catch (e) {
        /* 已提示 */
      } finally {
        this.allocateLoading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.gift-cert-pc {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  min-height: calc(100vh - 120px);
  box-sizing: border-box;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.page-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-hint {
  text-align: center;
  color: #909399;
  margin: 0;
  padding: 16px;
}

.batch-pill {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  .label {
    color: #909399;
    font-size: 14px;
  }
  .name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.block-card {
  border-radius: 8px;
}

.code-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.code-input {
  flex: 1;
  min-width: 200px;
  max-width: 360px;
}

.progress-block {
  .progress-caption {
    margin: 0 0 10px;
    font-size: 14px;
    color: #606266;
  }
}

.feed-card {
  .feed-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e6a23c, #f56c6c);
    }
  }
}

.feed-window {
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
  background: linear-gradient(180deg, #fdf6ec 0%, #faecd8 100%);
  border: 1px solid #f5dab1;
  padding: 8px 14px;
}

.feed-empty {
  text-align: center;
  color: #909399;
  padding: 40px 0;
  margin: 0;
}

.feed-marquee {
  height: 100%;
  overflow: hidden;
}

.feed-track {
  animation: gift-feed-scroll linear infinite;
  animation-duration: var(--feed-duration, 24s);
}

.feed-line {
  font-size: 13px;
  line-height: 1.55;
  padding: 8px 0;
  color: #c45656;
  border-bottom: 1px dashed rgba(196, 86, 86, 0.25);
  margin: 0;
}

@keyframes gift-feed-scroll {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.rules-card {
  .rule-block {
    margin-bottom: 20px;
    padding-left: 12px;
    border-left: 3px solid #409eff;
    h3 {
      margin: 0 0 10px;
      font-size: 15px;
      color: #303133;
    }
    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.7;
      color: #606266;
    }
  }
  .rule-block--last {
    margin-bottom: 0;
  }
}

.my-codes-dialog-body {
  min-height: 120px;
}

.dlg-empty {
  text-align: center;
  color: #909399;
  padding: 24px 0;
  margin: 0;
}

.my-codes-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.my-codes-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #ebeef5;
  &:last-child {
    border-bottom: none;
  }
  .code-text {
    flex: 1;
    min-width: 0;
    word-break: break-all;
    font-size: 13px;
    color: #303133;
  }
  &.is-inactive .code-text {
    color: #c0c4cc;
  }
}

.my-codes-row .is-muted {
  color: #c0c4cc !important;
  border-color: #dcdfe6 !important;
}
</style>

<style lang="scss">
.gift-my-codes-dialog .el-dialog__title {
  color: #f56c6c;
  font-weight: 600;
}
</style>
