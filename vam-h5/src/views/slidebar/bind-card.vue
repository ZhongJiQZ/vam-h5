<!-- 绑定银行卡 -->
<template>
  <div class="bind-card">
    <!-- 导航条 -->

    <HeaderBar :currentName="_t18('sidebar_bank')" :cuttentRight="cuttentRight" :border_bottom="true" :backTo="'/'">
    </HeaderBar>
    <!--内容-->
    <van-overlay :show="showLoading" z-index="100" :custom-style="{ background: 'rgba(0, 0, 0, .6)' }">
      <div style="position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%)">
        <van-loading vertical color="#17AC74">{{ _t18('loading') }}...</van-loading>
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
          <img src="@/assets/defi/notbind.png" alt="" />
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
import HeaderBar from '@/components/HeaderBar/index.vue'
import { showToast } from 'vant'
import { _t18, _toView } from '@/utils/public'
import { dict } from '@/api/common/index.js'
import { useToast } from '@/hook/useToast'
import { INDONESIA_BANK_OPTIONS } from '@/constants/indonesiaBanks'

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
  if (!kw) return INDONESIA_BANK_OPTIONS
  return INDONESIA_BANK_OPTIONS.filter((n) => n.includes(kw))
})
const selectBankName = (name) => {
  formData.bankName = name
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
  formData.cardNumber = formData.cardNumber.replace(/\s+/g, '')
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

  if (formData.bankName == 'BANK BCA' && formData.cardNumber.length !== 10) {
    _toast('Bank_please_cardNumber')
    return
  }

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
.content {
  padding: 12px 15px 24px;
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: linear-gradient(180deg, #f3f5fa 0%, #eef2f8 100%);
  box-sizing: border-box;

  .section-head {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 12px;
    border: 1px solid #edf0f5;
    box-shadow: 0 6px 18px rgba(36, 58, 88, 0.06);

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }
  }

  .section-head--form {
    margin-bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: none;
  }

  .tip {
    display: none;
  }

  .form {
    padding: 6px 14px 16px;
    background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
    border-bottom-left-radius: 14px;
    border-bottom-right-radius: 14px;
    border: 1px solid #edf0f5;
    border-top: 0;
    box-shadow: 0 6px 18px rgba(36, 58, 88, 0.06);

    .formInput {
      margin-top: 16px;

      .label {
        color: var(--ex-default-font-color);
        font-size: 14px;
        margin: 0 0 10px;

        .scl {
          color: var(--ex-font-color19);
          padding-left: 5px;
        }

        .info {
          font-size: 12px;
          color: var(--ex-tip-font-color);
          padding-left: 5px;
        }

        .required {
          color: var(--ex-default-font-color);
          padding-left: 2px;
        }
      }

      input {
        width: 100%;
        height: 46px;
        background: #fff;
        border-radius: 10px;
        border: 1px solid #ebedf0;
        padding: 0 15px;
        font-size: 14px;
        box-sizing: border-box;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &::placeholder {
          color: var(--ex-bindcard-input-font-color);
          font-size: 14px;
        }

        &:focus {
          border-color: rgba(23, 172, 116, 0.45);
          box-shadow: 0 0 0 3px rgba(23, 172, 116, 0.08);
        }
      }

      :deep(.van-cell) {
        border: 1px solid #ebedf0;
        border-radius: 10px;
        background: #fff;
        min-height: 46px;
        padding: 11px 12px !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:active {
          border-color: rgba(23, 172, 116, 0.45);
          box-shadow: 0 0 0 3px rgba(23, 172, 116, 0.08);
        }

        &::placeholder {
          color: var(--ex-bindcard-input-font-color);
          font-size: 14px;
        }
      }
    }
  }

  // .btn {
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
  .btnBox {
    margin-top: 18px;
  }
}

.bindcard {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  border-radius: 14px;
  padding: 28px 16px 22px;
  border: 1px solid #edf0f5;
  box-shadow: 0 6px 18px rgba(36, 58, 88, 0.06);

  img {
    width: 120px;
    height: 110px;
    margin: 22px 0 18px;
  }

  .bind-text {
    font-size: 14px;
    color: var(--ex-passive-font-color);
    text-align: center;
  }

  .btnBox {
    width: 100%;
    margin-top: 30px;
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

.bank-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.bank-picker__header {
  padding: 14px 16px 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--ex-default-font-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--ex-border-color1);
}

.bank-picker__close {
  font-size: 22px;
  line-height: 1;
  color: var(--ex-passive-font-color);
  padding: 0 2px;
}

.bank-picker__search {
  padding: 0 16px 10px;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
}

.bank-picker__search-inner {
  border: 1px solid var(--ex-bindcard-input-border-color);
  background: var(--ex-bindcard-input-background-color);
  border-radius: 8px;
  padding: 0 10px;
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
  }
}

.bank-picker__search-icon {
  font-size: 14px;
  opacity: 0.7;
  flex-shrink: 0;
}

.bank-picker__selected {
  margin: 8px 2px 0;
  font-size: 12px;
  color: var(--ex-passive-font-color);

  .val {
    color: var(--ex-default-font-color);
    font-weight: 500;
  }
}

.bank-picker__list {
  flex: 1;
  overflow: auto;
  padding: 0 16px 12px;
}

.bank-picker__item {
  padding: 12px 2px;
  border-bottom: 1px solid var(--ex-border-color1);
  font-size: 14px;
  color: var(--ex-default-font-color);
  line-height: 1.4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.bank-picker__item .txt {
  min-width: 0;
}

.bank-picker__item .ok {
  color: #17ac74;
  font-weight: 700;
}

.bank-picker__item--active {
  background: rgba(23, 172, 116, 0.06);
}

.bank-picker__empty {
  color: var(--ex-passive-font-color);
  text-align: center;
  padding: 30px 0;
  font-size: 13px;
}
</style>
