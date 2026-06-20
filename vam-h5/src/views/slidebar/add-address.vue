<template>
  <div class="page page--bind-wallet">
    <header class="bind-wallet-header">
      <button type="button" class="bind-wallet-header__back" aria-label="back" @click="router.back()">
        <img :src="iconBack" alt="" class="bind-wallet-header__back-icon" />
      </button>
      <h1 class="bind-wallet-header__title">{{ _t18('bind_address') }}</h1>
      <span class="bind-wallet-header__spacer" aria-hidden="true"></span>
    </header>

    <main class="bind-wallet-main">
      <section class="bind-wallet-card">
        <h2 class="bind-wallet-card__label">{{ _t18('please_select_a_chain') }}</h2>
        <div class="bind-wallet-card__row bind-wallet-card__row--chain">
          <button type="button" class="bind-wallet-chain" @click="openCoinSheet">
            <span class="bind-wallet-chain__icon">
              <img :src="iconSrcImg" alt="" />
            </span>
            <span class="bind-wallet-chain__symbol">{{ form.type }}</span>
          </button>
          <span class="bind-wallet-chain__chevron" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14.31 0.96L8.17 9.09C8.06 9.23 7.91 9.35 7.75 9.44C7.58 9.52 7.4 9.56 7.21 9.56C7.03 9.56 6.85 9.52 6.68 9.44C6.51 9.35 6.37 9.23 6.26 9.09L0.12 0.96C0.05 0.87 0.01 0.77 0 0.66C-0.01 0.54 0.01 0.43 0.06 0.33C0.11 0.23 0.19 0.15 0.28 0.09C0.38 0.03 0.49 0 0.6 0L13.83 0C13.94 0 14.05 0.03 14.14 0.09C14.24 0.15 14.31 0.23 14.36 0.33C14.41 0.43 14.43 0.54 14.42 0.65C14.41 0.77 14.37 0.87 14.31 0.96Z"
                fill="rgba(255,255,255,0.650)"
                fill-rule="nonzero"
                transform="translate(4.79, 7.2)"
              />
            </svg>
          </span>
        </div>
      </section>

      <section class="bind-wallet-card">
        <h2 class="bind-wallet-card__label">{{ _t18('withdrawal_Please_enter_address') }}</h2>
        <div class="bind-wallet-card__row bind-wallet-card__row--address">
          <input
            v-model="form.address"
            class="bind-wallet-address__input"
            type="text"
            inputmode="text"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            :placeholder="_t18('swap_input')"
            :aria-label="_t18('withdrawal_Please_enter_address')"
          />
          <button type="button" class="bind-wallet-address__paste" @click="getPaste">
            {{ _t18('paste') }}
          </button>
        </div>

        <div v-if="address" class="bind-wallet-bound">{{ address }}</div>

        <template v-if="email">
          <h2 class="bind-wallet-card__label bind-wallet-card__label--sub">{{ _t18('login_emailCode') }}</h2>
          <div class="bind-wallet-card__row bind-wallet-card__row--plain">
            <input
              v-model="form.email"
              class="bind-wallet-address__input"
              type="text"
              readonly
              :placeholder="_t18('recharge_input')"
            />
          </div>
          <h2 class="bind-wallet-card__label bind-wallet-card__label--sub">{{ _t18('verification_code') }}</h2>
          <div class="bind-wallet-card__row bind-wallet-card__row--code">
            <input
              v-model="form.code"
              class="bind-wallet-address__input"
              type="digit"
              inputmode="numeric"
              :placeholder="_t18('recharge_input')"
            />
            <button v-if="flag" type="button" class="bind-wallet-code__timer" disabled>
              <van-count-down :time="time" format="ss" @finish="finish" />
            </button>
            <button v-else type="button" class="bind-wallet-address__paste" @click="handleSend">
              {{ _t18('login_send') }}
            </button>
          </div>
        </template>

        <div v-if="bindSuccessfully" class="bind-wallet-success">{{ _t18('Fund_password_set_success') }}</div>
      </section>

      <button
        v-if="email"
        type="button"
        class="bind-wallet-email"
        :class="{ 'bind-wallet-email--disabled': loading }"
        :disabled="loading"
        @click="bindAddress"
      >
        {{ loading ? _t18('loading') : _t18('btnConfirm') }}
      </button>
      <button v-else type="button" class="bind-wallet-email" @click="router.push('/email-authentication')">
        {{ _t18('sidebar_unbindEmail') }},{{ _t18('sidebar_addEmail') }}
      </button>
    </main>

    <van-action-sheet
      v-if="coinList.length"
      v-model:show="coinSheet"
      title=""
      class="assets-picker-sheet"
      style="max-width: var(--ex-max-width); left: 50%; translate: -50%"
    >
      <div class="picker-list">
        <button
          v-for="(item, index) in coinList"
          :key="item.name"
          type="button"
          class="picker-item"
          @click="onSelect(item, index)"
        >
          <span class="picker-item__icon">
            <img :src="index === 1 ? TRCIMG : ERCIMG" alt="" />
          </span>
          <span class="picker-item__label">{{ item.name }}</span>
        </button>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
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
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import '@/views/assets/styles/picker-sheet.scss'

const { _toast } = useToast()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const router = useRouter()
const coinSheet = ref(false)
const currentIndex = ref(0)
const iconSrcImg = computed(() => (currentIndex.value == 1 ? TRCIMG : ERCIMG))
const address = computed(() => userStore.userInfo.user?.address)
const email = computed(() => userStore.userInfo.user?.email)
const walletType = computed(() => userStore.userInfo.user?.walletType)
const bindSuccessfully = ref(false)

const form = ref({
  type: 'ETH',
  email: email.value,
  code: '',
  address: ''
})
const loading = ref(false)
const coinList = ref([{ name: 'ETH' }, { name: 'TRX' }])

const time = ref(0)
const flag = ref(false)
const handleSend = () => {
  if (form.value.email == '') {
    _toast('login_please_emailCode')
    return
  }
  flag.value = true
  time.value = 60 * 1000
  emailCode('BIND', form.value.email).then((res) => {
    if (res.code != '200') {
      flag.value = false
      showToast(res.msg)
    }
  })
}

const finish = () => {
  flag.value = false
}

const normalizeWalletType = (v) => {
  const x = String(v || '').toUpperCase().trim()
  if (x === 'ERC' || x === 'ETH') return 'ETH'
  if (x === 'TRC' || x === 'TRON' || x === 'TRX') return 'TRX'
  return ''
}

const setSelectedChain = (type) => {
  const t = normalizeWalletType(type) || 'ETH'
  form.value.type = t
  currentIndex.value = t === 'TRX' ? 1 : 0
}

const autoFillLocked = ref(false)
const autoChainLocked = ref(false)

watchEffect(() => {
  const addr = (address.value ?? '').toString()

  if (!addr.trim()) {
    form.value.address = ''
    autoFillLocked.value = true
  }

  if (!autoChainLocked.value) {
    const wt = normalizeWalletType(walletType.value)
    if (wt && form.value.type !== wt) {
      setSelectedChain(wt)
    }
  }
})

const onSelect = (item, index) => {
  autoChainLocked.value = true
  currentIndex.value = index
  form.value.type = item.name
  coinSheet.value = false
  form.value.address = ''
}

const openCoinSheet = () => {
  coinSheet.value = true
}

const getPaste = async () => {
  form.value.address = await navigator.clipboard.readText()
}

const bindAddress = () => {
  const raw = form.value.address || ''
  const addrTrim = raw.trim()
  const finalAddr = form.value.type === 'ETH' ? addrTrim.toLowerCase() : addrTrim

  if (!form.value.address) {
    return _toast('wallet_address_cannot_be_empty')
  }
  if (!form.value.code) {
    return _toast('please_code')
  }

  const ok = validateAddress(form.value.type, finalAddr)
  if (!ok) {
    return _toast('invalid_address')
  }

  loading.value = true
  const coinType = form.value.type == 'ETH' ? 'ETH' : 'TRX'
  const emailCodeVal = form.value.code

  updateUserAddressByEmail({
    email: email.value,
    emailCode: emailCodeVal,
    type: coinType,
    address: finalAddr,
    userId: userInfo.value.user?.userId
  })
    .then(async (res) => {
      if (res.code == 500) {
        _toast(`error: ${res.msg}`)
        return
      }
      _toast('set_success')
      const newAddr = finalAddr

      if (userInfo.value?.user) {
        userInfo.value.user.address = newAddr
        userInfo.value.user.walletType = form.value.type
      }

      localStorage.setItem(storageDict.USER_INFO, JSON.stringify(userInfo.value))
      await userStore.getUserInfo()
      bindSuccessfully.value = true
      form.value.address = ''
    })
    .finally(() => {
      loading.value = false
    })
}

const validateAddress = (type, addressVal) => {
  const v = (addressVal || '').trim()
  if (!v) return false

  if (type === 'ETH') {
    return /^0x[a-fA-F0-9]{40}$/.test(v)
  }

  if (type === 'TRX') {
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(v)
  }

  return true
}
</script>

<style lang="scss" scoped>
.page--bind-wallet {
  min-height: 100vh;
  background: #111111;
  color: #fff;
  padding-bottom: calc(79px + env(safe-area-inset-bottom, 0px));
}

.bind-wallet-header {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 22px 1fr 22px;
  align-items: center;
  min-height: 26px;
  padding: 0 12px;
}

.bind-wallet-header__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-left: -9px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.bind-wallet-header__back-icon {
  display: block;
  width: 12px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.bind-wallet-header__title {
  grid-column: 2;
  margin: 0;
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
}

.bind-wallet-header__spacer {
  grid-column: 3;
  width: 22px;
  height: 22px;
}

.bind-wallet-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 12px 0;
}

.bind-wallet-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 12px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.bind-wallet-card__label {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.85);

  &--sub {
    margin-top: 4px;
  }
}

.bind-wallet-card__row {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 5px 12px;
  border-radius: 25px;
  background: rgb(34, 34, 34);
}

.bind-wallet-card__row--chain {
  justify-content: space-between;
  gap: 12px;
}

.bind-wallet-chain {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  height: 32px;
  padding: 0 8px 0 4px;
  border: none;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
}

.bind-wallet-chain__icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 24px;
    height: 24px;
    display: block;
    border-radius: 50%;
    object-fit: cover;
  }
}

.bind-wallet-chain__symbol {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  white-space: nowrap;
}

.bind-wallet-chain__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  margin-left: auto;

  svg {
    width: 12px;
    height: 12px;
    display: block;
  }
}

.bind-wallet-card__row--address {
  justify-content: space-between;
  gap: 8px;
  padding-right: 5px;
}

.bind-wallet-card__row--plain,
.bind-wallet-card__row--code {
  justify-content: space-between;
  gap: 8px;
}

.bind-wallet-address__input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  line-height: 1.2;
  color: #fff;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
}

.bind-wallet-address__paste {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 24px;
  padding: 0 8px;
  border: none;
  border-radius: 999px;
  background: rgb(160, 65, 237);
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  cursor: pointer;
}

.bind-wallet-code__timer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 24px;
  padding: 0 8px;
  border: none;
  border-radius: 999px;
  background: rgba(160, 65, 237, 0.35);
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #fff;
  cursor: default;

  :deep(.van-count-down) {
    font-size: 14px;
    color: #fff;
    line-height: 1;
  }
}

.bind-wallet-bound {
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
  color: rgb(160, 65, 237);
}

.bind-wallet-success {
  text-align: center;
  font-size: 14px;
  color: rgb(160, 65, 237);
}

.bind-wallet-email {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 40px;
  padding: 10px 12px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35);
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: #fff;
  text-align: center;
  cursor: pointer;

  &:active {
    opacity: 0.92;
  }

  &--disabled {
    opacity: 0.65;
    pointer-events: none;
  }
}
</style>
