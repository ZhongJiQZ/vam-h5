<template>
  <div class="newbottom-footer">
    <div class="footer-wrap">
      <div class="wrap-logo flex-colum-between">
        <div class="logo-img flex-start">
          <img src="../../assets/image/logo.jpg" alt="" />
          <span class="num_Bold">Veloxam</span>
        </div>
        <!-- <div class="logo-lang" @click="openSetLangFun">
          <span>{{ languageName }}</span>
        </div> -->
        <div>
          <!-- 使用 el-select 替代 el-popover -->
          <!-- <el-select
            v-model="selectedLang"
            placeholder="选择语言"
            @change="switchLang"
          >
            <el-option
              v-for="(item, index) in languageData"
              :key="index"
              :label="item.remark"
              :value="item"
            >
            </el-option>
          </el-select> -->
          <el-tooltip
            placement="bottom"
            effect="light"
            trigger="click"
            popper-class="operat-info-tooltip lang-tooltip "
          >
            <div slot="content">
              <div
                v-for="(item, index) in languageData"
                :key="index"
                class="info-item"
                @click="switchLang(item)"
              >
                <div class="item-text">
                  <div class="title flex-start" style="gap: 12px">
                    <img
                      :src="item.imgUrl"
                      alt
                      width="18px"
                      v-if="item.imgUrl"
                    />
                    <span>{{ $t(item.remark) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- {{ userInfo.avatar}}--userInfo -->
            <div class="logo-lang">
              <p>
                {{ selectedLang }}
              </p>
            </div>
          </el-tooltip>
        </div>
      </div>
      <div class="wrap-content flex-between">
        <div
          class="title-item flex-between"
          v-for="(item, index) in textData"
          :key="index"
        >
          <!-- <div class="title">{{ item.title_code }}</div> -->
          <div class="child-list">
            <div
              class="child-item"
              v-for="(child, i) in item.child_list"
              :key="i"
              @click="jumpPage(child)"
            >
              {{ $t(child.title_code) }}
            </div>
          </div>
        </div>
        <div class="qr flex-colum">
          <div class="qrcode_box">
            <img src="../../assets/image/qrcode.png" alt="" />
          </div>
          <div class="moreChoose">
            <el-button type="primary" size="medium">{{
              $t("utils.moreChoose")
            }}</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-icon-box">
      <div class="box-content">
        <div class="icon-box">
          <div
            class="icon-item"
            v-for="(item, index) in iconData"
            :key="index"
            @click="openUrlFun(item.skip_path)"
          >
            <img :src="getImgUrlFun(item.img_code, 'normal')" />
            <img :src="getImgUrlFun(item.img_code, 'hover')" />
          </div>
        </div>
        <div class="icon-c" @click="openUrlFun(copyright.skip_path)">
          {{ copyright.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getStrDataFunction } from "@/util/util";
import { getDataApi } from "@/api/system";
import { mapGetters, mapMutations } from "vuex";
import { footerList } from "@/assets/js/header.js";
import { watch } from "@vue/composition-api";
export default {
  props: ["openSetLangFun"],
  data() {
    return {
      textData: [],
      iconData: [],
      copyright: {},
      isSkipArticle: false,
      langConf: [
        {
          value: "zh",
          text: "简体中文",
        },
        {
          value: "en",
          text: "English",
        },
      ], //语言
      selectedLang: "", //默认选中语言
    };
  },
  computed: {
    ...mapGetters([
      "language",
      "languageName",
      "languageData",
      "themeName",
      "logo",
      "allImgUrl",
    ]),
  },
  watch: {
    language(val) {
     if(val){
      this.selectedLang = this.languageName;
     }
    },
  },
  mounted() {
    this.textData = footerList;
    this.selectedLang = this.languageData.find(
      (item) => item.dictValue == this.language
    )["remark"];
    //获取底部导航配置
    // getDataApi('1530464853989064705', {
    //   config_type: 'footer',
    //   config_code: 'bottom_content',
    // }).then((res) => {
    //   let data = res.data.data.records[0]
    //   let config_data = getStrDataFunction(data.config_data)
    //   this.copyright = config_data.copyright
    //   this.textData = config_data.list_data
    //   this.iconData = config_data.icon_data

    //   console.log('底部导航配置', config_data)
    // })
  },
  methods: {
    ...mapMutations([
      "SET_DEAL_TYPE",
      "SET_CURR_COIN",
      "SET_CONTRACT_TYPE",
      "SET_LANGUAGE",
    ]),
    openUrlFun(url) {
      if (url) {
        window.open(url, "_blank");
      }
    },
    switchLang(item) {
      // console.log("item===>", item);
      this.$i18n.locale = item.dictValue;
      this.selectedLang = item.remark;
      localStorage.setItem("lang", item.dictValue);
      this.SET_LANGUAGE({
        language: item.dictValue,
        languageName: item.remark,
      });
    },
    jumpPage(data) {
      // console.log("jumP===>", data);
      if (data.linkUrl == "customerService") {
        this.$emit("openDialog");
      }
      if (data.query) {
        this.$router.push({
          path: data.linkUrl,
          query: data.query,
        });
      } else {
        this.$router.push({
          path: data.linkUrl,
        });
      }
    },
    getImgUrlFun(code, type) {
      if (type) {
        code = code[type];
      }
      return this.allImgUrl[code] ? this.allImgUrl[code] : "";
    },
    textClickFun(data) {
      if (data.skip_type == "article" && data.article_code) {
        if (this.isSkipArticle) {
          return false;
        }
        this.isSkipArticle = true;
        //跳转文章
        getDataApi("1530431184536666113", {
          article_code: data.article_code,
          article_lang: this.language,
        })
          .then((res) => {
            this.isSkipArticle = false;
            let data = res.data.data.records;
            if (res.data.data.records.length > 0) {
              data = data[0];
              let routeData = this.$router.resolve({
                path: `/article/main/content/${data.article_type}/${data.id}`,
              });
              window.open(routeData.href, "_blank");
            }
          })
          .catch(() => {
            this.isSkipArticle = false;
          });
      } else if (data.skip_type == "page" && data.skip_path) {
        if (data.set_store && data.fun_key) {
          this[data.fun_key](data.set_store);
        }
        //跳转页面
        let routeData = this.$router.resolve({
          path: data.skip_path,
        });
        window.open(routeData.href, "_blank");
      }
    },
    currCoinLangFun(code, type = "footer") {
      return this.coinLangFun(type, code);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep.el-select {
  .el-input__inner {
    height: 48px;
    border-color: #536fff;
  }
}
.newbottom-footer {
  width: 100%;
  // margin-top: 48px;
  background-color: #fafbfe;
  color: #838b9c;

  .footer-wrap {
    width: 1240px;
    margin: auto;
    padding: 20px 20px 100px 20px;
    box-sizing: border-box;
    //background: red;
  }
}

.wrap-content {
  // display: flex;
  // justify-content: center;
  margin-top: 50px;
  // gap: 160px;

  .title-item {
    .title {
      font-size: 18px;
    }

    .child-list {
      margin-top: 30px;

      .child-item {
        font-size: 14px;
        margin-top: 39px;
        cursor: pointer;

        &:hover {
          color: #0f71c4;
        }
      }
    }
  }

  .qrcode_box {
    img {
      width: 150px;
    }
  }

  .qr {
    // flex: 1;

    .moreChoose {
      margin-top: 40px;

      .el-button {
        width: 120px;
      }
    }
  }
}

.wrap-logo {
  // padding: 20px;
  height: 150px;
  // background: yellow;

  .logo-img {
    img {
      width: 44px;
    }

    span {
      font-size: 28px;
      color: #536fff;
    }
  }

  .logo-lang {
    font-size: 16px;
    border: 1px solid #0f71c4;
    border-radius: 4px;
    width: 170px;
    text-align: center;
    padding: 12px 0;
    // margin: 20px auto 0;
    cursor: pointer;
  }
}

.footer-icon-box {
  border-top: 1px solid #e5e5e5;
  padding: 24px 0;

  .box-content {
    width: 1240px;
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
  }

  .icon-box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    grid-column-gap: 12px;

    .icon-item {
      cursor: pointer;

      img {
        width: 24px;
        height: 24px;

        &:nth-child(1) {
          display: block;
        }

        &:nth-child(2) {
          display: none;
        }
      }

      &:hover {
        img {
          &:nth-child(1) {
            display: none;
          }

          &:nth-child(2) {
            display: block;
          }
        }
      }
    }
  }

  .icon-c {
    cursor: pointer;
  }
}
</style>
