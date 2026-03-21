<template>
  <div class="exchange_form_main">
    <div class="exchange_form_inner">
      <div class="title num_bold bold">{{ $t("user.certified") }}
       <div v-if="tmpUser">({{$t("others.bindSuccess")}} {{ tmpUser.email }})</div>
      </div>
      <div class="exchange_form">
        <el-form
          :model="form"
          ref="form"
          label-width="90px"
          label-position="top"
          hide-required-asterisk="true"
        >
          <!-- email -->
          <el-form-item
            :label="$t('user.emailAddress')"
            prop="email"
            :rules="[
              {
                required: true,
                message: $t('user.plsFillEmailAddress'),
                trigger: 'blur',
              },
            ]"
          >
            <el-input
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
              :placeholder="$t('utils.plsInput')"
              v-model="form.emailCode"
            >
              <template slot="append">
                <el-button :loading="emailLoading" style="background-color: #0fad79; color: #ffffff;border: 1px solid #DCDFE6;" type="primary" @click="sendCode">{{ $t("user.send") }}</el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button :loading="loading" type="primary" class="confirm_btn" @click="handleBindEmail">
              <div >{{ $t("utils.confirm") }}</div>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { sendEmailCode, bindEmail } from "@/api/user";
import config from "@/config/index"; // <- 如需改成 "@/api/user" 自己调整

export default {
  props: {
    textInfo: Object,
    optionArr: Array,
    showRate: Boolean,
    beSelectValue: String,
    userInfo: Object,
  },
  data() {
    return {
      form: {
        email: "",
        emailCode: "",
      },
      tmpUser:{
         email:"",
      },
      loading:false,
      emailLoading:false,
    };
  },
  mounted(){
    const key = config.key + "-userInfo"; // 你项目可能是 storageDict.USER_INFO；按实际替换
    const info = JSON.parse(localStorage.getItem(key) || "{}");
    if (info?.content.user) {
        if (info.content.user.email) {
          this.tmpUser.email = info.content.user.email;
          this.form.email = info.content.user.email;
        }

    }
  },
  methods: {
    handleBindEmail() {
      if(this.form.email == "") {
        this.$message({
            message: this.$t("regisAndLogin.plsInputEmail"),
            type: "error",
          });
          return;
      }
      const emailReg =
          /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

        if (!emailReg.test(this.form.email)) {
          this.$message({
            message: this.$t("others.invalid_email"),
            type: "error",
          });
          return;
        }

      if(this.form.emailCode == "") {
        this.$message({
            message: this.$t("regisAndLogin.plsInputCode"),
            type: "error",
          });
          return;
      }
      this.loading = true;
      bindEmail({
        ...this.form,
      }).then((res) => {
        if (res.data.code == 200) {
          this.$message({
            message: this.$t("user.emailCerSuccess"), //邮箱认证成功
            type: "success",
          });
        }
      }).finally(()=>{
          this.loading = false;
      });
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

<style lang="scss" scoped>
.bold {
  font-weight: bold;
}

.exchange_form_main {
  width: 1200px;
  margin: auto;

  //background: red;
  .exchange_form_inner {
    width: 550px;
    padding: 40px 0;
  }

  .title {
    font-size: 24px;
    color: #1e2329;
  }

  .exchange_form {
    ::v-deep.el-form {
      .el-select {
        width: 350px;

        .select_box {
        }
      }

      .el-form-item__label {
        font-size: 14px;
        padding: 0;
      }

      .el-input__icon {
        line-height: 40px;
      }
    }
  }

  .confirm_btn {
    margin-top: 40px;
  }
}
.append {
    background-color: #0fad79;
    color: #ffffff;
    vertical-align: middle;
    display: table-cell;
    position: relative;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    padding: 0 20px;
    width: 1px;
    white-space: nowrap;
}
 
</style>
