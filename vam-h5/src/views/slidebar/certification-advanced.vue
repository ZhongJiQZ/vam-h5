<!-- 高级认证 -->
<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { REALNAME } from '@/config'
import { nation } from './components/nation.js'
import { useRouter } from 'vue-router'
import { uploadKYC } from '@/api/user'
import Success from './components/success.vue'
import { uploadImg } from '@/api/common/index.js'
import { useUserStore } from '@/store/user/index'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'
import { _t18 } from '@/utils/public'
import { useToast } from '@/hook/useToast'
import { useMainStore } from '@/store/index.js'
import { getCurrentLanguageCountryKey } from '@/utils/languageCountry'
import { dispatchCustomEvent } from '@/utils'
import iconBack from '@/assets/images/gxpex/trade/icon-back.svg'
import iconService from '@/assets/images/gxpex/home/icon-service.svg'
import kycIdFrontPlaceholder from '@/assets/images/gxpex/kyc/id-front.png'
import kycIdBackPlaceholder from '@/assets/images/gxpex/kyc/id-back.png'
import kycCameraIcon from '@/assets/images/gxpex/kyc/icon-camera.svg'
import '@/views/assets/styles/picker-sheet.scss'

const router = useRouter()
const goService = () => dispatchCustomEvent('event_serviceChange')
const { _toast } = useToast()
const userStore = useUserStore()
const mainStore = useMainStore()
userStore.getUserInfo()

// 用户信息
const { userInfo } = storeToRefs(userStore)

const formData = reactive({
  userName: '',
  number: ''
})

// 是否高级认证
const advancedAuth = ref(userInfo.value.detail?.auditStatusAdvanced)

const title = ref(_t18('advanced_IdCard'))
const type = ref('1')
const show = ref(false)
const actions = [
  { name: _t18('advanced_IdCard'), type: 1 }, //身份证
  { name: _t18('advanced_paper'), type: 2 }, //护照
  { name: _t18('advanced_driver_license'), type: 3 } //驾驶证
]
const onSelect = (item) => {
  show.value = false
  title.value = item.name
  type.value = item.type
}

/**
 * 当前选中
 */
const nationName = ref('')
const isNationTouched = ref(false)
/**
 * 显示国家弹窗
 */
const showNation = ref(false)

/**
 * ✅ 国家搜索关键字
 */
const nationKeyword = ref('')

/**
 * ✅ 多语言国家列表（不要修改原 nation 元素，避免副作用）
 */
const nationList = computed(() => {
  return nation.map((elem) => ({
    ...elem,
    title: `nation_${elem.name}`
  }))
})

/**
 * ✅ 过滤后的国家列表
 */
const filteredNationList = computed(() => {
  const kw = nationKeyword.value.trim().toLowerCase()
  if (!kw) return nationList.value

  return nationList.value.filter((item) => {
    const translated = (_t18(item.title) || '').toLowerCase() // 当前语言显示文本
    const english = (item.name || '').toLowerCase() // 英文名
    const code = (item.code || '').toLowerCase() // 国家码
    return translated.includes(kw) || english.includes(kw) || code.includes(kw)
  })
})

/**
 * ✅ 打开国家弹窗时清空搜索
 */
watch(showNation, (v) => {
  if (v) nationKeyword.value = ''
})

/**
 * 选择国家
 */
const onSelectNation = (item) => {
  showNation.value = false
  isNationTouched.value = true
  nationName.value = item.title
}

const fileList1 = ref([])
const fileList2 = ref([])
const fileList3 = ref([])

const afterRead1 = (file) => {
  file.status = 'uploading'
  let formData = new FormData()
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
  let formData = new FormData()
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
  let formData = new FormData()
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

/**
 * 提交认证信息
 * 审核状态 0未申请 1通过 3审核中 2拒绝
 */
const submit = () => {
  if (formData.userName == '') {
    _toast('advanced_please_name')
    return
  }
  if (!REALNAME.includes(__config._APP_ENV) && formData.number == '') {
    _toast('advanced_please_number')
    return
  }
  if (fileList1.value.length == 0) {
    _toast('loan_idcardFront')
    return
  }
  if (fileList2.value.length == 0) {
    _toast('loan_idcardReverse')
    return
  }

  const file1 = fileList1.value[0] || {}
  let filePath1 = file1.res
  const file2 = fileList2.value[0] || {}
  let filePath2 = file2.res

  if (file1.status != 'success' || file2.status != 'success') {
    _toast('recharge_img_load')
    return
  }

  // ⚠️ 你原来这里用了 filePath3 但被注释掉了，会导致报错
  // 这里按你原来逻辑先给空字符串，避免 undefined
  const filePath3 = ''

  // realName 姓名 ,idCard 证件号码 ,flag 1 初级 2高级 ,frontUrl 正面照片 ,backUrl 反面照片 ,country 国家 ,handelUrl 手持照片 ,cardType 类型
  let params = `realName=${formData.userName}&idCard=${formData.number}&flag=2&frontUrl=${filePath1}&backUrl=${filePath2}&country=${nationName.value}&handelUrl=${filePath3}&cardType=${type.value}`
  uploadKYC(params).then((res) => {
    if (res.code == '200') {
      _toast('please_wait')
      advancedAuth.value = 3
    } else {
      showToast(res.msg)
      advancedAuth.value = 2
    }
  })
}

/**
 * 认证失败 重新认证
 */
const reSubmit = () => {
  advancedAuth.value = '0'
}

/**
 * 初始化
 */
const init = () => {
  if (isNationTouched.value) return

  if (['aams'].includes(__config._APP_ENV)) {
    nationName.value = 'nation_United States of America'
  } else if (['das'].includes(__config._APP_ENV)) {
    nationName.value = 'nation_Singapore'
  } else {
    nationName.value = getCurrentLanguageCountryKey()
  }
}

watch(
  () => mainStore.language,
  () => {
    init()
  }
)

onMounted(() => {
  init()
  if (REALNAME.includes(__config._APP_ENV)) {
    formData.userName = userInfo.value.user?.loginName
  }
})
</script>

<template>
  <div class="page page--kyc">
    <header class="kyc-header">
      <button type="button" class="kyc-header__back" aria-label="back" @click="router.back()">
        <img :src="iconBack" alt="" class="kyc-header__back-icon" />
      </button>
      <h1 class="kyc-header__title">{{ _t18('sidebar_advanced', ['aams']) }}</h1>
      <button type="button" class="kyc-header__action" aria-label="service" @click="goService">
        <img :src="iconService" alt="" class="kyc-header__action-icon" />
      </button>
    </header>

    <main v-if="advancedAuth == '0' || advancedAuth == null" class="kyc-main">
      <div class="kyc-banner">
        <span class="kyc-banner__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 24C5.37 24 0 18.63 0 12C0 5.37 5.37 0 12 0C18.63 0 24 5.37 24 12C24 18.63 18.63 24 12 24ZM12 1.33C6.11 1.33 1.33 6.11 1.33 12C1.33 17.89 6.11 22.67 12 22.67C17.89 22.67 22.67 17.89 22.67 12C22.67 6.11 17.89 1.33 12 1.33ZM12 18.67C11.26 18.67 10.67 18.07 10.67 17.33C10.67 16.6 11.26 16 12 16C12.74 16 13.33 16.6 13.33 17.33C13.33 18.07 12.74 18.67 12 18.67ZM11.25 14.67L10.69 5.33L13.32 5.33L12.73 14.67L11.25 14.67Z"
              fill="rgb(160,65,237)"
              transform="translate(6, 6)"
            />
          </svg>
        </span>
        <p class="kyc-banner__text">{{ _t18('advanced_txt', ['aams']) }}</p>
      </div>

      <p v-if="['coinsexpto'].includes(_getConfig('_APP_ENV'))" class="kyc-tip-info">
        {{
          `${_t18('advanced_certification_info_left')}${_getConfig('_APP_META_TITLE')}${_t18(
            'advanced_certification_info_right'
          )}`
        }}
      </p>

      <section class="kyc-card kyc-card--form">
        <div v-if="!REALNAME.includes(_getConfig('_APP_ENV'))" class="kyc-field">
          <div class="kyc-field__label">{{ _t18('advanced_name') }}</div>
          <div class="kyc-field__row">
            <input
              v-model="formData.userName"
              class="kyc-field__input"
              type="text"
              :placeholder="_t18('login_please')"
              :aria-label="_t18('advanced_name')"
            />
          </div>
        </div>

        <div class="kyc-field">
          <div class="kyc-field__label">{{ _t18('advanced_IdCard') }}</div>
          <div class="kyc-field__row kyc-field__row--select">
            <button type="button" class="kyc-field__select" @click="show = true">
              <span class="kyc-field__value">{{ title }}</span>
              <span class="kyc-field__chevron" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14.31 0.96L8.17 9.09C8.06 9.23 7.91 9.35 7.75 9.44C7.58 9.52 7.4 9.56 7.21 9.56C7.03 9.56 6.85 9.52 6.68 9.44C6.51 9.35 6.37 9.23 6.26 9.09L0.12 0.96C0.05 0.87 0.01 0.77 0 0.66C-0.01 0.54 0.01 0.43 0.06 0.33C0.11 0.23 0.19 0.15 0.28 0.09C0.38 0.03 0.49 0 0.6 0L13.83 0C13.94 0 14.05 0.03 14.14 0.09C14.24 0.15 14.31 0.23 14.36 0.33C14.41 0.43 14.43 0.54 14.42 0.65C14.41 0.77 14.37 0.87 14.31 0.96Z"
                    fill="rgba(255,255,255,0.650)"
                    transform="translate(4.79, 7.2)"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div v-if="!REALNAME.includes(_getConfig('_APP_ENV'))" class="kyc-field">
          <div class="kyc-field__label">{{ _t18('advanced_license_number') }}</div>
          <div class="kyc-field__row">
            <input
              v-model="formData.number"
              class="kyc-field__input"
              type="text"
              :placeholder="_t18('advanced_please_cardName')"
              :aria-label="_t18('advanced_license_number')"
            />
          </div>
        </div>

        <div class="kyc-field">
          <div class="kyc-field__label">{{ _t18('nation_search_country') }}</div>
          <div class="kyc-field__row kyc-field__row--select">
            <button type="button" class="kyc-field__select" @click="showNation = true">
              <span class="kyc-field__value">{{ _t18(nationName) }}</span>
              <span class="kyc-field__chevron" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14.31 0.96L8.17 9.09C8.06 9.23 7.91 9.35 7.75 9.44C7.58 9.52 7.4 9.56 7.21 9.56C7.03 9.56 6.85 9.52 6.68 9.44C6.51 9.35 6.37 9.23 6.26 9.09L0.12 0.96C0.05 0.87 0.01 0.77 0 0.66C-0.01 0.54 0.01 0.43 0.06 0.33C0.11 0.23 0.19 0.15 0.28 0.09C0.38 0.03 0.49 0 0.6 0L13.83 0C13.94 0 14.05 0.03 14.14 0.09C14.24 0.15 14.31 0.23 14.36 0.33C14.41 0.43 14.43 0.54 14.42 0.65C14.41 0.77 14.37 0.87 14.31 0.96Z"
                    fill="rgba(255,255,255,0.650)"
                    transform="translate(4.79, 7.2)"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      <section class="kyc-upload">
        <div class="kyc-upload__head">
          <h2 class="kyc-upload__title">{{ _t18('advanced_id_photo') }}</h2>
          <p class="kyc-upload__subtitle">{{ _t18('advanced_make_sure') }}</p>
        </div>
        <div class="kyc-upload__grid">
          <div
            class="kyc-upload__card"
            :class="{ 'kyc-upload__card--filled': fileList1.length > 0 }"
          >
            <van-uploader class="kyc-uploader" :after-read="afterRead1" v-model="fileList1">
              <div class="kyc-upload__card-body">
                <img
                  v-if="!fileList1.length"
                  class="kyc-upload__preview"
                  :src="kycIdFrontPlaceholder"
                  alt=""
                />
                <img
                  v-if="!fileList1.length"
                  class="kyc-upload__icon"
                  :src="kycCameraIcon"
                  alt=""
                />
              </div>
            </van-uploader>
            <span class="kyc-upload__card-label">{{ _t18('upload_positive') }}</span>
          </div>

          <div
            class="kyc-upload__card"
            :class="{ 'kyc-upload__card--filled': fileList2.length > 0 }"
          >
            <van-uploader class="kyc-uploader" :after-read="afterRead2" v-model="fileList2">
              <div class="kyc-upload__card-body">
                <img
                  v-if="!fileList2.length"
                  class="kyc-upload__preview"
                  :src="kycIdBackPlaceholder"
                  alt=""
                />
                <img
                  v-if="!fileList2.length"
                  class="kyc-upload__icon"
                  :src="kycCameraIcon"
                  alt=""
                />
              </div>
            </van-uploader>
            <span class="kyc-upload__card-label">{{ _t18('upload_reverse side') }}</span>
          </div>
        </div>
      </section>

      <button type="button" class="kyc-confirm" @click="submit">
        {{ _t18('advanced_submit') }}
      </button>
    </main>

    <main v-else-if="advancedAuth == '3'" class="kyc-main kyc-main--result">
      <Success :text="_t18('under_review')" :imgUrl="'defi/zhong.png'" />
    </main>

    <main v-else-if="advancedAuth == '2'" class="kyc-main kyc-main--result">
      <Success :text="_t18('Audit_failure')" :imgUrl="'defi/failed.png'">
        <template #btn>
          <button type="button" class="kyc-confirm kyc-confirm--inline" @click="reSubmit">
            {{ _t18('Resubmit') }}
          </button>
        </template>
      </Success>
    </main>

    <main v-else-if="advancedAuth == '1'" class="kyc-main kyc-main--result">
      <Success :text="_t18('advanced_success')" :imgUrl="'defi/success.png'" />
    </main>

    <van-action-sheet
      v-model:show="show"
      title=""
      class="assets-picker-sheet"
      style="max-width: var(--ex-max-width); left: 50%; translate: -50%"
    >
      <div class="picker-list">
        <button
          v-for="item in actions"
          :key="item.type"
          type="button"
          class="picker-item"
          @click="onSelect(item)"
        >
          <span class="picker-item__label">{{ item.name }}</span>
        </button>
      </div>
    </van-action-sheet>

    <van-action-sheet
      v-model:show="showNation"
      title=""
      class="assets-picker-sheet kyc-nation-sheet"
      style="max-width: var(--ex-max-width); left: 50%; translate: -50%"
    >
      <div class="kyc-nation-sheet__search">
        <input
          v-model="nationKeyword"
          class="kyc-nation-sheet__input"
          type="search"
          :placeholder="_t18('nation_search_country') || '搜索国家/代码'"
          autocomplete="off"
        />
      </div>
      <div class="picker-list">
        <button
          v-for="item in filteredNationList"
          :key="item.code"
          type="button"
          class="picker-item"
          @click="onSelectNation(item)"
        >
          <span class="picker-item__label">{{ _t18(item.title) }}</span>
        </button>
      </div>
    </van-action-sheet>
  </div>
</template>

<style lang="scss" scoped>
.page--kyc {
  min-height: 100vh;
  background: #111111;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.kyc-header {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  min-height: 26px;
  padding: 0 12px;
}

.kyc-header__back {
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

.kyc-header__back-icon {
  display: block;
  width: 12px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.kyc-header__title {
  grid-column: 2;
  margin: 0;
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  color: #fff;
}

.kyc-header__action {
  grid-column: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: -9px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.kyc-header__action-icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
  opacity: 0.9;
}

.kyc-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 12px 0;
}

.kyc-main--result {
  min-height: calc(100vh - 52px);
  align-items: center;
  justify-content: center;
  padding-top: 40px;

  :deep(.content) {
    .text {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

.kyc-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 36px;
  padding: 9px 12px;
  border-radius: 8px;
  background: rgb(34, 28, 49);
}

.kyc-banner__icon {
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

.kyc-banner__text {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.4;
  color: rgb(160, 65, 237);
}

.kyc-tip-info {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.55);
}

.kyc-card {
  padding: 20px 12px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.kyc-card--form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.kyc-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kyc-field__label {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.85);
}

.kyc-field__row {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 9px 12px;
  border-radius: 25px;
  background: rgb(34, 34, 34);
}

.kyc-field__row--select {
  padding: 5px 12px;
}

.kyc-field__select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.kyc-field__value {
  flex: 1;
  min-width: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  line-height: 1.2;
  color: #fff;
  text-align: left;
}

.kyc-field__chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 12px;
  height: 12px;

  svg {
    display: block;
    width: 12px;
    height: 12px;
  }
}

.kyc-field__input {
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

.kyc-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kyc-upload__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kyc-upload__title {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  color: #fff;
}

.kyc-upload__subtitle {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.65);
}

.kyc-upload__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.kyc-upload__card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  min-height: 131px;
  padding: 12px 7px 10px;
  border-radius: 12px;
  background: rgb(34, 28, 49);
}

.kyc-upload__card-label {
  flex-shrink: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
}

.kyc-upload__card-body {
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

.kyc-upload__card--filled .kyc-upload__card-body::after {
  display: none;
}

.kyc-upload__preview {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
}

.kyc-upload__icon {
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

.kyc-uploader {
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

.kyc-confirm {
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

  &--inline {
    margin-top: 24px;
    max-width: 280px;
  }
}
</style>

<style lang="scss">
.kyc-nation-sheet .kyc-nation-sheet__search {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 12px;
  background: rgb(34, 28, 49);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.kyc-nation-sheet .kyc-nation-sheet__input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgb(34, 34, 34);
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #fff;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
}
</style>
