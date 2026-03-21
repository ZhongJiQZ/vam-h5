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
          <div class="login-title">{{ $t("regis.title") }}</div>

          <ul class="login-check-list flex-box">
            <li
              class="fit-tc-tertiary hover-text title"
              :class="{ 'active-text': loginType == 'account' }"
              @click="setFormConfigFun('account')"
            >
              {{ $t("regis.accountRegis") }}
            </li>

            <li
              class="fit-tc-tertiary hover-text title"
              :class="{ 'active-text': loginType == 'email' }"
              @click="setFormConfigFun('email')"
            >
              {{ $t("regis.emailRegis") }}
            </li>

            <li
              class="fit-tc-tertiary hover-text title"
              :class="{ 'active-text': loginType == 'phone' }"
              @click="setFormConfigFun('phone')"
            >
              {{ $t("regis.phoneRegis") }}
            </li>
          </ul>

          <div class="login-info">
            <el-form
              ref="form"
              :rules="rules"
              :model="formData"
              label-position="top"
              label-width="80px"
              @submit.native.prevent="regisFun"
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

              <!-- email/phone code -->
              <el-form-item
                prop="code"
                v-if="loginType == 'email' || loginType == 'phone'"
              >
                <el-input
                  class="contains-icon"
                  :placeholder="$t('regisAndLogin.plsInputCode')"
                  prefix-icon="el-icon-lock"
                  v-model.trim="formData.code"
                >
                  <template slot="suffix">
                    <div class="btnBox flex-center">
                      <p
                        class="commonBtn_bg"
                        :style="{
                          cursor: 'pointer',
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

              <!-- password -->
              <el-form-item prop="loginPassword">
                <el-input
                  class="contains-icon"
                  :placeholder="$t('regis.plsInputLoginPsw')"
                  prefix-icon="el-icon-lock"
                  show-password
                  v-model.trim="formData.loginPassword"
                />
              </el-form-item>

              <el-form-item prop="newLoginPassword">
                <el-input
                  class="contains-icon"
                  :placeholder="$t('regis.plsConfirmPsw')"
                  prefix-icon="el-icon-lock"
                  show-password
                  v-model.trim="formData.newLoginPassword"
                />
              </el-form-item>

              <!-- account captcha code -->
              <el-form-item prop="code" v-if="loginType == 'account'">
                <el-input
                  class="contains-icon"
                  :placeholder="$t('regisAndLogin.plsInputCode')"
                  prefix-icon="el-icon-lock"
                  v-model.trim="formData.code"
                >
                  <template slot="suffix">
                    <div class="imgBox flex-center">
                      <img :src="codeUrl" @click="refreshCode" />
                    </div>
                  </template>
                </el-input>
              </el-form-item>

              <!-- invite -->
              <el-form-item prop="activeCode">
                <el-input
                  class="contains-icon"
                  :placeholder="$t('regis.inviteCodeOption')"
                  prefix-icon="el-icon-lock"
                  v-model.trim="formData.activeCode"
                />
              </el-form-item>

              <el-button
                type="primary"
                class="commonBtn_bg"
                :loading="loading"
                native-type="submit"
              >
                {{ $t("regis.regis") }}
              </el-button>

              <div class="login-tip">
                <span class="e2">{{ $t("regis.haveAccount") }}</span>
                <span
                  class="active-text e2"
                  @click="$router.push({ path: '/user/login' })"
                >
                  {{ $t("regis.loginNow") }}
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
  regisApi,
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
        newLoginPassword: "",
        activeCode: "",
        signType: "",
        code: "",
        email: "",
        phone: "",
      },

      rules: {
        loginName: [
          { required: true, message: this.$t("regisAndLogin.plsInputUserName"), trigger: ["blur", "change"] },
        ],
        phone: [
          { required: true, message: this.$t("regisAndLogin.plsInputPhoneNum"), trigger: ["blur", "change"] },
        ],
        loginPassword: [
          { min: 6, message: this.$t("regisAndLogin.plsInputPsw"), trigger: ["blur", "change"] },
        ],
        // activeCode: [
        //   { min: 6, message: this.$t("regis.inviteCodeOption"), trigger: ["blur", "change"] },
        // ],
        newLoginPassword: [
          {
            validator: (rule, value, cb) => {
              // 确认密码：必须与 loginPassword 一致
              if (!value) return cb(new Error(this.$t("regis.plsConfirmPsw")));
              if (value !== this.formData.loginPassword) {
                return cb(new Error(this.$t("regis.pswNotSame") || "两次密码不一致"));
              }
              cb();
            },
            trigger: ["blur", "change"],
          },
        ],
        email: [
          {
            validator: (rule, value, cb) => {
              if (this.loginType !== "email") return cb();
              if (!value) return cb(new Error(this.$t("regisAndLogin.plsInputEmail")));
              const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
              return ok
                ? cb()
                : cb(new Error(this.$t("regisAndLogin.plsInputEmail") || "邮箱格式不正确"));
            },
            trigger: ["blur", "change"],
          },
        ],
        code: [
          {
            validator: (rule, value, cb) => {
              // account 注册：图形验证码必填
              // email/phone 注册：短信/邮箱验证码必填
              if (this.loginType === "account") {
                if (!value) return cb(new Error(this.$t("regisAndLogin.plsInputCode")));
                return cb();
              }
              if (this.loginType === "email" || this.loginType === "phone") {
                if (!value) return cb(new Error(this.$t("regisAndLogin.plsInputCode")));
                return cb();
              }
              cb();
            },
            trigger: ["blur", "change"],
          },
        ],
        activeCode: [
          {
            validator: (rule, value, cb) => {
              if (this.loginType === "account") {
                if (!value) return cb(new Error(this.$t("utils.plsInput") + this.$t("regis.inviteCodeOption")));
                return cb();
              }
              cb();
            },
            trigger: ["blur", "change"],
          },
        ],
      },

      // 你原来保留的字段
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

  watch: {
    "$route.query"(val) {
      if (this.$route && this.$route.query && val.invite_code) {
        this.formData.activeCode = val.invite_code;
      }
    },
  },

  mounted() {
    this.initActiveCode();
  },

  computed: {
    ...mapGetters(["themeName", "language", "languageData"]),
    codeUrl() {
      this.timestamp = Date.now();
      return `${config.baseUrl}/api/user/easyGenerateCode?codeType=REGISTER&timestamp=${this.timestamp}`;
    },
  },

  created() {
    this.getAreaDataFun();
  },

  methods: {
    ...mapActions(["login", "getUserInfoData"]),
    ...mapMutations(["SET_USER_INFO", "SET_LANGUAGE"]),

    initActiveCode() {
      if (this.$route && this.$route.query && this.$route.query.invite_code) {
        this.formData.activeCode = this.$route.query.invite_code;
      }
    },

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

    // ✅ 注册发送验证码：email/phone 都必须先验证对应字段
    sendCode(type) {
      if (this.codeTime > 0 || this.codeLoading) return;
      if (type !== "email" && type !== "phone") return;

      const field = type === "email" ? "email" : "phone";

      this.$refs.form.validateField(field, (errMsg) => {
        if (errMsg) return; // 不通过：表单下方自动提示

        if (type === "phone" && !this.value) {
          this.$message.error(this.$t("regisAndLogin.plsSelect") || "请选择区号");
          return;
        }

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
          codeType: "REGISTER",
          email: this.formData.email,
        });

        if (res?.data?.code == 200) {
          this.$message({
            message: this.$t("regisAndLogin.sendCodeToEmail"),
            type: "success",
          });
          this.startCodeTimer(60);
        } else {
          this.$message.error(
            res?.data?.msg || this.$t("regisAndLogin.sendCodeFail") || "发送失败"
          );
        }
      } catch (e) {
        this.$message.error(
          e?.message || this.$t("regisAndLogin.sendCodeFail") || "发送失败"
        );
      } finally {
        this.codeLoading = false;
      }
    },

    async doSendMobileCode() {
      this.codeLoading = true;
      try {
        const res = await sendMobileCode({
          codeType: "REGISTER",
          phone: `${this.value}${this.formData.phone}`,
        });

        if (res?.data?.code == 200) {
          this.$message({
            message: this.$t("regisAndLogin.sendCodeSuccess"),
            type: "success",
          });
          this.startCodeTimer(60);
        } else {
          this.$message.error(
            res?.data?.msg || this.$t("regisAndLogin.sendCodeFail") || "发送失败"
          );
        }
      } catch (e) {
        this.$message.error(
          e?.message || this.$t("regisAndLogin.sendCodeFail") || "发送失败"
        );
      } finally {
        this.codeLoading = false;
      }
    },

    // ✅ 切换 tab：不要删字段，不然 validateField 会找不到
    setFormConfigFun(type) {
      this.loginType = type;

      // 保留完整结构，避免 rules 校验字段丢失
      this.formData = {
        loginName: "",
        loginPassword: "",
        newLoginPassword: "",
        activeCode: this.formData.activeCode || "",
        signType: "",
        code: "",
        email: "",
        phone: "",
      };

      this.codeTime = 0;
      this.codeLoading = false;

      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    },

    // ✅ 注册提交：按类型组装 signType / phone
    regisFun() {
      // 先做一次表单校验（避免直接提交空字段）
      this.$refs.form.validate((valid) => {
        if (!valid) return;

        const payload = { ...this.formData };

        payload.signType =
          this.loginType == "account" ? 3 : this.loginType == "email" ? 1 : 2;

        // phone 注册：拼接区号（注意不要污染 input 展示，所以用 payload）
        if (this.loginType === "phone") {
          payload.phone = `${this.value}${this.formData.phone}`;
        }

        this.loading = true;

        regisApi(payload)
          .then((res) => {
            this.loading = false;

            if (res?.data?.code == 200) {
              this.$message({
                message: this.$t("regis.regisSuccessTip"),
                type: "success",
              });
              setTimeout(() => {
                this.$router.push({ path: "/user/login" });
              }, 1000);
            } else {
              this.$message.error(res?.data?.msg || "注册失败");
            }
          })
          .catch((error) => {
            this.loading = false;
            console.log(error);
            this.$message.error(error?.message || "注册失败");
          });
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
      width: 500px;
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
          padding:5px;
          cursor: pointer;
        }
        .commonBtn_bg {
            width: 90px;
            height: 30px;
            line-height: 30px;
            cursor: pointer;
            border-radius: 15px;
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
      margin-top: 8px;
    }

    .login-tip {
      font-size: 14px;
      margin-top: 20px;
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
