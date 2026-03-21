<template>
  <div class="login-box">
    <!-- 语言选择 -->
    <div class="langBox">
      <div class="operat-item">
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
                  <!-- <img :src="item.imgUrl" alt width="18px" v-if="item.imgUrl" /> -->
                  <span>{{ $t(item.remark) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="operat-lang">
            <img class="img" src="../../assets/image/lang.png" />
          </div>
        </el-tooltip>
      </div>
    </div>

    <div class="login_main">
      <!-- 左边图片 -->
      <div class="login-banner">
        <img src="../../assets/image/login_bg.png" alt="" />
      </div>

      <!-- 右边表单 -->
      <div class="login-content">
        <div class="login-wrapper">
          <div class="login-title">{{ $t("login.title") }}</div>

          <ul class="login-check-list flex-box">
            <li
              class="fit-tc-tertiary hover-text title"
              :class="{ 'active-text': loginType == 'account' }"
              @click="setFormConfigFun('account')"
            >
              {{ $t("login.accountLogin") }}
            </li>

            <li
              class="fit-tc-tertiary hover-text title"
              :class="{ 'active-text': loginType == 'email' }"
              @click="setFormConfigFun('email')"
            >
              {{ $t("login.emailLogin") }}
            </li>

            <li
              class="fit-tc-tertiary hover-text title"
              :class="{ 'active-text': loginType == 'phone' }"
              @click="setFormConfigFun('phone')"
            >
              {{ $t("login.phoneLogin") }}
            </li>
          </ul>

          <div class="login-info">
            <el-form
              ref="form"
              :rules="rules"
              :model="formData"
              label-position="top"
              label-width="80px"
              @submit.native.prevent="loginFun"
            >
              <!-- account -->
              <el-form-item prop="loginName" v-if="loginType == 'account'">
                <el-input
                  class="contains-icon"
                  :placeholder="$t('regisAndLogin.plsInputUserName')"
                  prefix-icon="el-icon-user-solid"
                  v-model.trim="formData.loginName"
                />
              </el-form-item>

              <el-form-item prop="loginPassword" v-if="loginType == 'account'">
                <el-input
                  class="contains-icon"
                  :placeholder="$t('regisAndLogin.plsInputPsw')"
                  prefix-icon="el-icon-lock"
                  show-password
                  v-model.trim="formData.loginPassword"
                />
              </el-form-item>

              <!-- email -->
              <el-form-item prop="email" v-else-if="loginType == 'email'">
                <el-input
                  class="contains-icon"
                  :placeholder="$t('regisAndLogin.plsInputEmail')"
                  prefix-icon="el-icon-user-solid"
                  v-model.trim="formData.email"
                />
              </el-form-item>

              <!-- phone -->
              <el-form-item prop="phone" v-else>
                <el-select
                  v-model="value"
                  :placeholder="$t('regisAndLogin.plsSelect')"
                >
                  <el-option-group
                    v-for="item in areaData"
                    :key="item.letter"
                    :label="item.letter"
                  >
                    <el-option
                      v-for="dataItem in item.data"
                      :key="dataItem.phoneCode"
                      :label="`+ ${dataItem.phoneCode}`"
                      :value="dataItem.phoneCode"
                    />
                  </el-option-group>
                </el-select>

                <el-input
                  v-model.trim="formData.phone"
                  class="phone-input"
                  :placeholder="$t('regisAndLogin.plsInputPhoneNum')"
                >
                  <div slot="prefix" class="before-box"></div>
                </el-input>
              </el-form-item>

              <!-- code -->
              <el-form-item prop="code">
                <el-input
                  class="contains-icon"
                  :placeholder="$t('regisAndLogin.plsInputCode')"
                  prefix-icon="el-icon-lock"
                  v-model.trim="formData.code"
                >
                  <template slot="suffix">
                    <div class="imgBox flex-center" v-if="loginType == 'account'">
                      <img :src="codeUrl" @click="refreshCode" />
                    </div>

                    <div class="btnBox flex-center" v-else>
                      <p
                        class="commonBtn_bg"
                        :style="{
                          opacity: codeTime > 0 || codeLoading ? '0.6' : '1',
                          pointerEvents: codeTime > 0 || codeLoading ? 'none' : 'auto',
                        }"
                        @click="sendCode(loginType)"
                      >
                        {{ codeTime > 0 ? `${codeTime}s` : $t("regisAndLogin.sendCode") }}
                      </p>
                    </div>
                  </template>
                </el-input>
              </el-form-item>

              <el-button
                type="primary"
                class="commonBtn_bg"
                :loading="loading"
                native-type="submit"
              >
                {{ $t("login.login") }}
              </el-button>

              <div
                class="forget-pwd fit-tc-primary active-text"
                @click="$router.push({ path: '/user/reset' })"
              >
                {{ $t("login.forgetPsw") }}
              </div>

              <div class="login-tip">
                <span>{{ $t("login.noAccount") }}</span>
                <span
                  class="active-text e2"
                  @click="$router.push({ path: '/user/register' })"
                >
                  {{ $t("login.regisNow") }}
                </span>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhoneAreaCode from "@/components/user/phone-area-code.vue";
import { mapActions, mapGetters, mapMutations } from "vuex";
import { getCountryCode } from "@/api/system";
import {
  sendEmailApi,
  sendPhoneSmsApi,
  getAuthentication,
  sendEmailCode,
  sendMobileCode,
} from "@/api/user";
import config from "@/config/index";

export default {
  components: { PhoneAreaCode },

  data() {
    return {
      codeTime: 0,
      loading: false,
      codeLoading: false,
      loginStep: 1,
      conifgData: {},
      loginType: "account",
      isPhoneCode: false,

      formData: {
        loginName: "",
        loginPassword: "",
        signType: "",
        code: "",
        email: "",
        phone: "",
        emailCode: "",
      },

      rules: {
        loginName: [
          { required: true, message: this.$t('regisAndLogin.plsInputUserName'), trigger: ["blur", "change"] },
        ],
        phone: [
          { required: true, message: this.$t('regisAndLogin.plsInputPhoneNum'), trigger: ["blur", "change"] },
        ],
        loginPassword: [
          { min: 6, message: this.$t('regisAndLogin.plsInputPsw'), trigger: ["blur", "change"] },
        ],
        email: [
          {
            validator: (rule, value, cb) => {
              if (this.loginType !== "email") return cb(); // 非 email 登录不校验
              if (!value) return cb(new Error(this.$t("regisAndLogin.plsInputEmail")));
              const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
              return ok
                ? cb()
                : cb(new Error(this.$t("regisAndLogin.plsInputEmail") || "邮箱格式不正确"));
            },
            trigger: ["blur", "change"],
          },
        ],
      },

      // 验证（原代码保留）
      isBindGoogle: false,
      verifyType: "google",
      verifyData: { phoneCode: "", googleCode: "", emailCode: "" },

      verCodeUrl: "",
      timestamp: "",
      value: "93",
      areaData: [],

      langConf: [
        { value: "zh", text: "简体中文" },
        { value: "en", text: "English" },
      ],
    };
  },

  computed: {
    ...mapGetters(["themeName", "language", "languageData"]),
    codeUrl() {
      this.timestamp = Date.now();
      return `${config.baseUrl}/api/user/easyGenerateCode?codeType=LOGIN&timestamp=${this.timestamp}`;
    },
  },

  created() {
    this.getAreaDataFun();
  },

  methods: {
    ...mapActions(["login", "getUserInfoData", "getCoinList"]),
    ...mapMutations(["SET_USER_INFO", "SET_LANGUAGE"]),

    async getAreaDataFun() {
      const dataRes = await getCountryCode();
      this.areaData = dataRes?.data?.data || [];
    },

    switchLang(item) {
      this.$i18n.locale = item.dictValue;
      localStorage.setItem("lang", item.dictValue);
      this.SET_LANGUAGE({ language: item.dictValue, languageName: item.remark });
    },

    changeCode(e) {
      this.value = e;
    },

    refreshCode() {
      this.timestamp = Date.now();
    },

    // ✅ 倒计时（60s）
    startCodeTimer(sec = 60) {
      this.codeTime = sec;
      const timer = setInterval(() => {
        this.codeTime--;
        if (this.codeTime <= 0) {
          clearInterval(timer);
          this.codeTime = 0;
        }
      }, 1000);
    },

    // ✅ 发送验证码：email/phone 都必须先验证
    sendCode(type) {
      if (this.codeTime > 0 || this.codeLoading) return; // 防重复

      // 只允许 email/phone 触发
      if (type !== "email" && type !== "phone") return;
      // 先验证对应字段
      const field = type === "email" ? "email" : "phone";

      this.$refs.form.validateField(field, (errMsg) => {
        if (errMsg) return; // 不通过：Element 会自动显示提示
        // phone 模式：额外确保区号存在（避免 value 为空）
        if (type === "phone" && !this.value) {
          this.$message.error(this.$t("regisAndLogin.plsSelect") || "请选择区号");
          return;
        }

        // 校验通过才真正发
        if (type === "email") {
          this.doSendEmailCode();
        } else {
          this.doSendMobileCode();
        }
      });
    },

    async doSendEmailCode() {
      this.codeLoading = true;
      try {
        const res = await sendEmailCode({
          codeType: "LOGIN",
          email: this.formData.email,
        });

        if (res?.data?.code == 200) {
          this.$message({
            message: this.$t("regisAndLogin.sendCodeToEmail"),
            type: "success",
          });
          this.startCodeTimer(60);
        } else {
          this.$message.error(res?.data?.msg || this.$t("regisAndLogin.sendCodeFail") || "发送失败");
        }
      } catch (e) {
        this.$message.error(e?.message || this.$t("regisAndLogin.sendCodeFail") || "发送失败");
      } finally {
        this.codeLoading = false;
      }
    },

    async doSendMobileCode() {
      this.codeLoading = true;
      try {
        const res = await sendMobileCode({
          codeType: "LOGIN",
          phone: `${this.value}${this.formData.phone}`,
        });

        if (res?.data?.code == 200) {
          this.$message({
            message: this.$t("regisAndLogin.sendCodeSuccess"),
            type: "success",
          });
          this.startCodeTimer(60);
        } else {
          this.$message.error(res?.data?.msg || this.$t("regisAndLogin.sendCodeFail") || "发送失败");
        }
      } catch (e) {
        this.$message.error(e?.message || this.$t("regisAndLogin.sendCodeFail") || "发送失败");
      } finally {
        this.codeLoading = false;
      }
    },

    // ✅ 切换 tab：别把 formData 字段删掉，否则 validateField 会找不到字段
    setFormConfigFun(type) {
      this.loginType = type;

      this.formData = {
        loginName: "",
        loginPassword: "",
        signType: "",
        code: "",
        email: "",
        phone: "",
        emailCode: "",
      };

      this.codeTime = 0;
      this.codeLoading = false;

      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    },

    loginFun() {
      const data = {
        code: this.formData.code,
        loginName: this.formData.loginName,
        loginPassword: this.formData.loginPassword,
        signType: this.loginType === "account" ? 3 : this.loginType === "email" ? 2 : 1,
      };

      this.loading = true;

      this.login(data)
        .then(async () => {
          this.loading = false;
          this.getCoinList();
          this.$message({ message: this.$t("login.loginSuccess"), type: "success" });
          setTimeout(() => this.$router.push({ path: "/" }), 1000);
        })
        .catch((error) => {
          this.loading = false;
          console.log(error);
        });
    },

    // 原函数保留（你项目其他地方可能在用）
    sendAuthCodeFun() {
      if (this.codeTime > 0 || this.codeLoading) return false;
      this.codeLoading = true;

      if (this.loginType == "account") {
        sendEmailApi({ email: this.formData.account, type: 2 })
          .then(() => {
            this.codeLoading = false;
            this.startCodeTimer(60);
          })
          .catch(() => {
            this.codeLoading = false;
          });
      } else {
        sendPhoneSmsApi({
          phone: this.formData.phone,
          type: 2,
          areaCode: this.formData.phoneRegion,
        })
          .then(() => {
            this.codeLoading = false;
            this.startCodeTimer(60);
          })
          .catch(() => {
            this.codeLoading = false;
          });
      }
    },

    setVerifyDataFun(type) {
      this.verifyType = type;
      this.verifyData = { phoneCode: "", googleCode: "" };
    },
  },
};
</script>


<style lang="scss" scoped>
::v-deep.el-select {
  width: 140px;
  border-right: 1px solid #ddd;
}

::v-deep .el-input:hover .el-input__inner {
  border-color: #f1f1f1 !important;
  /* 重置为默认边框颜色 */
}

.login-box {
  display: flex;
  width: 100vw;
  height: 100vh;
  // overflow: hidden;
  // min-height: 600px;
  align-items: center;
  background: #fafbfe;
  .langBox {
    position: fixed;
    top: 15px;
    right: 30px;

    .operat-lang {
      img {
        width: 30px;
      }
    }
  }

  .login_main {
    display: flex;
    // align-items: center;
    justify-content: space-around;
    width: 1570px;
    // padding: 80px;
    margin: auto;
    //background: blue;
  }

  // width: 1200px;
  // margin: 0 auto;
  .login-banner {
    position: relative;
    flex: 1;
    display: flex;
    justify-content: center;
    // background: red;

    img {
      width: 460px;
      height: auto;
      object-fit: contain;
    }
  }

  .login-content {
    flex: 1;
    display: flex;
    align-items: center;
    // background:blue;
  }

  .login-wrapper {
    // padding-top: 82px;
    // width: 52px;
    margin: 0 auto;
    //  background:yellow;
    // margin-top: -11%;

    .login-title {
      word-wrap: break-word;
      line-height: 70px;
      min-height: 70px;
      padding-bottom: 30px;
      font-weight: 700;
      font-size: 50px !important;
    }

    ul {
      // padding-bottom: 16px;

      li {
        cursor: pointer;
        font-size: 20px;
        min-height: 28px;
        font-weight: 700;
        margin-right: 40px;
      }

      .active-text {
        color: #536fff;
      }

      span {
        margin: 0 12px;
      }
    }
  }

  .login-info {
    ::v-deep.el-form {
      .el-form-item__content {
        display: flex;
      }

      .el-input__icon {
        // font-size: 16px;
        line-height: 55px;
      }

      .el-form-item__label {
        height: 16px;
        line-height: 16px;
        font-size: 12px;
        margin-bottom: 8px;
      }

      // .el-form-item__content {
      //   display: flex;
      //   justify-content: space-between;
      // }

      .contains-icon {
        // position: relative;

        // input {
        //   // height:50px;
        //   padding-right: 130px;
        //   /* 留出图片的空间 */
        // }

        // .el-input__inner {
        //   padding-left: 40px;
        //   background: #f1f1f1;
        //   height: 50px;
        // }
        .imgBox {
          width: 100px;
          height: 55px;

          img {
            width: 100%;
            //background: red;
            // height: 30px;
            // position: absolute;
            // top: 6px;
            // right: 20px;
            // transform: translateY(-10%); /* 垂直居中 */
          }
        }

        .btnBox {
          width: 100px;
          height: 55px;

          .commonBtn_bg {
            width: 90px;
            height: 30px;
            line-height: 30px;
            cursor: pointer;
          }
        }
      }

      .el-input__inner {
        font-weight: 500;
        height: 55px;
        line-height: 55px;
        font-size: 16px;
        border-radius: 2px;
        background: #f1f1f1;
        border-color: #f1f1f1;
      }

      .phone-input {
        position: relative;

        .before-box {
          left: 0;
          position: absolute;
          // width:140px;
          border-right: 1px solid #ddd;
        }

        .el-input__prefix {
        }
      }
    }

    .el-button {
      width: 100%;
      height: 50px;
      border: 0;
      padding: 12px;
      font-size: 16px;
      margin-top: 40px;
    }

    .forget-pwd {
      line-height: 20px;
      text-align: right;
      font-size: 14px;
      cursor: pointer;
      margin-top: 10px;
    }

    .login-tip {
      font-size: 14px;
      margin-top: 30px;
      text-align: center;

      span {
        &:nth-child(2) {
          margin-left: 8px;
          cursor: pointer;
        }
      }
      .active-text {
        color: #536fff;
      }
    }

    .verify-code-wrap {
      .codeInput {
        position: relative;
        font-size: 14px;
        display: inline-block;
        width: 100%;
      }

      .el-input__suffix {
        display: flex;
        align-items: center;
        right: 12px !important;
      }

      .small-btn {
        font-size: 16px;
        cursor: pointer;
      }
    }
  }
}
</style>
