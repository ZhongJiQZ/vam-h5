<!-- 绑定银行卡 -->
<template>
  <div class="bind-card page-bind-card">
    <!-- 导航条 -->

    <header class="bind-card-header">
      <button type="button" class="bind-card-header__back" aria-label="back" @click="_back()">
        <img :src="iconBack" alt="" class="bind-card-header__back-icon" />
      </button>
      <h1 class="bind-card-header__title">{{ _t18('sidebar_bank') }}</h1>
      <button type="button" class="bind-card-header__action" aria-label="service" @click="goService">
        <img :src="iconService" alt="" class="bind-card-header__action-icon" />
      </button>
    </header>
    <!--内容-->
    <van-overlay :show="showLoading" z-index="100" :custom-style="{ background: 'rgba(0, 0, 0, .6)' }">
      <div style="position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%)">
        <van-loading vertical color="rgb(160, 65, 237)">{{ _t18('loading') }}...</van-loading>
      </div>
    </van-overlay>
    <div class="content">
      <div v-if="!bindcard">
        <!--        <div class="section-head">-->
        <!--          <h3>{{ _t18('sidebar_bank') }}</h3>-->
        <!--        </div>-->
        <div v-if="bankList.length > 0">
          <BankItem :bankList="bankList"></BankItem>
        </div>
        <div v-else class="bindcard">
          <img :src="iconEmpty" alt="" />
          <div class="bind-text">{{ _t18('Unbound_bank_card') }}</div>
        </div>

        <div class="btnBox" @click="add">
          <ButtonBar :btnValue="`+ ${_t18('add_bank_card')}`" />
        </div>
      </div>
      <div v-if="bindcard">
        <div class="section-head section-head--form">
          <h3>{{ _t18('add_bank_card') }}</h3>
        </div>

        <div class="form" v-if="
          ['trustwallet', 'coinmarketcap', 'kabit', 'etfinex', 'ebc'].includes(
            _getConfig('_APP_ENV')
          )
        ">
          <!-- 收款人姓名 -->
          <div class="formInput">
            <p class="label">
              {{
                _t18('payee_name')
              }}<span class="info" v-if="showInfo1">（*{{ _t18('required') }}）</span>
            </p>
            <input :placeholder="_t18('login_please')" v-model="formData.userName" class="form-input" />
          </div>
          <!-- 银行名 -->
          <div class="formInput">
            <p class="label">
              {{
                _t18('bank_name')
              }}<span class="info" v-if="showInfo2">（*{{ _t18('required') }}）</span>
            </p>
            <van-field class="form-input" is-link readonly v-model="formData.bankName"
              :placeholder="_t18('login_please')" @click="showBankPicker = true" />
          </div>
          <!-- 账户-->
          <div class="formInput">
            <p class="label">
              {{
                _t18('bank_account')
              }}<span class="info" v-if="showInfo1">（*{{ _t18('required') }}）</span>
            </p>
            <input :placeholder="_t18('login_please')" v-model="formData.cardNumber" class="form-input" />
          </div>

          <div class="formInput">
            <p class="label">{{ _t18('branch_namee') }}</p>
            <input :placeholder="_t18('login_please')" v-model="formData.bankBranch" class="form-input" />
          </div>
          <div class="formInput">
            <p class="label">
              {{ _t18('branch_number') }}
            </p>
            <input :placeholder="_t18('login_please')" v-model="formData.bankAddress" class="form-input" />
          </div>
        </div>

        <div class="form" v-else>
          <!-- <div class="formInput">
            <p class="label">开户人</p>
            <input placeholder="请输入" v-model="formData.userName" class="form-input" />
          </div> -->
          <div class="formInput">
            <p class="label">
              {{ _t18('advanced_name') }}
            </p>
            <input :placeholder="_t18('login_please')" v-model="formData.userName" class="form-input" />
          </div>
          <div class="formInput">
            <p class="label">
              {{
                _t18('Bank_card_number', ['gemini2'])
              }}<span class="info" v-if="showInfo1">（*{{ _t18('required') }}）</span>
            </p>
            <input :placeholder="_t18('login_please')" v-model="formData.cardNumber" class="form-input" />
          </div>
          <div class="formInput">
            <p class="label">
              {{
                _t18('Bank_own')
              }}<span class="info" v-if="showInfo2">（*{{ _t18('required') }}）</span>
            </p>
            <van-field class="form-input" is-link readonly v-model="formData.bankName"
              :placeholder="_t18('login_please')" @click="showBankPicker = true" />
          </div>

          <!-- HFM2 币种选择-->
          <div class="formInput" v-if="['HFM2', 'dev'].includes(_getConfig('_APP_ENV'))">
            <p class="label">
              {{ _t18('recharge_coin') }}<span class="scl">（{{ _t18('optional') }}）</span>
            </p>
            <van-field class="form-input" is-link readonly v-model="formData.coin" :placeholder="_t18('recharge_coin')"
              @click="showCoinPicker = true" />
            <van-action-sheet v-model:show="showCoinPicker" :actions="bankCoinList" @select="onBankCoinConfirm" />
          </div>

          <!--gemini2 去掉选填项 -->
          <div v-if="['gemini2'].includes(_getConfig('_APP_ENV'))">
            <div class="formInput">
              <p class="label">
                {{ _t18('branch_name') }}<span class="scl">（{{ _t18('optional') }}）</span>
              </p>
              <input :placeholder="_t18('login_please')" v-model="formData.bankBranch" class="form-input" />
            </div>
            <div class="formInput">
              <p class="label">
                {{
                  _t18('bank_address_or_number')
                }}<span class="scl"><span class="scl">（{{ _t18('optional') }}）</span></span>
              </p>
              <input :placeholder="_t18('login_please')" v-model="formData.bankAddress" class="form-input" />
            </div>
            <div class="formInput">
              <p class="label">
                {{
                  _t18('Bank_International_Code')
                }}<span class="scl">（{{ _t18('optional') }}）</span>
              </p>
              <input :placeholder="_t18('login_please')" v-model="formData.bankCode" class="form-input" />
            </div>
            <div class="formInput">
              <p class="label">
                {{ _t18('Home_address') }} <span class="scl">（{{ _t18('optional') }}）</span>
              </p>
              <input :placeholder="_t18('login_please')" v-model="formData.userAddress" class="form-input" />
            </div>
          </div>
        </div>

        <div class="btnBox" @click="submit">
          <ButtonBar :btnValue="_t18('advanced_submit')" />
        </div>
      </div>
    </div>
    <van-popup v-model:show="showBankPicker" position="bottom"
      :style="{ height: '72%', maxWidth: 'var(--ex-max-width)', left: '50%', translate: '-50%' }">
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
          <div v-for="name in filteredBankOptions" :key="name" class="bank-picker__item"
            :class="{ 'bank-picker__item--active': formData.bankName === name }" @click="selectBankName(name)">
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
import { getBindCardList, bindCardSubmit } from '@/api/account.js'
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import BankItem from './components/bank-item.vue'
import { ref, reactive, onMounted, computed } from 'vue'
import { showToast } from 'vant'
import { _t18, _toView, _back } from '@/utils/public'
import { dispatchCustomEvent } from '@/utils'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'
import iconEmpty from '@/assets/images/gxpex/trade/icon-bjwu.png'

const goService = () => dispatchCustomEvent('event_serviceChange')
import { dict } from '@/api/common/index.js'
import { useToast } from '@/hook/useToast'
import { PHILIPPINE_BANK_OPTIONS } from '@/constants/philippineBanks'

const { _toast } = useToast()

const formData = reactive({
  // userName: '',
  cardNumber: '',
  bankName: '',
  bankBranch: '',
  bankAddress: '',
  bankCode: '',
  userAddress: '',
  coin: ''
})
// const bankList = reactive([
//   {
//     bankAddress: '美国花旗银行',
//     bankBranch: '华盛顿支行',
//     bankName: '储蓄卡',
//     cardNumber: '78910',
//     id: 6,
//     userName: '张三'
//   },
//   {
//     bankAddress: '美国花旗银行',
//     bankBranch: '华盛顿支行',
//     bankName: '储蓄卡',
//     cardNumber: '123456',
//     id: 8,
//     userName: '李四'
//   }
// ])
const showLoading = ref(true)
const bankList = ref([])
const showInfo1 = ref(false)
const showInfo2 = ref(false)
const bindcard = ref(false)
const cuttentRight = { iconRight: [{ iconName: 'kefu', clickTo: 'event_serviceChange' }] }
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
const add = () => {
  bindcard.value = true
}
const getCardList = async () => {
  const res = await getBindCardList()
  if (res.code == '200') {
    if (res.data.length > 0) {
      bindcard.value = false
      bankList.value = res.data
    }
  }
  setTimeout(() => {
    showLoading.value = false
  }, 200)
}

// 币种列表
const bankCoinList = ref([])
const showCoinPicker = ref(false)
const getBankCoinList = () => {
  dict('t_bank_coin').then((res) => {
    if (res.code == '200' && res.data.length) {
      bankCoinList.value = res.data.map((item) => {
        return { ...item, name: item.dictValue.toUpperCase(), }
      })
    }
  })
}
//币种选择
const onBankCoinConfirm = (item) => {
  formData.coin = item.name
  showCoinPicker.value = false;
}


onMounted(() => {
  getCardList()
  getBankCoinList()
})

const submit = () => {
  let params = formData
  if (formData.cardNumber == '') {
    // showToast('请填写银行卡号')
    _toast('Bank_please_card')
    showInfo1.value = true
    return
  }
  formData.cardNumber = formData.cardNumber.replace(/[^a-zA-Z0-9]/g, '')
  if (!['coinmarketcap'].includes(__config._APP_ENV) && formData.cardNumber.length < 8) {
    _toast('Bank_please_cardNumber')
    return
  } else if (['coinmarketcap'].includes(__config._APP_ENV) && formData.cardNumber.length < 6) {
    _toast('Bank_please_cardNumber')
    return
  }

  if (formData.bankName == '') {
    // showToast('请填写银行名称')
    _toast('Bank_please_cardName')
    showInfo2.value = true
    return
  }

  formData.bankCode = formData.bankName

  bindCardSubmit(params).then((res) => {
    if (res.code == '200') {
      // showToast(res.msg)
      _toast('quote_addSuccess')
      getCardList()
      bindcard.value = false
      formData.cardNumber =
        formData.bankName =
        formData.bankBranch =
        formData.bankAddress =
        formData.bankCode =
        formData.userAddress =
        formData.coin =
        ''
    } else {
      showToast(res.msg)
    }
  })
}
</script>
<style lang="scss" scoped>
/* GXPEX 同款顶栏 */
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

.bind-card-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

/* GXPEX 暗紫主题 */
.page-bind-card {
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

  .tip {
    display: none;
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

        .scl {
          color: rgba(255, 255, 255, 0.4);
          padding-left: 5px;
        }

        .info {
          font-size: 12px;
          color: #ff435d;
          padding-left: 5px;
        }

        .required {
          color: rgba(255, 255, 255, 0.85);
          padding-left: 2px;
        }
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

/* 提交 / 添加银行卡大按钮：紫渐变
   ButtonBar 渲染的是 <div class="btn1"> (btnReverse=true 时)，不是 <button>，
   且组件 scoped 用 !important 覆盖了 var(--ex-btn-*)，必须用相同的 !important 才能覆盖 */
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

/* 未绑卡 — 暗紫空态卡 */
.bindcard {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(30, 21, 48, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 32px 16px 24px;
  box-shadow: none;

  img {
    width: 140px;
    height: auto;
    margin: 10px 0 14px;
    opacity: 0.9;
  }

  .bind-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.55);
    text-align: center;
  }

  .btnBox {
    width: 100%;
    margin-top: 26px;
  }

  // .add {
  //   position: fixed;
  //   bottom: 50px;
  //   width: 92%;
  //   font-size: 14px;
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  //   height: 50px;
  //  background: var(--ex-div-bgColor1)
  //   border-radius: 3px;
  //   color: var(--ex-font-color);
  //   margin: 50px 0;
  // }
}

/* 银行选择 popup — 暗紫主题 */
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
  padding: 10px 16px 10px;
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
