<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { _t18 } from '@/utils/public'
import { _div, _mul, priceFormat } from '@/utils/decimal.js'
import { getLoanProductList, getLoan } from '@/api/loan.js'
import { dict } from '@/api/common/index'
import { uploadImg } from '@/api/common/index.js'
import { showToast } from 'vant'
import { useToast } from '@/hook/useToast'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconHistory from '@/assets/images/gxpex/loan/icon-history.svg'
import kycIdFrontPlaceholder from '@/assets/images/gxpex/kyc/id-front.png'
import kycIdBackPlaceholder from '@/assets/images/gxpex/kyc/id-back.png'
import kycCameraIcon from '@/assets/images/gxpex/kyc/icon-camera.svg'
import '@/views/assets/styles/picker-sheet.scss'

const { _toast } = useToast()
const router = useRouter()
const ProductList = ref([])
const amount = ref('')
const currentProduct = ref({})
const productDetail = ref({})
const repaymentCycle = ref([])
const fileList1 = ref([])
const fileList2 = ref([])
const fileList3 = ref([])
const showProductSheet = ref(false)
const dictList = ref()

const afterRead1 = (file) => {
  file.status = 'uploading'
  const formData = new FormData()
  formData.append('file', file.file)
  uploadImg(formData).then((res) => {
    res = res.data
    if (res.code == '200') {
      file.res = res.data.url
      file.status = 'success'
    } else {
      showToast(res.msg)
      fileList1.value = []
    }
  })
}

const afterRead2 = (file) => {
  file.status = 'uploading'
  const formData = new FormData()
  formData.append('file', file.file)
  uploadImg(formData).then((res) => {
    res = res.data
    if (res.code == '200') {
      file.res = res.data.url
      file.status = 'success'
    } else {
      showToast(res.msg)
      fileList2.value = []
    }
  })
}

const afterRead3 = (file) => {
  file.status = 'uploading'
  const formData = new FormData()
  formData.append('file', file.file)
  uploadImg(formData).then((res) => {
    res = res.data
    if (res.code == '200') {
      file.res = res.data.url
      file.status = 'success'
    } else {
      showToast(res.msg)
      fileList3.value = []
    }
  })
}

const interest = computed(() => {
  let tempValue = 0
  if (amount.value && productDetail?.value.odds && productDetail?.value.cycleType) {
    tempValue = priceFormat(
      _div(_mul(_mul(amount.value, productDetail.value.odds), productDetail.value.cycleType), 100),
      2,
      'up'
    )
  }
  return tempValue
})

onMounted(async () => {
  await getDict()
  getProductList()
})

const getDict = async () => {
  const res = await dict('t_repay_type')
  if (res.code == '200') {
    dictList.value = res.data
  }
}

const getProductList = async () => {
  const res = await getLoanProductList()
  if (res.code == '200') {
    ProductList.value = res.rows
    repaymentCycle.value = res.rows.map((elem, index) => {
      return {
        id: index,
        name: elem.cycleType,
        value: elem.id,
        amountMin: elem.amountMin,
        amountMax: elem.amountMax,
        repayTypeLabel: dictList.value?.filter((item) => {
          return parseInt(item.dictValue) == elem.repayType
        })[0]?.dictLabel
      }
    })
    selectorAction(repaymentCycle.value[0])
  }
}

const selectorAction = (item) => {
  currentProduct.value = item
  productDetail.value = ProductList.value.find((elem) => elem.id == item.value)
  showProductSheet.value = false
}

const submit = () => {
  if (
    amount.value == '' ||
    amount.value > productDetail.value.amountMax ||
    amount.value < productDetail.value.amountMin
  ) {
    _toast(`loan_amountErr`)
    return
  }
  if (fileList1.value.length == 0) {
    _toast(`loan_idcardFront`)
    return
  }
  if (fileList2.value.length == 0) {
    _toast(`loan_idcardReverse`)
    return
  }
  if (fileList3.value.length == 0) {
    _toast(`loan_hand`)
    return
  }
  const file1 = fileList1.value[0] || {}
  const filePath1 = file1.res
  const file2 = fileList2.value[0] || {}
  const filePath2 = file2.res
  const file3 = fileList3.value[0] || {}
  const filePath3 = file3.res

  getLoan({
    proId: productDetail.value.id,
    cycleType: productDetail.value.cycleType,
    cardUrl: filePath1,
    cardBackUrl: filePath2,
    capitalUrl: filePath3,
    amount: amount.value
  }).then((res) => {
    if (res.code == '200') {
      _toast(`loan_applySuccess`)
      setTimeout(() => {
        router.push('/loan-record')
      }, 500)
    } else {
      showToast(res.msg)
    }
  })
}

const blur = () => {
  if (
    amount.value > productDetail.value.amountMax ||
    amount.value < productDetail.value.amountMin
  ) {
    _toast(`loan_amountMore`)
    amount.value = ''
  }
}
</script>

<template>
  <div class="page page--loan">
    <header class="loan-header">
      <button type="button" class="loan-header__back" aria-label="back" @click="router.back()">
        <img :src="iconBack" alt="" class="loan-header__back-icon" />
      </button>
      <h1 class="loan-header__title">{{ _t18('asset_loan') }}</h1>
      <button
        type="button"
        class="loan-header__history"
        aria-label="history"
        @click="router.push('/loan-record')"
      >
        <img :src="iconHistory" alt="" class="loan-header__history-icon" />
      </button>
    </header>

    <main class="loan-main">
      <div class="loan-banner">
        <span class="loan-banner__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 24C5.37 24 0 18.63 0 12C0 5.37 5.37 0 12 0C18.63 0 24 5.37 24 12C24 18.63 18.63 24 12 24ZM12 1.33C6.11 1.33 1.33 6.11 1.33 12C1.33 17.89 6.11 22.67 12 22.67C17.89 22.67 22.67 17.89 22.67 12C22.67 6.11 17.89 1.33 12 1.33ZM12 18.67C11.26 18.67 10.67 18.07 10.67 17.33C10.67 16.6 11.26 16 12 16C12.74 16 13.33 16.6 13.33 17.33C13.33 18.07 12.74 18.67 12 18.67ZM11.25 14.67L10.69 5.33L13.32 5.33L12.73 14.67L11.25 14.67Z"
              fill="rgb(160,65,237)"
              transform="translate(6, 6)"
            />
          </svg>
        </span>
        <p class="loan-banner__text">{{ _t18('loan_msg') }}</p>
      </div>

      <section class="loan-card loan-card--form">
        <div class="loan-field">
          <div class="loan-field__label">{{ _t18('loan_product') }}</div>
          <button type="button" class="loan-field__row loan-field__row--select" @click="showProductSheet = true">
            <span class="loan-field__value">
              {{ productDetail.amountMin }}-{{ productDetail.amountMax }}
            </span>
          </button>
        </div>

        <div class="loan-field">
          <div class="loan-field__label">{{ _t18('loan_amount') }} (USDT)</div>
          <div class="loan-field__row">
            <input
              v-model="amount"
              class="loan-field__input"
              type="text"
              inputmode="decimal"
              :placeholder="_t18('loan_pleaseInput')"
              :aria-label="_t18('loan_amount')"
              @blur="blur"
            />
          </div>
        </div>

        <div class="loan-field">
          <div class="loan-field__label">{{ _t18('loan_cycle') }}</div>
          <div class="loan-field__row">
            <span class="loan-field__value">{{ productDetail.cycleType }}</span>
          </div>
        </div>
      </section>

      <section class="loan-card loan-card--info">
        <div class="loan-info__row">
          <span class="loan-info__label">{{ _t18('loan_rateDay') }}</span>
          <span class="loan-info__value">{{ productDetail.odds }}%</span>
        </div>
        <div class="loan-info__row">
          <span class="loan-info__label">{{ _t18('loan_interest') }}</span>
          <span class="loan-info__value">{{ interest }} USDT</span>
        </div>
        <div class="loan-info__row">
          <span class="loan-info__label">{{ _t18('loan_repayType') }}</span>
          <span class="loan-info__value">{{ currentProduct.repayTypeLabel || '' }}</span>
        </div>
        <div class="loan-info__row">
          <span class="loan-info__label">{{ _t18('loan_repayOrg') }}</span>
          <span class="loan-info__value">{{ productDetail.repayOrg }}</span>
        </div>
      </section>

      <section class="loan-upload">
        <div class="loan-upload__head">
          <h2 class="loan-upload__title">{{ _t18('loan_idImg') }}</h2>
          <p class="loan-upload__subtitle">{{ _t18('loan_idMsg') }}</p>
        </div>
        <div class="loan-upload__grid">
          <div
            class="loan-upload__card"
            :class="{ 'loan-upload__card--filled': fileList1.length > 0 }"
          >
            <van-uploader class="loan-uploader" :after-read="afterRead1" v-model="fileList1">
              <div class="loan-upload__card-body">
                <img
                  v-if="!fileList1.length"
                  class="loan-upload__preview"
                  :src="kycIdFrontPlaceholder"
                  alt=""
                />
                <img
                  v-if="!fileList1.length"
                  class="loan-upload__icon"
                  :src="kycCameraIcon"
                  alt=""
                />
              </div>
            </van-uploader>
            <span class="loan-upload__card-label">{{ _t18('loan_front') }}</span>
          </div>

          <div
            class="loan-upload__card"
            :class="{ 'loan-upload__card--filled': fileList2.length > 0 }"
          >
            <van-uploader class="loan-uploader" :after-read="afterRead2" v-model="fileList2">
              <div class="loan-upload__card-body">
                <img
                  v-if="!fileList2.length"
                  class="loan-upload__preview"
                  :src="kycIdBackPlaceholder"
                  alt=""
                />
                <img
                  v-if="!fileList2.length"
                  class="loan-upload__icon"
                  :src="kycCameraIcon"
                  alt=""
                />
              </div>
            </van-uploader>
            <span class="loan-upload__card-label">{{ _t18('loan_reverse') }}</span>
          </div>

          <div
            class="loan-upload__card"
            :class="{ 'loan-upload__card--filled': fileList3.length > 0 }"
          >
            <van-uploader class="loan-uploader" :after-read="afterRead3" v-model="fileList3">
              <div class="loan-upload__card-body">
                <img
                  v-if="!fileList3.length"
                  class="loan-upload__preview"
                  :src="kycIdBackPlaceholder"
                  alt=""
                />
                <img
                  v-if="!fileList3.length"
                  class="loan-upload__icon"
                  :src="kycCameraIcon"
                  alt=""
                />
              </div>
            </van-uploader>
            <span class="loan-upload__card-label">{{ _t18('loan_hand') }}</span>
          </div>
        </div>
      </section>

      <button type="button" class="loan-confirm" @click="submit">
        {{ _t18('loan_require') }}
      </button>
    </main>

    <van-action-sheet
      v-model:show="showProductSheet"
      title=""
      class="assets-picker-sheet"
      style="max-width: var(--ex-max-width); left: 50%; translate: -50%"
    >
      <div class="picker-list">
        <button
          v-for="item in repaymentCycle"
          :key="item.id"
          type="button"
          class="picker-item"
          @click="selectorAction(item)"
        >
          <span class="picker-item__label">{{ item.amountMin }}-{{ item.amountMax }} USDT</span>
        </button>
      </div>
    </van-action-sheet>
  </div>
</template>

<style lang="scss" scoped>
.page--loan {
  min-height: 100vh;
  background: #111111;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.loan-header {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  min-height: 26px;
  padding: 0 12px;
}

.loan-header__back {
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

.loan-header__back-icon {
  display: block;
  width: 12px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.loan-header__title {
  grid-column: 2;
  margin: 0;
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
}

.loan-header__history {
  grid-column: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: rgb(34, 28, 49);
  cursor: pointer;
}

.loan-header__history-icon {
  display: block;
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.loan-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 12px 0;
}

.loan-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 36px;
  padding: 9px 12px;
  border-radius: 8px;
  background: rgb(34, 28, 49);
}

.loan-banner__icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    display: block;
    width: 18px;
    height: 18px;
  }
}

.loan-banner__text {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.4;
  color: rgb(160, 65, 237);
}

.loan-card {
  padding: 20px 12px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.loan-card--form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.loan-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loan-field__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.85);
}

.loan-field__row {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 40px;
  padding: 9px 12px;
  border: none;
  border-radius: 25px;
  background: rgb(34, 34, 34);
  text-align: left;
  cursor: default;
}

.loan-field__row--select {
  cursor: pointer;
}

.loan-field__value {
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  line-height: 1.2;
  color: #fff;
  text-align: left;
}

.loan-field__input {
  width: 100%;
  border: none;
  background: transparent;
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  line-height: 1.2;
  color: #fff;
  text-align: left;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
}

.loan-card--info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loan-info__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 20px;
}

.loan-info__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.65);
}

.loan-info__value {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 1.2;
  color: #fff;
  text-align: right;
}

.loan-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loan-upload__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.loan-upload__title {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
}

.loan-upload__subtitle {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.65);
}

.loan-upload__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.loan-upload__card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  min-height: 131px;
  padding: 12px 7px 10px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.loan-upload__card-label {
  flex-shrink: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
}

.loan-upload__card-body {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 100%;
  height: 85px;
  border-radius: 8px;
  overflow: hidden;
  background: transparent;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    background: rgba(0, 28, 58, 0.3);
    pointer-events: none;
    z-index: 1;
  }
}

.loan-upload__card--filled .loan-upload__card-body::after {
  display: none;
}

.loan-upload__preview {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
}

.loan-upload__icon {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  display: block;
  object-fit: contain;
}

.loan-uploader {
  width: 100%;

  :deep(.van-uploader__wrapper) {
    width: 100%;
    display: block;
  }

  :deep(.van-uploader__input-wrapper) {
    display: block;
    width: 100%;
  }

  :deep(.van-uploader__preview) {
    position: absolute;
    inset: 0;
    z-index: 3;
    width: 100%;
    height: 100%;
    margin: 0;
  }

  :deep(.van-uploader__preview-image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  :deep(.van-uploader__preview-delete) {
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    background: rgba(0, 0, 0, 0.55);
    border-radius: 50%;
    z-index: 4;

    .van-uploader__preview-delete-icon {
      font-size: 14px;
      top: 1px;
      right: 1px;
    }
  }
}

.loan-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 40px;
  margin-top: 8px;
  margin-bottom: 16px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(-43deg, rgb(127, 43, 218) 0%, rgb(163, 67, 238) 100%);
  box-shadow: 0 4px 12px rgba(127, 43, 218, 0.35);
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
  cursor: pointer;
}
</style>
