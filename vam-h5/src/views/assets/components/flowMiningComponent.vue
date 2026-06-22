<!-- src/views/assets/components/flowMiningComponent.vue -->
<template>
  <div class="flow-mining">
    <van-tabs
      shrink
      v-model:active="statusActive"
      class="flow-mining__status-tabs"
      :line-width="0"
      @click-tab="onClickStatusTab"
    >
      <van-tab :title="_t18('records.total')" name="" />
      <van-tab :title="_t18('records.inProgress')" name="0" />
      <van-tab :title="_t18('records.completed')" name="1" />
      <van-tab :title="_t18('records.redeemed')" name="2" />
    </van-tabs>

    <div class="list-wrap">
      <van-pull-refresh
        v-model="refreshing"
        :pulling-text="_t18('loading')"
        :loosing-text="_t18('release_refresh') || _t18('loading')"
        :loading-text="_t18('loading')"
        :success-text="''"
        @refresh="onRefresh"
      >
        <van-list
          v-model:loading="loading"
          :finished="finished"
          :finished-text="miningList.length ? (_t18('utils.noMore') || _t18('no_more_data')) : ''"
          :loading-text="_t18('loading')"
          :error-text="_t18('error') || ''"
          @load="onLoad"
        >
          <template v-if="miningList.length">
            <div class="card" v-for="row in miningList" :key="row.id">
              <div class="kv">
                <div class="k">{{ _t18('records.pledgeAmount') }} (USDT)</div>
                <div class="v">{{ row.amount }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.dayRate') }}</div>
                <div class="v v--accent">{{ row.minOdds }}% ~ {{ row.maxOdds }}%</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.cycle') }} ({{ _t18('utils.day') }})</div>
                <div class="v">{{ row.days }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.beginTime') }}</div>
                <div class="v">{{ formatAssetRecordTime(row, 'begin') }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.endTime') }}</div>
                <div class="v">{{ formatAssetRecordTime(row, 'end') }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.PNL') }}</div>
                <div class="v v--profit">{{ row.accumulaEarn }} USDT</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.status') }}</div>
                <div class="v">
                  <span class="status-chip" :class="statusChipClass(row.status)">
                    {{ formatStatus(row.status) }}
                  </span>
                </div>
              </div>

              <div class="actions" v-if="String(row.status) === '0'">
                <van-button
                  block
                  round
                  class="btn-redeem"
                  @click="onRedeem(row)"
                >
                  {{ _t18('records.redemption') }}
                </van-button>
              </div>
            </div>
          </template>

          <div v-else-if="!loading && !refreshing" class="fm-empty">
            <img :src="iconEmpty" alt="" class="fm-empty__icon" />
            <p class="fm-empty__text">{{ _t18('utils.noData') || _t18('no_data') }}</p>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { showToast, showConfirmDialog } from "vant";
import { _t18 } from "@/utils/public";
import { formatAssetRecordTime } from "@/utils/time";
import { getRecordList } from "@/api/assets";
import { redemption } from "@/api/pledge";
import { useI18n } from 'vue-i18n'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'
const { t:i18nT } = useI18n() // ✅ 顶层
// ====== 状态 ======
const statusActive = ref(""); // ""=全部；"0/1/2"=对应状态
const pageNum = ref(1);
const pageSize = 10;

// ✅ 名称明确
const miningList = ref([]);
const miningTotal = ref(0);

const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);

const formatStatus = (e) => {
  if (String(e) === "0") return _t18("records.inProgress");
  if (String(e) === "1") return _t18("records.completed");
  return _t18("records.redeemed");
};

const statusChipClass = (e) => {
  if (String(e) === "0") return "status-chip--progress";
  if (String(e) === "1") return "status-chip--done";
  return "status-chip--redeemed";
};

// ====== 关键：你接口返回是 { code, msg, total, rows }，不是 res.data.rows ======
const fetchMiningList = async ({ reset = false } = {}) => {
  try {
    if (reset) {
      pageNum.value = 1;
      finished.value = false;
      miningList.value = [];
    }

    loading.value = true;
    const status = statusActive.value === "" ? "" : Number(statusActive.value)
    const res = await getRecordList(
      {
        pageNum: pageNum.value,
        pageSize,
        status: status, // "" / "0" / "1" / "2"
      },
      "mingOrder"
    );

    // ✅ 兼容两种返回：
    // 1) axios 标准：res.data.rows
    // 2) 你截图这种：res.rows（后端直接返回或 request 已经做了 unwrap）
    const payload = res?.data ? res.data : res;
    const rows = payload?.rows || [];
    const t = Number(payload?.total || 0);

    miningTotal.value = t;

    if (pageNum.value === 1) miningList.value = rows;
    else miningList.value = miningList.value.concat(rows);

    // 是否结束
    if (miningList.value.length >= t || rows.length < pageSize) finished.value = true;

    pageNum.value += 1;
  } catch (e) {
    showToast(e?.message || "load failed");
    finished.value = true;
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

// van-list：首次进入会触发一次 load
const onLoad = () => fetchMiningList({ reset: false });

const onRefresh = () => {
  refreshing.value = true;
  fetchMiningList({ reset: true });
};

const onClickStatusTab = () => {
  // 切换状态：重置并重拉
  fetchMiningList({ reset: true });
};

const onRedeem = async (row) => {
  // console.log("row ",row.id);
  if (!row?.id) return;

  try {
    await showConfirmDialog({
      title: i18nT("records.redemption"),
      message: i18nT("utils.confirm") || "确认赎回？",
      confirmButtonText: i18nT("utils.confirm") || "确认",
      cancelButtonText: i18nT("utils.cancel") || "取消",
      className: 'fm-redeem-dialog',
      width: '320px'
    });

    const res = await redemption({ id: row.id });
    const payload = res?.data ? res.data : res;

    if (payload?.code === 200) {
      showToast(payload?.msg || "success");
      fetchMiningList({ reset: true });
    } else {
      showToast(payload?.msg || "failed");
    }
  } catch (e) {
    // cancel 或异常不处理
    console.log("onRedeem error",e)
  }
};
</script>

<style scoped lang="scss">
.flow-mining {
  width: 100%;
}

/* 状态子 tab — 跟其他子 tab 同款紫色短下划线 */
.flow-mining__status-tabs {
  :deep(.van-tabs__wrap) {
    height: 40px;
    background: transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  :deep(.van-tabs__nav) {
    background: transparent !important;
    padding: 0 4px;
  }

  :deep(.van-tab) {
    flex: none;
    padding: 0;
    margin-right: 22px;
    font-size: 13px;
    background: transparent !important;
    color: rgba(255, 255, 255, 0.55) !important;
  }

  :deep(.van-tab__text) {
    font-weight: 500;
  }

  :deep(.van-tab--active .van-tab__text) {
    color: #fff !important;
    font-weight: 600;
  }

  :deep(.van-tab--active::after) {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    width: 18px;
    height: 3px;
    background: #a13cff;
    border-radius: 2px;
  }

  :deep(.van-tabs__line) {
    display: none !important;
  }
}

.list-wrap {
  padding: 14px 4px 24px;
  background: transparent;
}

:deep(.van-pull-refresh) {
  background: transparent;
}

:deep(.van-list__finished-text),
:deep(.van-list__loading-text) {
  color: rgba(255, 255, 255, 0.45);
}

/* 暗紫卡 */
.card {
  background: #1a1626;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 14px 10px;
  margin-bottom: 12px;
}

.kv {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  min-height: 24px;
}

.k {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  flex: 0 0 45%;
}

.v {
  font-size: 13px;
  color: #fff;
  font-weight: 500;
  text-align: right;
  flex: 1;
  word-break: break-all;
  font-variant-numeric: tabular-nums;
}

.v--accent {
  color: rgb(196, 124, 255);
  font-weight: 600;
}

.v--profit {
  color: #5fd5a4;
  font-weight: 600;
}

/* status chip */
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
  letter-spacing: 0.2px;
}

.status-chip--progress {
  background: rgba(78, 166, 255, 0.16);
  color: #4ea6ff;
}

.status-chip--done {
  background: rgba(95, 213, 164, 0.16);
  color: #5fd5a4;
}

.status-chip--redeemed {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
}

.actions {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* 赎回按钮 — 紫渐变胶囊 */
:deep(.btn-redeem.van-button) {
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #fff !important;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.32);
}

/* 空态 */
.fm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0 24px;
}

.fm-empty__icon {
  display: block;
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.fm-empty__text {
  margin: 10px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
</style>

<!-- 赎回确认弹窗 — vant 把 dialog teleport 到 body，scoped 触不到，全局 + className 限定 -->
<style lang="scss">
.fm-redeem-dialog.van-dialog {
  background: transparent !important;
  border-radius: 18px !important;
  overflow: hidden !important;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(160, 65, 237, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
}

.fm-redeem-dialog .van-dialog__header {
  padding: 22px 20px 8px;
  background:
    radial-gradient(120% 110% at 100% 0%, rgba(160, 65, 237, 0.28) 0%, rgba(160, 65, 237, 0) 60%),
    linear-gradient(155deg, rgba(60, 26, 110, 0.65) 0%, rgba(30, 21, 48, 0.95) 60%);
  color: #fff !important;
  font-size: 17px !important;
  font-weight: 600 !important;
  text-align: center;
  letter-spacing: 0.01em;
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
}

.fm-redeem-dialog .van-dialog__content {
  padding: 8px 22px 22px;
  background:
    linear-gradient(155deg, rgba(60, 26, 110, 0.55) 0%, rgba(30, 21, 48, 0.92) 60%);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
}

.fm-redeem-dialog .van-dialog__message {
  color: rgba(255, 255, 255, 0.82) !important;
  font-size: 13px !important;
  line-height: 1.65 !important;
  text-align: center !important;
  padding: 0 !important;
  word-break: break-word;
}

.fm-redeem-dialog .van-dialog__footer {
  background: rgba(30, 21, 48, 0.92);
  border-top: none !important;
  padding: 12px 16px;
  display: flex;
  gap: 10px;
}

/* 干掉 vant 自带的 hairline 顶部细线 */
.fm-redeem-dialog .van-dialog__footer::before,
.fm-redeem-dialog .van-dialog__footer::after,
.fm-redeem-dialog .van-hairline--top::after,
.fm-redeem-dialog .van-hairline--top-bottom::after {
  display: none !important;
  border: none !important;
  background: transparent !important;
}

/* Cancel：透明 + 1px 白透边 */
.fm-redeem-dialog .van-dialog__cancel {
  flex: 1;
  height: 44px !important;
  border-radius: 999px !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  background: transparent !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

/* Confirm：紫渐变胶囊 + 紫光投影 */
.fm-redeem-dialog .van-dialog__confirm {
  flex: 1;
  height: 44px !important;
  border-radius: 999px !important;
  border: none !important;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%) !important;
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.32) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #fff !important;
}

/* van 默认中间分隔竖线去掉 */
.fm-redeem-dialog .van-hairline--left::after {
  display: none !important;
}
</style>
