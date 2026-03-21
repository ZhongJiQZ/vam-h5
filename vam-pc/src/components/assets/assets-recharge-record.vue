<template>
  <div class="main_box container_box">
    <div class="recharge_record_table">
      <!-- 充值记录/提现记录 -->
      <el-table v-show="curTab !== 'order'" :data="data" style="width: 100%">
        <el-table-column
          prop="serialId"
          :label="$t('assets.orderNum')"
          align="left"
        >
        </el-table-column>
        <el-table-column
          :label="
            curTab == 'recharge'
              ? $t('assets.rechargeAddress')
              : $t('assets.withdrawAddress')
          "
          align="center"
        >
        <template slot-scope="scope">
          <div v-if="curTab == 'recharge'">{{ scope.row.address }}</div>
          <div v-if="curTab !== 'recharge'">{{ scope.row.toAdress }}</div>
        </template>
        </el-table-column>
        <el-table-column
          prop="type"
          :label="$t('assets.coinType')"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="realAmount"
          :label="
            curTab == 'recharge'
              ? $t('assets.rechargeNum')
              : $t('assets.withdraeAmount')
          "
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="updateTime"
          :label="$t('assets.time')"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="status"
          :label="$t('assets.status')"
          align="right"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.status == 0" style="color: red">
              {{ $t("assets.underReview") }}
            </span>
            <span v-else-if="scope.row.status == 1" style="color: red">
              {{ $t("assets.reviewPass") }}
            </span>
            <span v-else-if="scope.row.status == 2" style="color: green">
              {{ $t("assets.reviewFail") }}
            </span>
            <span v-else>
              {{ scope.row.status }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 投资记录 -->
      <el-table ref="orderTable" v-show="curTab =='order'" :data="data"  style="width: 100%">
        <el-table-column prop="planTitle" :label="$t('assets.name')" align="left">
        </el-table-column>
        <el-table-column
          :label="$t('assets.dayProfitRate')"
          align="center"
        >
        <template slot-scope="scope"><div> {{ scope.row.avgRate }}%</div></template>
        </el-table-column>

        <el-table-column
          :label="$t('assets.investAmount')"
          align="center"
        >
        <template slot-scope="scope">
          <div>{{ scope.row.amount }} USDT</div>
        </template>
        </el-table-column>

        <el-table-column
          :label="$t('assets.estimatedRevenue')"
          align="center"
        >
        <template slot-scope="scope">
           <div>{{ calPriceFormat((scope.row.amount * scope.row.days * 0.05) / 100, 4) }} USDT</div>
        </template>
        </el-table-column>

        <el-table-column
          :label="$t('assets.paymentDate')"
          align="center">
         <template slot-scope="scope">
            <div>{{ calcReceiptTime(scope.row.settlementType, scope.row.days, scope.row.createTime) == 'daily_settlement' ? $t('assets.daily_settlement') : calcReceiptTime(scope.row.settlementType, scope.row.days, scope.row.createTime) }}</div>
          </template>
        </el-table-column>

        <el-table-column
            prop
            :label="$t('assets.status')"
            align="center"
          >
            <template slot-scope="scope">
            <div v-if="calcInvestmentStatus(scope.row.status).name == 'In_position'">{{ $t('assets.in_position') }}</div>
            <div v-if="calcInvestmentStatus(scope.row.status).name == 'Settled'"> {{ $t('assets.settled') }}</div>
            <div v-if="calcInvestmentStatus(scope.row.status).name == 'host_redeemed'"> {{ $t('assets.host_redeemed') }}</div>
          </template>
        </el-table-column>
      </el-table>

    </div>

    <div style="margin-top: 30px" v-if="total">
      <el-pagination
        align="center"
        background
        @current-change="handleCurrentChange"
        :current-page.sync="pageNum"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { timeOfreceipt as calcReceiptTime, investmentStatus as calcInvestmentStatus } from "@/utils/filters";
import { priceFormat as calPriceFormat } from "@/util/utildecimal";
export default {
  props: {
    data: Array,
    total: Number,
    curTab: String,
    isSwitchTabs: Boolean,
  },
  components: {},
  data() {
    return {
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页显示条数\
    };
  },
  computed: {},
  watch: {
    curTab(v) {
    if (v === 'order') {
      this.$nextTick(() => {
        this.$refs.orderTable && this.$refs.orderTable.doLayout()
      })
    }
  },
    isSwitchTabs(val) {
      if (val) {
        this.pageNum = 1;
        // this.$emit("fetchData", this.pageNum);
      }
    },
  },
  methods: {
    calPriceFormat,
    calcReceiptTime,
    calcInvestmentStatus,
    handleCurrentChange(val) {
      // 当前页码改变时触发
      this.pageNum = val;
      this.$emit("fetchData", this.pageNum);
      // this.fetchData(); // 重新加载数据
    },
  },
  created() {},
  mounted() {},
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
</style>
