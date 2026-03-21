<template>
  <div class="depositRecord">
    <div class="top-bg"></div>

    <!-- <div class="pcHeader">
      <div>{{ _t18('fund_name') }}</div>
      <div class="center">{{ _t18('Lock-up_days') }}</div>
      <div class="center">{{ _t18('host_dailyrateof_return') }}</div>
      <div class="right">{{ _t18('investment_amount') }}</div>
      <div class="right">{{ _t18('Estimated income') }}</div>
      <div class="right">{{ _t18('Arrival_time') }}</div>
      <div class="center">{{ _t18('mining_status') }}</div>
    </div> -->

    <div v-if="!loading && list.length === 0" class="empty">
      {{ _t18('no_data') }}
    </div>

    <van-list
      v-else
      v-model:loading="loading"
      :finished="finished"
      :finished-text="_t18('no_more_data')"
      :loading-text="_t18('loading')"
      @load="onLoad"
    >
      <RecordItem
        v-for="(item, index) in list"
        :key="item.id || item.createTime || index"
        :itemObj="item"
      />
    </van-list>
  </div>
</template>

<script>
import RecordItem from '../../components/inverstment/RecordItem.vue'
import { _t18 } from '@/utils/public'
import { getInvestmentList } from '@/api/finance.js'

export default {
  name: 'depositRecord',
  components: { RecordItem },
  props: {
    projectId: { type: [String, Number], default: '' }
  },
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      page: 1,
      pageSize: 10
    }
  },
  created() {
    this.resetAndLoad()
  },
  watch: {
    projectId() {
      this.resetAndLoad()
    }
  },
  methods: {
    _t18,

    resetAndLoad() {
      this.page = 1
      this.list = []
      this.finished = false
      this.loading = false
      this.onLoad()
    },

    async onLoad() {
      if (this.finished || this.loading) return
      this.loading = true

      try {
        const res = await getInvestmentList({
          projectId: this.projectId,
          pageNum: this.page,
          pageSize: this.pageSize
        })

        // ✅ 兼容不同后端结构：list/rows/records 任选其一
        const data = res?.data || {}
        const rows =
          data.list ||
          data.rows ||
          data.records ||
          data.data ||
          []

        // 如果后端直接返回数组
        const finalRows = Array.isArray(rows) ? rows : []

        this.list = this.page === 1 ? finalRows : this.list.concat(finalRows)

        // ✅ finished 判定：优先用 total，没有 total 就用 rows.length
        const total = Number(data.total || data.totalCount || 0)
        if (total > 0) {
          if (this.list.length >= total) this.finished = true
          else this.page += 1
        } else {
          if (finalRows.length < this.pageSize) this.finished = true
          else this.page += 1
        }
      } catch (err) {
        console.error('getInvestmentList error:', err)
        this.finished = true
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.depositRecord {
  min-height: 100%;
  background: var(--ex-home-list-bgcolor);

  .top-bg {
    width: 100%;
    height: 300px;
    background: url("../../assets/image/finance_banner.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    position: relative;
  }
}

.empty {
  padding: 40px 0;
  text-align: center;
  font-size: 13px;
  color: var(--ex-passive-font-color);
}

.pcHeader {
  display: grid;
  grid-template-columns: 2.2fr 0.8fr 0.9fr 1.2fr 1.2fr 1.3fr 0.9fr;
  gap: 12px;
  padding: 12px 16px;
  background: var(--ex-home-list-bgcolor);
  border-bottom: 1px solid var(--ex-border-color);
  font-size: 12px;
  color: var(--ex-passive-font-color);
  .right { text-align: right; }
  .center { text-align: center; }
}
</style>
