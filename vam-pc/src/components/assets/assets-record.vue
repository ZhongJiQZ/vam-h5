<!-- src/components/assets/assets-record.vue -->
<template>
  <div class="assets_recordd_main">
    <div class="title flex-start">{{ $t("assets.flows") }}</div>
    <div class="inner_box">
      <div class="out_tabs_box">
        <div class="out_tabs_inner">
          <el-tabs v-model="tabsValue" @tab-click="tabsClick">
            <el-tab-pane
              :key="item.name"
              :label="$t(item.label)"
              v-for="item in assetsTabsList"
              :name="item.name"
            >
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <div class="in_tabs_box">
        <div class="in_tabs_inner">
          <el-tabs v-model="tabsValue2" @tab-click="tabsInnerClick">
            <el-tab-pane
              :key="item.name"
              :label="$t(item.label)"
              v-for="item in innerTabsList"
              :name="item.name"
            >
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <div class="table_content">
        <div v-if="tabsValue == 'mingOrder'">
          <!-- mingOrderTable --质押记录 -->
          <el-table :data="mingOrderTable" style="width: 100%">
            <el-table-column
              prop="amount"
              :label="$t('assets.pledgeAmount') + '(USDT)'"
              align="left"
            >
            </el-table-column>
            <el-table-column :label="$t('assets.dayRate')" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.minOdds }}%~{{ scope.row.maxOdds }}%</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="days"
              :label="$t('assets.cycle') + '(' + $t('utils.day') + ')'"
              align="center"
            >
            </el-table-column>
            <el-table-column :label="$t('assets.beginTime')" align="center">
              <template slot-scope="scope">
                <span>{{
                  formatTimestampWithTimezone(scope.row.params.createTime)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('assets.endTime')" align="center">
              <template slot-scope="scope">
                <span>{{
                  formatTimestampWithTimezone(scope.row.params.endTime)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('assets.status')" align="right">
              <template slot-scope="scope">
                <span>{{ formatStatus(scope.row.status) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('assets.redemption')" align="right">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  @click="$emit('redeem', scope.row.id)"
                  v-if="scope.row.status == 0"
                  >{{ $t("assets.redemption") }}</el-button
                >
                <span v-else>{{ formatStatus(scope.row.status) }}</span>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 30px" v-if="total">
            <el-pagination
              align="center"
              background
              @current-change="handleCurrentChange"
              :current-page.sync="pageNum"
              :page-size="pageSize"
              layout="prev, pager, next"
              :total="mineOrderTotal"
            >
            </el-pagination>
          </div>
          <!-- <el-empty v-if="Array.isArray(mingOrderTable)" description="暂无数据">
            <template #image>
              <img
                :src="require('@/assets/image/noData.png')"
                alt="Empty Image"
              />
            </template>
          </el-empty> -->
        </div>
        <!-- <div v-if="tabsValue == 'order'"></div> -->
        <div v-else>
          <AssetsRechargeRecord
            :key="tabsValue"
            :data="tabsValue == 'recharge' ? rechargeTable : (tabsValue == 'withdraw' ? withdrawTable : orderTable)"
            :total="total"
            :curTab="tabsValue"
            @fetchData="fetchData"
            :isSwitchTabs="isSwitchTabs"
          ></AssetsRechargeRecord>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRecordList } from "@/api/assets";
// import { format } from "crypto-js";
import AssetsRechargeRecord from "./assets-recharge-record.vue";
export default {
  props: {
    assetsTabsList: Array,
    orderTable: Array,//投资记录
    rechargeTable: Array,
    withdrawTable: Array,
    mingOrderTable: Array,//质押记录
    total: Number,
    mineOrderTotal: Number,
  },
  components: { AssetsRechargeRecord },
  data() {
    return {
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页显示条数
      checked: false,
      searchValue: "",
      tabsValue: "mingOrder",
      tabsValue2: "totol",
      // tabsList: [
      //   {
      //     label: "资产列表",
      //     name: "mingOrder",
      //   },
      //   {
      //     label: "储值明细",
      //     name: "recharge",
      //   },
      //   {
      //     label: "提现明细",
      //     name: "withdraw",
      //   },
      // ],
      mingTabs: [
        {
          label: "assets.totol",
          name: "totol",
        },
        {
          label: "assets.inProgress",
          name: "0",
        },
        {
          label: "assets.completed",
          name: "1",
        },
        {
          label: "assets.redeemed",
          name: "2",
        },
      ],
      orderTabs:[
        {
          label: "assets.totol",
          name: "totol",
        },
      ],
      otherTabs: [
        {
          label: "assets.totol",
          name: "totol",
        },
        {
          label: "assets.underReview",
          name: "0",
        },
        {
          label: "assets.reviewPass",
          name: "1",
        },
        {
          label: "assets.reviewFail",
          name: "2",
        },
      ],
      tableData2: [],
      curStatus: "totol",
      isSwitchTabs: false,
    };
  },
  beforeCreate() {
    // this.init();
  },
  // created() {
  //   this.init();
  // },
  mounted() {
    // this.init();
  },
  computed: {
    innerTabsList() {
     if (this.tabsValue === "mingOrder") return this.mingTabs;
     if (this.tabsValue === "order")     return this.orderTabs;
     return this.otherTabs;
   },
    formatStatus() {
      return function (e) {
        this.mineStatus = e;
        let statusText;
        if (e == 0) {
          statusText = this.$t("assets.inProgress");
        } else if (e == 1) {
          statusText = this.$t("assets.completed");
        } else {
          statusText = this.$t("assets.redeemed");
        }
        return statusText;
      };
    },
  },
  methods: {
    init() {},
    fetchData(pageNum) {
      this.commonEmitGetTable({
        // param1: this.curStatus == "totol" ? "" : this.curStatus,
        // pageNum,
        // sendTabValue: this.tabsValue,
        param1: this.tabsValue == "mingOrder" ? "0" : "",
        pageNum: this.pageNum,
        sendTabValue: this.tabsValue,
      });
      this.isSwitchTabs = false;
    },
    handleCurrentChange(val) {
      // 当前页码改变时触发
      this.pageNum = val;

      this.commonEmitGetTable({
        param1: this.curStatus == "totol" ? "" : this.curStatus,
        pageNum: this.pageNum,
        sendTabValue: this.tabsValue,
      });
    },
    commonEmitGetTable(param) {
      this.$emit("getTableData", param);
    },

    tabsClick() {
      this.pageNum = 1;
      this.isSwitchTabs = true;
      this.curStatus = "totol";
      this.tabsValue2 = "totol";
      this.commonEmitGetTable({
        param1: this.tabsValue == "mingOrder" ? "0" : "",
        pageNum: this.pageNum,
        sendTabValue: this.tabsValue,
      });
    },
    tabsInnerClick(e) {
      this.pageNum = 1;
      this.isSwitchTabs = true;
      this.curStatus = e.name;
      // this.commonEmitGetTable({
      //   param1:
      //     e.name == "totol"
      //       ? this.tabsValue == "mingOrder"
      //         ? "0"
      //         : ""
      //       : e.name,
      //   sendTabValue: this.tabsValue,
      // });

      this.commonEmitGetTable({
        param1: e.name == "totol" ? "" : e.name,
        pageNum: this.pageNum,
        sendTabValue: this.tabsValue,
      });
    },
  },
};
</script>

<style lang="scss">
.bold {
  font-weight: bold;
}
.el-table {
  font-size: 12px;
}
::v-deep.el-tabs {
  // .el-tabs__nav-wrap {
  //   margin-bottom: 1px !important;
  // }
  // .el-tabs__nav-wrap::after {
  //   // height: 0;
  // }
  .el-tabs__item {
    height: 55px;
    font-size: 16px;
    line-height: 55px;
  }
  .el-tabs__header {
    margin: 0;
  }
  .el-tabs__active-bar {
    // height: 2px;
  }
  .el-table__empty-block {
    display: none;
  }
}

.assets_recordd_main {
  width: 1200px;
  margin: auto;
  .title {
    font-size: 36px;
    height: 152px;
    color: #1e2329;
    border-bottom: 1px solid #f1f1f1;
  }
  .inner_box {
    // margin-top: 50px;
    .out_tabs_box {
      .out_tabs_inner {
      }
    }
    .in_tabs_box {
      //   margin-top: 20px;
      .in_tabs_inner {
        ::v-deep.el-tabs {
          // .el-tabs__nav-wrap {
          //   margin-bottom: 1px;
          // }
          .el-tabs__active-bar {
            height: 2px;
          }
        }
      }
    }
    .search_section {
      margin-top: 10px;
      gap: 10px;
      ::v-deep.el-select {
        width: 250px;
        .el-input__icon {
          display: none;
        }
      }
    }
    .table_content {
      margin-top: 10px;
    }
  }
}
</style>
