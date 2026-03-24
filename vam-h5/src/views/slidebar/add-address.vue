<template>
  <div class="page-add-address">
    <DarkHeaderBar :title="_t18('bind_address')" :border_bottom="true" />

    <div class="page-body">
      <div class="card">
        <div class="field-label">{{ _t18('please_select_a_chain') }}</div>
        <div class="chain-select" role="button" tabindex="0" @click="openCoinSheet">
          <img :src="iconSrcImg" class="coin" alt="" />
          <span class="chain-name">{{ form.type }}</span>
          <van-icon name="arrow-down" class="chevron" />
        </div>
      </div>

      <div class="card">
        <div class="field-label">{{ _t18('withdrawal_Please_enter_address') }}</div>
        <div class="address-input-wrap">
          <van-field
            v-model="form.address"
            class="address-field"
            :border="false"
            clearable
            type="text"
            inputmode="text"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            :placeholder="_t18('withdrawal_Please_enter_address')"
          />
          <span class="paste" @click="getPaste">{{ _t18('paste') }}</span>
        </div>

        <div v-if="address" class="bound-address">{{ address }}</div>

        <template v-if="email">
          <div class="field-label sub">{{ _t18('login_emailCode') }}</div>
          <div class="plain-input-wrap">
            <input
              v-model="form.email"
              class="plain-input"
              type="text"
              readonly
              :placeholder="_t18('recharge_input')"
            />
          </div>
          <div class="field-label sub">{{ _t18('verification_code') }}</div>
          <div class="code-row">
            <van-field
              v-model="form.code"
              type="digit"
              clearable
              class="code-field"
              :border="false"
              :placeholder="_t18('recharge_input')"
            />
            <div v-if="flag" class="code-box">
              <van-count-down :time="time" format="ss" @finish="finish" />
            </div>
            <div v-else class="code-box send" @click="handleSend">{{ _t18('login_send') }}</div>
          </div>
        </template>

        <van-button
          v-if="email"
          block
          round
          class="submit-btn"
          :loading="loading"
          @click="bindAddress"
        >
          {{ _t18('btnConfirm') }}
        </van-button>
        <van-button
          v-else
          block
          round
          class="submit-btn"
          :loading="loading"
          @click="router.push('/email-authentication')"
        >
          {{ _t18('sidebar_unbindEmail') }},{{ _t18('sidebar_addEmail') }}
        </van-button>

        <div v-if="bindSuccessfully" class="bind-success">{{ _t18('Fund_password_set_success') }}</div>
      </div>
    </div>

    <van-action-sheet
      v-if="coinList.length"
      v-model:show="coinSheet"
      :actions="coinList"
      @select="onSelect"
      :cancel-text="_t18('cancel')"
      style="max-width: var(--ex-max-width); left: 50%; translate: -50%"
    />
  </div>
</template>

<script setup>
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import { storageDict } from '@/config/dict'
import { updateUserAddressByEmail } from '@/api/account'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { computed, ref, watchEffect } from 'vue'
import { showToast } from 'vant'
import { useToast } from '@/hook/useToast'
import ERCIMG from '/resource/images/defi/ERC.png'
import TRCIMG from '/resource/images/defi/TRC.png'
import { _t18 } from '@/utils/public'
import { emailCode } from '@/api/user'

const { _toast } = useToast()
const userStore = useUserStore()
const router = useRouter()
const coinSheet = ref(false)
const currentIndex = ref(0)
const iconSrcImg = computed(() => (currentIndex.value == 1 ? TRCIMG : ERCIMG))
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
      bindSuccessfully.value = true
      form.value.address = ''
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
.page-add-address {
  min-height: 100vh;
  background: #05101a;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.page-body {
  min-height: calc(100vh - 60px - constant(safe-area-inset-top));
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: #f0f2f5;
  border-radius: 16px 16px 0 0;
  padding: 16px 15px 28px;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.field-label {
  font-size: 13px;
  color: #969799;
  margin-bottom: 10px;
  line-height: 1.4;

  &.sub {
    margin-top: 16px;
    margin-bottom: 8px;
  }
}

.chain-select {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 0 12px;
  background: #f7f8fa;
  border-radius: 8px;
  border: 1px solid #ebedf0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  .coin {
    width: 28px;
    height: 28px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .chain-name {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    color: #323233;
  }

  .chevron {
    color: #c8c9cc;
    font-size: 16px;
    flex-shrink: 0;
  }
}

.address-input-wrap {
  display: flex;
  align-items: center;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 0 4px 0 12px;
  background: #fff;
  min-height: 48px;
}

.address-field {
  flex: 1;
  padding: 0;
  background: transparent;
}

.page-add-address :deep(.address-field .van-field__body) {
  padding: 8px 0;
}

.page-add-address :deep(.address-field .van-field__control) {
  font-size: 15px;
  color: #323233;

  &::placeholder {
    color: #c8c9cc;
  }
}

.paste {
  flex-shrink: 0;
  padding: 8px 12px 8px 8px;
  font-size: 14px;
  color: #17ac74;
  -webkit-tap-highlight-color: transparent;
}

.bound-address {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-all;
  color: #17ac74;
}

.plain-input-wrap {
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 0 12px;
  background: #f7f8fa;
}

.plain-input {
  width: 100%;
  height: 44px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #323233;
  outline: none;

  &::placeholder {
    color: #c8c9cc;
  }
}

.code-row {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  padding: 0 8px 0 12px;
  min-height: 48px;
}

.code-field {
  flex: 1;
  padding: 0;
  background: transparent;
}

.page-add-address :deep(.code-field .van-field__body) {
  padding: 8px 0;
}

.page-add-address :deep(.code-field .van-field__control) {
  font-size: 15px;
  color: #323233;
}

.code-box {
  flex-shrink: 0;
  min-width: 52px;
  height: 32px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #17ac74;

  &.send {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
}

.page-add-address :deep(.code-box .van-count-down) {
  font-size: 14px;
  color: #17ac74;
}

.submit-btn {
  margin-top: 28px;
  height: 48px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  background: #00a619 !important;
  color: #fff !important;
}

.bind-success {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  color: #17ac74;
}
</style>
