<template>
  <div class="bg">
    <HeaderBar :currentName="_t18('bind_address')" :border_bottom="true"></HeaderBar>
    <div class="form">
      <div class="form-item">
        <div class="label">
          <!-- 请选择链 -->
          {{ _t18('please_select_a_chain') }}
        </div>
        <div class="input" @click="openCoinSheet">
          <img :src="iconSrcImg" class="coin" />
          <div class="tit">{{ form.type }}</div>
          <div class="tip">
            <van-icon name="arrow-down" />
          </div>
        </div>
      </div>
      <div class="form-item">
        <div class="label">
          <!-- 请输入钱包地址 -->
          {{ _t18('withdrawal_Please_enter_address') }}
        </div>
        <div class="input">
          <van-field
            class="code-input address"
            clearable
            type="text"
            inputmode="text"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            v-model="form.address"
            :placeholder="_t18('withdrawal_Please_enter_address')"
          />
          <div class="tip" @click="getPaste">
            <!-- 粘贴 -->
            {{ _t18('paste') }}
          </div>
        </div>
         <!-- 已绑定的钱包地址 --> 
        <div style="color:#4bbd83" class="label" v-if="address"> 
          {{ address }}
        </div> 
        <div class="label" v-if="email"> 
          <div class="item">
            <div class="text">{{ _t18('login_emailCode') }}</div>
            <div class="input">
              <input class="code-input" type="text" readonly v-model="form.email" :placeholder="_t18('recharge_input')" />
            </div>
          </div>
        </div>
        <div class="label" v-if="email"> 
          <div class="item">
            <div class="text">{{ _t18('verification_code') }}</div>
            <div class="input">
              <van-field type="number" clearable class="code-input code" v-model="form.code" :placeholder="_t18('recharge_input')" />
              <div  v-if="flag" class="code-box">
                <div class="wait-code">
                  <van-count-down :time="time" format="ss" @finish="finish" />
                </div> 
              </div>

              <div v-if="!flag&&email" class="code-box"> 
                 <div class="send-code"  @click="handleSend">{{ _t18('login_send') }}</div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      <van-button v-if="email"  block class="submit" :loading="loading" @click="bindAddress">{{ _t18('btnConfirm') }}</van-button>
      <van-button v-if="!email" block class="submit" :loading="loading" @click="$router.push('/email-authentication')">{{ _t18('sidebar_unbindEmail') }},{{ _t18('sidebar_addEmail') }}</van-button>
      <div class="label" style="text-align: center;" v-if="bindSuccessfully">
          {{ _t18('Fund_password_set_success') }}
     </div>
    </div>
    <van-action-sheet
      v-if="coinList.length"
      v-model:show="coinSheet"
      :actions="coinList"
      @select="onSelect"
      :cancel-text="_t18('cancel')"
    />
  </div>
</template>

<script setup>
import HeaderBar from '@/components/HeaderBar/index.vue'
import { storageDict } from '@/config/dict'
import { updateUserAddressByEmail } from '@/api/account'
// import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user/index'
import { useMainStore } from '@/store/index'
import { storeToRefs } from 'pinia'
import { computed, ref, watch, watchEffect } from 'vue'
import { useToast } from '@/hook/useToast'
import ERCIMG from '/resource/images/defi/ERC.png'
import TRCIMG from '/resource/images/defi/TRC.png'
import { _t18 } from '@/utils/public'
// import { computed } from 'vue'
import { _hideAddress } from '@/utils/public'
import { emailCode, emailBind } from '@/api/user'

const { _toast } = useToast()
const userStore = useUserStore()
const mainStore = useMainStore()
const router = useRouter()
const coinSheet = ref(false)
const currentIndex = ref(0)
const iconSrcImg = computed(() => (currentIndex.value == 1 ? TRCIMG : ERCIMG))
const userId = computed(() => userStore.userInfo.user?.userId)
const address = computed(() => userStore.userInfo.user?.address)
const email = computed(() => userStore.userInfo.user?.email)
const walletType = computed(() => userStore.userInfo.user?.walletType)
const bindSuccessfully = ref(false);

/**
 * 绑定地址
 */
const form = ref({
  type: 'ETH',
  email:email.value,
  code:'',
  address: ''
})
const loading = ref(false)
const coinList = ref([
  {
    name: 'ETH'
  },
  {
    name: 'TRX'
  }, 
])

// 倒计时
const time = ref(0)
const flag = ref(false)
const handleSend = () => {
  // 邮箱发送验证码
  if (form.value.email == '') { 
    _toast('login_please_emailCode')
    return
  }
  flag.value = true
  time.value = 60 * 1000
  //send email code 
  emailCode('BIND', form.value.email).then((res) => {
    if (res.code == '200') {
      // flag.value = true
      // time.value = 60 * 1000
    } else {
      flag.value = false;
      showToast(res.msg)
    }
  })
}
// 倒计时结束
const finish = () => {
  flag.value = false
}

const normalizeWalletType = (v) => {
  const x = String(v || '').toUpperCase().trim()
  if (x === 'ERC' || x === 'ETH') return 'ETH'
  if (x === 'TRC' || x === 'TRON' || x === 'TRX') return 'TRX'
  return '' // 未知就不强制
}

const setSelectedChain = (type) => {
  const t = normalizeWalletType(type) || 'ETH'
  form.value.type = t
  currentIndex.value = t === 'TRX' ? 1 : 0
}

const autoFillLocked = ref(false)
const autoChainLocked = ref(false) // ✅ 新增：链选择锁


// watch(
//   () => form.value.address,
//   (v, oldV) => {
//     // 用户主动输入/删除触发（oldV 不是 undefined）
//     if (oldV !== undefined && v !== oldV) {
//       // 只要用户动过，就锁住自动回填
//       autoFillLocked.value = true
//     }
//   }
// )

watchEffect(() => {
  const addr = (address.value ?? '').toString()

  // 地址自动回填逻辑（你现在这段可以继续用）
  if (!addr.trim()) {
    form.value.address = ''
    autoFillLocked.value = true
  } else {
    if (!autoFillLocked.value && !form.value.address) {
      // form.value.address = addr.trim()
    }
  }

  // ✅ 链默认选中：只在用户没手动选过的时候才自动同步 store
  if (!autoChainLocked.value) {
    const wt = normalizeWalletType(walletType.value)
    if (wt && form.value.type !== wt) {
      setSelectedChain(wt)
    }
  }
})


/**
 * 当前选中的
 */
 const onSelect = (item, index) => {
  autoChainLocked.value = true // ✅ 用户手动选过链了，不要再被 store 覆盖
  currentIndex.value = index
  form.value.type = item.name
  coinSheet.value = false
  form.value.address = "";
}


const openCoinSheet = () => {
  coinSheet.value = true
}
/**
 * 获取粘贴板内容
 */
const getPaste = async () => {
  form.value.address = await navigator.clipboard.readText()
}
/**
 * 绑定地址
 */
const bindAddress = () => {
  const raw = form.value.address || ""
  const addrTrim = raw.trim() 
  const finalAddr = form.value.type === 'ETH' ? addrTrim.toLowerCase() : addrTrim

  // 绑定地址
  if (!form.value.address) { 
    return _toast(`wallet_address_cannot_be_empty`)
  }
  if (!form.value.code) { 
    return _toast(`please_code`)
  }
  // 2) 格式校验（放在请求前）
  const ok = validateAddress(form.value.type, finalAddr)
  if (!ok) {
    return _toast(`invalid_address`) // 你 i18n 里加一个 invalid_address
  }

  loading.value = true
  const userStore = useUserStore()
  const { userInfo } = storeToRefs(userStore)
  const coinType = form.value.type == 'ETH' ? "ETH" : "TRX";
  const emailCode = form.value.code;

  updateUserAddressByEmail({
    email:email.value,
    emailCode:emailCode,
    type: coinType,
    address: finalAddr,
    userId: userInfo.value.user?.userId
  })
    .then(async (res) => {
      if (res.code == 500) {
        _toast(`error: ${res.msg}`);
        return;
      }
      // 设置成功
      _toast(`set_success`)
      const newAddr = finalAddr
      // form.value.address = finalAddr;

      if (userInfo.value?.user) {
        userInfo.value.user.address = newAddr
        userInfo.value.user.walletType = form.value.type;
      }

      // 2) 立刻同步写 localStorage（同一个 key）
      localStorage.setItem(storageDict.USER_INFO, JSON.stringify(userInfo.value))
      // 3) 再异步拉一次服务端，校准最终值（可 await
      await userStore.getUserInfo()
      bindSuccessfully.value = true;
      form.value.address = '';
      address.value = newAddr
      // router.back()
    })
    .finally(() => {
      loading.value = false
    })
}
// const handleGoEmail = ()=>{
//   router.push('/sign-in')
// }
/**
 * 地址校验：ETH / TRX
 */
 const validateAddress = (type, address) => {
  const v = (address || '').trim()
  if (!v) return false

  // ETH: 0x + 40 hex
  if (type === 'ETH') {
    return /^0x[a-fA-F0-9]{40}$/.test(v)
  }

  // TRX(TRON): T + 33 base58 (排除 0OIl)
  if (type === 'TRX') {
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(v)
  }

  return true
}

</script>

<style lang="scss" scoped>
* {
  color: var(--ex-default-font-color);
  font-size: 14px;
}
:deep(.nav--bar) {
  background: var(--ex-login-tab-background-color) !important;
  .nav--bar--text {
    position: absolute;
    left: 50px;
    top: 0;
  }
}

.bg {
  background: var(--ex-login-tab-background-color) !important;
}
.form {
  min-height: 100vh;

  background: var(--ex-login-tab-background-color) !important;
  border-radius: 15px 15px 0px 0px;
  overflow: hidden;
  padding: 0 15px 15px;
  .img {
    margin-left: 10px;
    width: 25px;
    min-width: 25px;

    height: 25px;
    margin-right: 17px;
  }
  .tit {
    width: 100%;
    font-size: 16px;
    font-family: ArialMT;
    line-height: 18px;
  }
  .form-item {
    .label {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      line-height: 20px;
      margin: 20px auto 10px;
      padding-left: 10px;
    }
    .input {
      position: relative;
      background: var(--ex-login-tab-background-color);
      border-radius: 4px;
      height: 40px;
      display: flex;
      align-items: center;
      padding-right: 10px;
      .coin {
        width: 25px;
        height: 25px;
        margin: 0 10px;
      }
      .input-field {
        width: 100%;
        line-height: 40px;

        height: 40px;
        padding: 0;
        background: transparent;
        :deep(.van-field__control) {
          padding-left: 10px;
        }
      }
      .tip {
        min-width: 40px;
        text-align: right;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: var(--primary-color);
        line-height: 40px;
      }
    }
  }
  .submit {
    margin: 50px auto 30px;
    background: var(--ex-div-bgColor1);
    color: var(--ex-font-color);
    border: none;
  }
}
 .send-code{
      font-size: 14px;
      border-radius: 5px;
  }
  .code-box {
        min-width: 44px;
        height: 30px;
        background: var(--ex-div-bgColor1);
        border-radius: 2px 2px 2px 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--ex-font-color);
        div {
          font-size: 14px;
          color: var(--ex-font-color);
        }
      }
 .code-input{
  width: 100%;
  height: 36px;
  padding: 5px;
  border: 1px solid #dcdfe6;   /* 边框颜色 */
  border-radius: 6px;          /* 圆角，可按你 UI 调 */
  outline: none;
  box-sizing: border-box;
}
.code-input.address{
   width: 90%;
   margin-left:10px;
 }
 .code-input.code{
   width: 40%;
   margin-right:5px;
 }
.code-input:focus{
  border-color: #20b26b;       /* 聚焦时变绿，按你截图的主色 */
  box-shadow: 0 0 0 2px rgba(32,178,107,.15);
}
/* ✅ 这样写才会命中：同一个元素同时拥有 code-input + address */
.code-input.address:focus{
  border-color: #20b26b;
  box-shadow: 0 0 0 2px rgba(32,178,107,.15);
}

/* ✅ 同理 */
.code-input.code:focus{
  border-color: #20b26b;
  box-shadow: 0 0 0 2px rgba(32,178,107,.15);
}
.el-input__inner:focus{
  border-color:#20b26b;
  box-shadow:0 0 0 2px rgba(32,178,107,.15);
}

/* van-field 内部真实 input */
.code-input .van-field__control{
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 0 12px;
  height: 36px;
  box-sizing: border-box;
}

/* focus 命中内部 input */
.code-input .van-field__control:focus{
  border-color: #20b26b;
  box-shadow: 0 0 0 2px rgba(32,178,107,.15);
  outline: none;
}
</style>
