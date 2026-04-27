<!-- 编辑银行卡 -->
<template>
  <div class="bind-card">
    <!-- 导航条 -->
    <HeaderBar
        :currentName="_t18('Bank_edit')"
        :cuttentRight="cuttentRight"
        :border_bottom="true"
        @icon-delete="onDeleteBank"
    ></HeaderBar>
    <!--内容-->
    <div class="content">
      <div class="section-head section-head--form">
        <h3>{{ _t18('Bank_edit') }}</h3>
      </div>
      <div class="form">
        <div class="formInput">
          <p class="label">{{ _t18('advanced_name') }}</p>
          <!-- <input
            :placeholder="_t18('login_please')"
            v-model="formData.userName"
            class="form-input"
          /> -->
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
        <!-- HFM2 币种选择-->
        <div class="formInput" v-if="['HFM2','dev'].includes(_getConfig('_APP_ENV'))">
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
          <van-action-sheet v-model:show="showCoinPicker" :actions="bankCoinList" @select="onBankCoinConfirm"/>
        </div>

      </div>
      <div class="btnBox" @click="submit">
        <ButtonBar :btnValue="_t18('Bank_save')"/>
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
import HeaderBar from '@/components/HeaderBar/index.vue'
import ButtonBar from '@/components/common/ButtonBar/index.vue'
import {showConfirmDialog, showToast} from 'vant'
import {reactive, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {delBindCard, updateBindCard} from '@/api/account'
import {_toView, _t18} from '@/utils/public'
import {useToast} from '@/hook/useToast'
import {useUserStore} from '@/store/user/index'
import {dict} from '@/api/common/index.js'
import {storeToRefs} from 'pinia'
import { INDONESIA_BANK_OPTIONS } from '@/constants/indonesiaBanks'

const userStore = useUserStore()
// userStore.getUserInfo()
// 用户信息
const {userInfo} = storeToRefs(userStore)
const {_toast, _showName} = useToast()
const Route = useRoute()
const Router = useRouter()
// const formData = reactive({
//   bankAddress: '美国花旗银行',
//   bankBranch: '华盛顿支行',
//   bankName: '储蓄卡',
//   cardNumber: '78910',
//   id: 6,
//   userName: '张三'
// })
const formData = reactive(JSON.parse(decodeURI(Route.query.data)))
const bindUserName = ref(formData.userName || userInfo.value.user?.loginName)
const cuttentRight = {iconRight: [{iconName: 'sanchu24x24', clickTo: 'del'}]}
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
const onDeleteBank = async () => {
  if (formData.id == null || formData.id === '') {
    return
  }
  try {
    await showConfirmDialog({
      message: _showName('Bank_delete'),
      confirmButtonText: _showName('btnConfirm'),
      cancelButtonText: _showName('cancel')
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
    console.log(e)
    // 用户取消确认框，或请求被拦截器处理
  }
}


// 币种列表
const bankCoinList = ref([])
const showCoinPicker = ref(false)
const getBankCoinList = () => {
  dict('t_bank_coin').then((res) => {
    if (res.code == '200' && res.data.length) {
      bankCoinList.value = res.data.map((item) => {
        return {...item, name: item.dictValue.toUpperCase(),}
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
  getBankCoinList()
})
const submit = () => {
  console.log(formData)
  updateBindCard(formData).then((res) => {
    if (res.code == '200') {
      // showToast('修改成功！')
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
* {
  font-size: 16px;
  color: var(--ex-default-font-color);
}

.header {
  display: flex;

  .title {
    margin-left: 10px;
  }
}

.content {
  padding: 12px 15px 24px;
  min-height: calc(100vh - 60px - env(safe-area-inset-top, 0px));
  background: linear-gradient(180deg, #f3f5fa 0%, #eef2f8 100%);
  box-sizing: border-box;

  .section-head {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 14px 14px 0 0;
    padding: 14px;
    border: 1px solid #edf0f5;
    border-bottom: 0;
    box-shadow: 0 6px 18px rgba(36, 58, 88, 0.06);

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }
  }

  .tip {
    font-size: 12px;
    color: var(--ex-font-color3);
    margin-bottom: 30px;
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
      margin-top: 20px;

      .label {
        color: var(--ex-default-font-color);
        font-size: 14px;
        margin: 0 0 10px;

        .scl {
          color: var(--ex-font-color11);
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
          color: var(--ex-font-color5);
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
