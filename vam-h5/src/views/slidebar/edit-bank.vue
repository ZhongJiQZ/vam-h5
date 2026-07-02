<!-- 编辑银行卡 -->
<template>
  <div class="bind-card page-edit-bank">
    <header class="bind-card-header">
      <button type="button" class="bind-card-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="bind-card-header__back-icon" />
      </button>
      <h1 class="bind-card-header__title">{{ _t18('Bank_edit') }}</h1>
      <button type="button" class="bind-card-header__action" aria-label="delete" @click="onDeleteBank">
        <svg-load name="sanchu24x24" class="bind-card-header__delete-icon" />
      </button>
    </header>

    <div class="content">
      <div class="section-head section-head--form">
        <h3>{{ _t18('Bank_edit') }}</h3>
      </div>
      <div class="form">
        <div class="formInput">
          <p class="label">{{ _t18('advanced_name') }}</p>
          <input
            :placeholder="_t18('login_please')"
            v-model="bindUserName"
            class="form-input"
          />
        </div>
        <div class="formInput">
          <p
            class="label"
            v-if="['trustwallet', 'coinmarketcap', 'kabit', 'etfinex', 'ebc'].includes(_getConfig('_APP_ENV'))"
          >
            {{ _t18('bank_account') }}
          </p>
          <p class="label" v-else>{{ _t18('Bank_card_number') }}</p>
          <input
            :placeholder="_t18('login_please')"
            v-model="formData.cardNumber"
            class="form-input"
          />
        </div>
        <div class="formInput">
          <p
            class="label"
            v-if="['trustwallet', 'coinmarketcap', 'kabit', 'etfinex', 'ebc'].includes(_getConfig('_APP_ENV'))"
          >
            {{ _t18('bank_name') }}
          </p>
          <p class="label" v-else>
            {{ _t18('Bank_own') }}
          </p>
          <van-field
            class="form-input"
            is-link
            readonly
            v-model="formData.bankName"
            :placeholder="_t18('login_please')"
            @click="showBankPicker = true"
          />
        </div>
        <div class="formInput" v-if="formData.bankBranch">
          <p
            class="label"
            v-if="['trustwallet', 'coinmarketcap', 'kabit', 'etfinex', 'ebc'].includes(_getConfig('_APP_ENV'))"
          >
            {{ _t18('branch_namee') }}
          </p>
          <p class="label" v-else>{{ _t18('branch_name') }}</p>
          <input
            :placeholder="_t18('login_please')"
            v-model="formData.bankBranch"
            class="form-input"
          />
        </div>
        <div class="formInput" v-if="['HFM2', 'dev'].includes(_getConfig('_APP_ENV'))">
          <p class="label">
            {{ _t18('recharge_coin') }}
          </p>
          <van-field
            class="form-input"
            is-link
            readonly
            v-model="formData.coin"
            :placeholder="_t18('recharge_coin')"
            @click="showCoinPicker = true"
          />
          <van-action-sheet
            v-model:show="showCoinPicker"
            class="assets-picker-sheet"
            :actions="bankCoinList"
            @select="onBankCoinConfirm"
          />
        </div>
      </div>
      <div class="btnBox" @click="submit">
        <ButtonBar :btnValue="_t18('Bank_save')" />
      </div>
    </div>

    <van-popup
      v-model:show="showBankPicker"
      position="bottom"
      :style="{ height: '72%', maxWidth: 'var(--ex-max-width)', left: '50%', translate: '-50%' }"
    >
      <div class="bank-picker">
        <div class="bank-picker__header">
          <span>{{ _t18('Bank_own') }}</span>
          <span class="bank-picker__close" @click="showBankPicker = false">×</span>
        </div>
        <div class="bank-picker__search">
          <div class="bank-picker__search-inner">
            <span class="bank-picker__search-icon">🔎</span>
            <input v-model.trim="bankKeyword" type="text" :placeholder="_t18('enter_search_keywords')" />
          </div>
          <p v-if="formData.bankName" class="bank-picker__selected">
            {{ _t18('Bank_own') }}: <span class="val">{{ formData.bankName }}</span>
          </p>
        </div>
        <div class="bank-picker__list">
          <div
            v-for="name in filteredBankOptions"
            :key="name"
            class="bank-picker__item"
            :class="{ 'bank-picker__item--active': formData.bankName === name }"
            @click="selectBankName(name)"
          >
            <span class="txt">{{ name }}</span>
            <span v-if="formData.bankName === name" class="ok">✓</span>
          </div>
          <div v-if="filteredBankOptions.length === 0" class="bank-picker__empty">
            {{ _t18('no_more_data') }}
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import { showConfirmDialog, showToast } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { delBindCard, updateBindCard } from '@/api/account'
import { _back, _t18, _getConfig } from '@/utils/public'
import { useToast } from '@/hook/useToast'
import { useUserStore } from '@/store/user/index'
import { dict } from '@/api/common/index.js'
import { storeToRefs } from 'pinia'
import { PHILIPPINE_BANK_OPTIONS } from '@/constants/philippineBanks'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import '@/views/assets/styles/picker-sheet.scss'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const { _toast, _showName } = useToast()
const Route = useRoute()
const Router = useRouter()

const formData = reactive(JSON.parse(decodeURI(Route.query.data)))
const bindUserName = ref(formData.userName || userInfo.value.user?.loginName)
const showBankPicker = ref(false)
const bankKeyword = ref('')

const filteredBankOptions = computed(() => {
  const kw = bankKeyword.value.toUpperCase()
  if (!kw) return PHILIPPINE_BANK_OPTIONS
  return PHILIPPINE_BANK_OPTIONS.filter((n) => n.toUpperCase().includes(kw))
})

const selectBankName = (name) => {
  formData.bankName = name
  formData.bankCode = name
  showBankPicker.value = false
}

const onDeleteBank = async () => {
  if (formData.id == null || formData.id === '') {
    return
  }
  try {
    await showConfirmDialog({
      message: _showName('Bank_delete'),
      confirmButtonText: _showName('btnConfirm'),
      cancelButtonText: _showName('cancel'),
      confirmButtonColor: '#a13cff'
    })
    const res = await delBindCard(formData.id)
    if (res.code == '200') {
      _toast('Bank_delete_success')
      setTimeout(() => {
        Router.push('/bind-card')
      }, 500)
    } else {
      showToast(res.msg || '')
    }
  } catch (e) {
    // 用户取消确认框
  }
}

const bankCoinList = ref([])
const showCoinPicker = ref(false)

const getBankCoinList = () => {
  dict('t_bank_coin').then((res) => {
    if (res.code == '200' && res.data.length) {
      bankCoinList.value = res.data.map((item) => ({
        ...item,
        name: item.dictValue.toUpperCase()
      }))
    }
  })
}

const onBankCoinConfirm = (item) => {
  formData.coin = item.name
  showCoinPicker.value = false
}

onMounted(() => {
  getBankCoinList()
})

const submit = () => {
  formData.bankCode = formData.bankName
  updateBindCard(formData).then((res) => {
    if (res.code == '200') {
      _toast('Bank_update_success')
      setTimeout(() => {
        Router.push('/bind-card')
      }, 500)
    } else {
      showToast(res.msg || '')
    }
  })
}
</script>

<style lang="scss" scoped>
.bind-card-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: calc(14px + env(safe-area-inset-top)) 18px 6px;
}

.bind-card-header__back {
  position: absolute;
  left: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.bind-card-header__back-icon {
  display: block;
  width: 10px;
  height: 18px;
  object-fit: contain;
  opacity: 0.9;
}

.bind-card-header__title {
  margin: 0;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
  text-align: center;
}

.bind-card-header__action {
  position: absolute;
  right: 12px;
  top: calc(14px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.bind-card-header__delete-icon {
  font-size: 22px;
  opacity: 0.85;
}

.page-edit-bank {
  min-height: 100vh;
  background: #0a0610;
  color: #f5f3f8;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'PingFang SC', sans-serif;
}

.content {
  padding: 12px 14px 24px;
  background: transparent;
  box-sizing: border-box;

  .section-head {
    padding: 6px 4px 12px;
    margin: 0;
    border: none;
    background: transparent;
    box-shadow: none;
    border-radius: 0;

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #fff;
      letter-spacing: 0.01em;
    }
  }

  .section-head--form {
    margin-bottom: 0;
  }

  .form {
    padding: 4px 16px 18px;
    background: rgba(30, 21, 48, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    box-shadow: none;

    .formInput {
      margin-top: 16px;

      .label {
        color: rgba(255, 255, 255, 0.65);
        font-size: 13px;
        margin: 0 0 8px;
        padding-left: 2px;
      }

      input {
        width: 100%;
        height: 48px;
        background: rgb(34, 34, 34);
        border-radius: 25px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0 16px;
        font-size: 14px;
        color: #fff;
        box-sizing: border-box;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &::placeholder {
          color: rgba(255, 255, 255, 0.45);
          font-size: 14px;
        }

        &:focus {
          border-color: rgba(160, 65, 237, 0.55);
          box-shadow: 0 0 0 3px rgba(160, 65, 237, 0.12);
        }
      }

      :deep(.van-cell) {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 25px;
        background: rgb(34, 34, 34);
        min-height: 48px;
        padding: 12px 16px !important;
        color: #fff;
        transition: border-color 0.2s ease;

        &:active {
          border-color: rgba(160, 65, 237, 0.55);
        }

        .van-field__control {
          color: #fff;
        }

        .van-field__control::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }
      }
    }
  }

  .btnBox {
    margin-top: 22px;
  }
}

.btnBox :deep(.btn1),
.btnBox :deep(.btn2) {
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%) !important;
  border: none !important;
  border-radius: 999px !important;
  height: 48px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35) !important;
  letter-spacing: 0.02em;
}

.bank-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1325;
  color: #f5f3f8;
}

.bank-picker__header {
  padding: 16px 18px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.bank-picker__close {
  font-size: 22px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.55);
  padding: 0 2px;
  cursor: pointer;
}

.bank-picker__search {
  padding: 10px 16px;
  position: sticky;
  top: 0;
  background: #1a1325;
  z-index: 2;
}

.bank-picker__search-inner {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgb(34, 34, 34);
  border-radius: 25px;
  padding: 0 14px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    outline: none;
    box-sizing: border-box;
    font-size: 14px;
    color: #fff;

    &::placeholder {
      color: rgba(255, 255, 255, 0.45);
    }
  }
}

.bank-picker__search-icon {
  font-size: 14px;
  opacity: 0.6;
  flex-shrink: 0;
  filter: grayscale(1) brightness(2);
}

.bank-picker__selected {
  margin: 10px 4px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);

  .val {
    color: rgb(196, 124, 255);
    font-weight: 500;
  }
}

.bank-picker__list {
  flex: 1;
  overflow: auto;
  padding: 0 16px 12px;
}

.bank-picker__item {
  padding: 14px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
}

.bank-picker__item .txt {
  min-width: 0;
}

.bank-picker__item .ok {
  color: rgb(160, 65, 237);
  font-weight: 700;
}

.bank-picker__item--active {
  background: rgba(160, 65, 237, 0.08);
  border-radius: 8px;
  padding-left: 10px;
  padding-right: 10px;
}

.bank-picker__item--active .txt {
  color: #fff;
}

.bank-picker__empty {
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
  padding: 32px 0;
  font-size: 13px;
}
</style>
