<!-- 绑定钱包地址 bind wallet address (PC) -->
<template>
  <div class="bank_main">
    <div class="bank_header_box flex-center">
      <div class="header_inner flex-start">
        <div class="title num_Bold">
          <p>{{ $t("user.wallet") }}</p>
        </div>
      </div>
    </div>

    <div class="form_box">
      <div class="form_main" v-loading="loading">
        <div class="top_nav flex-start">
          <!-- 你原来可能有面包屑/导航，这里留空不影响 -->
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="160px"
          class="bind_form"
        >
          <!-- 请选择链 -->
          <el-form-item :label="$t('others.please_select_a_chain')" prop="type">
            <el-select
              v-model="form.type"
              style="width: 360px"
              :placeholder="$t('others.please_select_a_chain')"
            >
              <el-option
                v-for="(c, idx) in coinList"
                :key="idx"
                :label="c.label"
                :value="c.value"
              />
            </el-select>
          </el-form-item>

          <!-- 请输入钱包地址 -->
          <el-form-item :label="$t('others.withdrawal_Please_enter_address')" prop="address">
            <el-input
              v-model="form.address"
              style="width: 720px"
              :placeholder="$t('others.withdrawal_Please_enter_address')"
              autocomplete="off"
              spellcheck="false"
              clearable
            >
              <template #append>
                <el-button type="text" class="paste_btn" @click="getPaste">
                  {{ $t("paste") }}
                </el-button>
              </template>
            </el-input>

            <div class="hint">
               <sapn v-if="tmpUser.address != ''"> {{ $t("others.bind_already") }}</sapn> {{ tmpUser.address == "" ? addressHint : tmpUser.address}}
            </div>
          </el-form-item>
            <!-- email -->
          <el-form-item
             disabled
            :label="$t('user.emailAddress')"
            prop="email"
          >
            <el-input
            style="width:35%"
              type="text"
              :placeholder="$t('utils.plsInput')"
              v-model="form.email"
            >
            </el-input>
          </el-form-item>
          <!-- email code -->
          <el-form-item
            :label="$t('user.code')"
            prop="emailCode"
            :rules="[
              {
                required: true,
                message: $t('user.plsFillCode'),
                trigger: 'blur',
              },
            ]"
          >
            <el-input
              style="width:30%"
              type="number"
              clearable
              :placeholder="$t('utils.plsInput')"
              v-model="form.emailCode"
            >
              <template slot="append">
                <el-button :loading="emailLoading" style="background-color: #0fad79; color: #ffffff;border: 1px solid #DCDFE6;" type="primary" @click="sendCode">{{ $t("user.send") }}</el-button>
              </template>
            </el-input>
          </el-form-item>


          <div v-if="tmpUser.email" class="confirm_btn">
            <div
              class="btn"
              :class="{ disabled: loading }"
              @click="submit"
            >
              <i v-if="loading" class="el-icon-loading" style="margin-right:8px;"></i>
              {{ $t("assetsNav.wallet") }}
            </div>
          </div>

          <div v-if="tmpUser.email == ''" class="confirm_btn">
            <div
              class="btn"
              @click="$router.push('/user/index?key=certified')"
            >
              {{ $t("others.notyet_bind_email") }}
            </div>
          </div>

        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
// 注意接口路径可能不同：
// - H5 用的是 updateUserAddress from '@/api/account'
// - PC 这里你原本引的是 submitBankInfo from '@/api/user'
// 按你实际情况改一下 import 就行。
// 建议直接复用 H5 的 updateUserAddress 接口。
import { sendEmailCode,updateUserAddress } from "@/api/user"; // <- 如需改成 "@/api/user" 自己调整
import config from "@/config/index"; // <- 如需改成 "@/api/user" 自己调整

export default {
  props: {
    isBindWallet: Boolean,
  },
  data() {
    return {
      loading: false,
      form: {
        type: "ETH",
        address: "",
      },
      tmpUser:{
         walletType:"",
         address:"",
         email:"",
      },
      loading:false,
      emailLoading:false,
      coinList: [
        { label: "ETH", value: "ETH" },
        { label: "TRX", value: "TRX" },
      ],

      rules: {
        type: [
          { required: true, message: this.$t("others.please_select_a_chain"), trigger: "change" },
        ],
        address: [
          {
            required: true,
            message: this.$t("others.wallet_address_cannot_be_empty"),
            trigger: "blur",
          },
          {
            validator: (rule, val, cb) => {
              const v = (val || "").trim();
              if (!v) return cb();

              // 基础校验（按链类型粗略判断，不够严格但能挡住明显错误）
              if (this.form.type === "ERC") {
                // ETH 地址：0x + 40 hex
                const ok = /^0x[a-fA-F0-9]{40}$/.test(v);
                if (!ok) return cb(new Error(this.$t("others.invalid_address") || "Invalid address"));
              }else if (this.form.type === "TRX") {
                // TRON 地址：T 开头，Base58，长度通常 34
                const ok = /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(v);
                if (!ok) return cb(new Error(this.$t("others.invalid_address") || "Invalid address"));
              }
              cb();
            },
            trigger: "blur",
          },
        ],
      },
    };
  },

  computed: {
    addressHint() {
      if (this.form.type === "ETH") return "ETH: 0x...";
      if (this.form.type === "TRX") return "TRX: T... ";
      return "";
    },
  },

  mounted(){
    const key = config.key + "-userInfo"; // 你项目可能是 storageDict.USER_INFO；按实际替换
    const info = JSON.parse(localStorage.getItem(key) || "{}");
    if (info?.content.user) {
        if (info.content.user.email) {
          this.tmpUser.email = info.content.user.email;
          this.tmpUser.walletType = info.content.user.walletType;
          this.tmpUser.address = info.content.user.address;
          this.form.email = info.content.user.email;
        }

    }
  },
  methods: {
    async getPaste() {
      // PC 端粘贴：优先用 Clipboard API，失败就降级提示用户手动 Ctrl+V
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text) this.form.address = text;
          return;
        }
      } catch (e) {
        // ignore, fallback below
      }

      this.$message({
        type: "warning",
        message: this.$t("paste_permission_denied") || "Clipboard unavailable. Please paste with Ctrl+V.",
      });
    },

    async submit() {
      if (this.loading) return;

      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return;

        const addr = (this.form.address || "").trim().toLowerCase();
        const type = this.form.type == 'ERC' ? "ETH" : "TRX";

        this.loading = true;
        try {
          // userId 获取：按你项目的 Vuex / localStorage 结构调整
          const userId = this.getUserId();
          if (!userId) {
            this.$message({
              type: "warning",
              message: this.$t("others.userid_null"),
            });
            return;
          }

          const res = await updateUserAddress({
            type,
            address: addr,
            userId,
            email:this.form.email,
            emailCode:this.form.emailCode,
          });

          // 兼容你 H5 的 res.code 判断
          if (res && (res.code === 500 || res.code === "500")) {
            this.$message.error(`error: ${res.msg || ""}`);
            return;
          }

          this.$message.success(this.$t("others.bindSuccess"));

          // 同步本地用户信息（按你项目 key 调整）
          // 这里不强依赖 store 结构：有 store 就更新，没有就只写 localStorage
          try {
            const key = config.key + "-userInfo"; // 你项目可能是 storageDict.USER_INFO；按实际替换
            const info = JSON.parse(localStorage.getItem(key) || "{}");
            if (info?.content.user) {
              info.content.user.address = addr;
              info.content.user.walletType = type; // ✅ 修正：赋值
              localStorage.setItem(key, JSON.stringify(info));
              this.tmpUser.address = addr;
            }
          } catch (e) {}

        } catch (e) {
          this.$message.error(e?.message || "Network error");
        } finally {
          this.loading = false;
        }
      });
    },

    getUserId() {
        const id1 = this.$store?.state?.userInfo?.user?.userId
                || this.$store?.state?.user?.userId;
        if (id1) return id1;
        try {
          const raw = localStorage.getItem("coin_web-userInfo"); // 或你项目的 key
          const obj = raw ? JSON.parse(raw) : null;
          const id2 = obj?.content.user?.userId;
          if (id2) return id2;
        } catch (e) {}

        return null;
    },

    sendCode() {
      this.emailLoading = true;
      sendEmailCode({
        codeType: "BIND",
        email: this.form.email,
      }).then((res) => {
        this.emailLoading = false;
        if (res.data.code == 200) {
          this.$message({
            message: this.$t("user.sendCodeToEmail"), //验证码已发送到您的邮箱，请注意查收
            type: "success",
          });
        }
      });
    },

  },
};
</script>

<style lang="scss">
.bank_main {
  .bank_header_box {
    width: 100%;
    height: 125px;
    background: #dddddd;

    .header_inner {
      width: 1200px;
      height: 100%;
      margin: auto;

      .title {
        p {
          font-size: 36px;
        }
      }
    }
  }

  .form_box {
    width: 1200px;
    margin: auto;

    .top_nav {
      height: 76px;
      gap: 10px;
    }

    .form_main {
      width: 1200px;
      margin: auto;
      padding: 30px 0 60px;

      .bind_form {
        padding: 20px 0;
      }

      .hint {
        margin-top: 10px;
        font-size: 12px;
        color: #999;
      }

      .paste_btn {
        padding: 0 10px;
      }

      .confirm_btn {
        margin-top: 40px;

        .btn {
          width: 227px;
          height: 40px;
          line-height: 40px;
          color: #fff;
          text-align: center;
          font-size: 14px;
          background: #536fff;
          border-radius: 4px;
          cursor: pointer;
          user-select: none;
        }

        .btn.disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
