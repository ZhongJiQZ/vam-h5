<!-- src/views/assets/components/flowMiningComponent.vue -->
<template>
  <div class="flow-mining">
    <van-tabs
      shrink
      v-model:active="statusActive"
      class="flow-mining__status-tabs"
      title-inactive-color="#7a8c99"
      title-active-color="#1a1a1a"
      color="#008710"
      line-width="20"
      line-height="3"
      @click-tab="onClickStatusTab"
    >
      <van-tab :title="_t18('records.total')" name="" />
      <van-tab :title="_t18('records.inProgress')" name="0" />
      <van-tab :title="_t18('records.completed')" name="1" />
      <van-tab :title="_t18('records.redeemed')" name="2" />
    </van-tabs>

    <div class="list-wrap">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          :finished-text="_t18('utils.noMore') || '没有更多了'"
          @load="onLoad"
        >
          <template v-if="miningList.length">
            <div class="card" v-for="row in miningList" :key="row.id">
              <div class="kv">
                <div class="k">{{ _t18('records.pledgeAmount') }}(USDT)</div>
                <div class="v">{{ row.amount }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.dayRate') }}</div>
                <div class="v">{{ row.minOdds }}%~{{ row.maxOdds }}%</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.cycle') }}({{ _t18('utils.day') }})</div>
                <div class="v">{{ row.days }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.beginTime') }}</div>
                <!-- 重点：你接口返回的 createTime 是字符串，不在 params.createTime -->
                <div class="v">{{ formatTimestampWithTimezone(row.createTime) }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.endTime') }}</div>
                <!-- 重点：你接口返回的 endTime 是字符串，不在 params.endTime -->
                <div class="v">{{ formatTimestampWithTimezone(row.endTime) }}</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('assets.PNL') }}</div>
                <div class="v">{{ row.accumulaEarn }} (USDT)</div>
              </div>

              <div class="kv">
                <div class="k">{{ _t18('records.status') }}</div>
                <div class="v">{{ formatStatus(row.status) }}</div>
              </div>

              <div class="actions">
                <van-button
                  v-if="String(row.status) === '0'"
                  block
                  round
                  class="btn-redeem"
                  @click="onRedeem(row)"
                >
                  {{ _t18('records.redemption') }}
                </van-button>
                <!-- <div v-else class="tag">{{ formatStatus(row.status) }}</div> -->
              </div>
            </div>
          </template>

          <van-empty
            v-else-if="!loading && !refreshing"
            :description="_t18('utils.noData') || '暂无数据'"
          />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { showToast, showConfirmDialog } from "vant";
import { _t18 } from "@/utils/public";
import { getRecordList } from "@/api/assets";
import { redemption } from "@/api/pledge";
import { useI18n } from 'vue-i18n'
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

// ====== 时间格式化（先最稳：直接返回字符串；你后面再换成自己的 util） ======
const formatTimestampWithTimezone = (ts) => {
  if (!ts) return "-";
  // 你接口返回类似：2026-01-28 10:21:05 或 2026-02-04T10:21:05.000+08:00
  return String(ts).replace("T", " ").replace(".000+08:00", "");
};

const formatStatus = (e) => {
  if (String(e) === "0") return _t18("records.inProgress");
  if (String(e) === "1") return _t18("records.completed");
  return _t18("records.redeemed");
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

.flow-mining__status-tabs {
  :deep(.van-tabs__wrap) {
    height: 44px;
    border-bottom: 1px solid #eef0f3;
    background: #fff !important;
  }

  :deep(.van-tabs__nav) {
    background: #fff !important;
    padding-left: 12px;
    padding-right: 12px;
  }

  :deep(.van-tab) {
    flex: none;
    padding: 0 12px;
    font-size: 14px;
  }

  :deep(.van-tab__text) {
    font-weight: 400;
  }

  :deep(.van-tab--active .van-tab__text) {
    font-weight: 600;
  }

  :deep(.van-tabs__line) {
    display: none !important;
  }

  :deep(.van-tab--shrink) {
    margin-right: 4px;
  }
}

.list-wrap {
  padding: 12px 15px 24px;
  background: #fff;
}

.card {
  background: #f7f9fc;
  border-radius: 12px;
  padding: 14px 14px 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(5, 16, 26, 0.04);
}

.kv {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
}

.k {
  font-size: 13px;
  color: #7a8c99;
  flex: 0 0 45%;
}
.v {
  font-size: 13px;
  color: #1a1a1a;
  text-align: right;
  flex: 1;
  word-break: break-all;
}

.actions {
  margin-top: 14px;
  padding-top: 4px;
}

.btn-redeem {
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  color: #fff !important;
  background: #05101a !important;
  border: none !important;
}

.tag {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 135, 16, 0.1);
  color: #008710;
}
</style>
