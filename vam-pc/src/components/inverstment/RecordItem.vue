<template>
  <div class="pcRow">
    <div class="col name">
      <div class="main">{{ itemObj.planTitle || '-' }}</div>
      <div class="sub">
        <span>{{ _t18('pledge_Buy') }}{{ _t18('k_time') }}：</span>
        <span class="fw-num">{{ itemObj.createTime || '-' }}</span>
      </div>
    </div>

    <div class="col days fw-num">{{ safeDays }}</div>
    <div class="col rate fw-num">{{ fmtRate(itemObj.avgRate) }}</div>

    <div class="col amount fw-num">
      {{ fmtAmount(itemObj.amount) }} {{ coinUpper }}
    </div>

    <div class="col est fw-num">
      {{ estIncome }} {{ coinUpper }}
    </div>

    <div class="col arrival fw-num">
      {{ arrivalText }}
    </div>

    <div class="col status fw-num" :style="{ color: statusInfo.color }">
      {{ statusInfo.name }}
    </div>
  </div>
</template>

<script>
import { timeOfreceipt, investmentStatus } from "@/utils/filters";
import { priceFormat } from "@/utils/decimal";
import { _t18 } from "@/utils/public";

export default {
  name: "RecordItem",
  props: {
    itemObj: { type: Object, default: () => ({}) },
  },
  computed: {
    coinUpper() {
      const c = this.itemObj && this.itemObj.coin;
      return c ? String(c).toUpperCase() : "";
    },
    safeDays() {
      const d = this.itemObj && this.itemObj.days;
      // Vue2 环境避免 ?? 语法，用更兼容的写法
      return d === undefined || d === null || d === "" ? "-" : d;
    },
    estIncome() {
      const amount = Number((this.itemObj && this.itemObj.amount) || 0);
      const days = Number((this.itemObj && this.itemObj.days) || 0);
      return priceFormat((amount * days * 0.05) / 100, 6);
    },
    arrivalText() {
      const sType = this.itemObj && this.itemObj.settlementType;
      const days = this.itemObj && this.itemObj.days;
      // 这里你原来写 props.itemObj?.params?.createTime，Vue2 用安全取值
      const ct =
        this.itemObj && this.itemObj.params ? this.itemObj.params.createTime : undefined;

      return timeOfreceipt(sType, days, ct) || "-";
    },
    statusInfo() {
      return investmentStatus(this.itemObj && this.itemObj.status) || {
        name: "-",
        color: "#999",
      };
    },
  },
  methods: {
    _t18,
    fmtRate(v) {
      if (v === 0 || v === "0") return "0%";
      if (v === undefined || v === null || v === "") return "-";
      return `${v}%`;
    },
    fmtAmount(v) {
      if (v === undefined || v === null || v === "") return "-";
      return v;
    },
  },
};
</script>

<style lang="scss" scoped>
.pcRow {
  display: grid;
  grid-template-columns: 2.2fr 0.8fr 0.9fr 1.2fr 1.2fr 1.3fr 0.9fr;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--ex-border-color);
  background: var(--ex-home-list-bgcolor);
  align-items: center;
  font-size: 13px;
  color: var(--ex-default-font-color);

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
}

.col { min-width: 0; }

.name .main {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name .sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--ex-passive-font-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.days, .rate, .status { text-align: center; }
.amount, .est, .arrival { text-align: right; }

.fw-num { font-variant-numeric: tabular-nums; }
</style>
