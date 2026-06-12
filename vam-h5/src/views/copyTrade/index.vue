<!-- 机构信息 / 跟单首页 -->
<template>
  <div class="inst-page">
    <DarkHeaderBar :title="_t18('copy_trade_inst_title')" :border_bottom="true">
      <template #right>
        <button type="button" class="header-info-btn" aria-label="info" @click="showInfo = true">
          <span class="header-info-icon">i</span>
        </button>
      </template>
    </DarkHeaderBar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="inst-body">
        <div v-if="bannerUrl" class="inst-banner">
          <image-load :filePath="bannerUrl" class="inst-banner__img" loading="eager" fetchpriority="high" />
        </div>
        <!-- <div v-else class="inst-banner inst-banner--placeholder" aria-hidden="true" /> -->

        <div class="inst-list">
          <div
            v-for="item in institutionList"
            :key="institutionRowId(item)"
            class="inst-card"
            @click="goInstitution(item)"
          >
            <div class="inst-card__head">
              <div class="inst-card__avatar-wrap">
                <img
                  v-if="item.logo"
                  :src="item.logo"
                  class="inst-card__avatar"
                  alt=""
                  @error="onLogoError($event)"
                />
                <div v-else class="inst-card__avatar inst-card__avatar--ph" />
              </div>
              <div class="inst-card__meta">
                <p class="inst-card__name">{{ item.institutionName || item.title || '--' }}</p>
                <p class="inst-card__subs ff-num">
                  {{ subscriberText(item) }}
                  <span v-if="item.totalProfitRate != null" class="inst-card__rate">
                    · {{ formatProfitRate(item.totalProfitRate) }}%
                  </span>
                </p>
              </div>
              <button
                type="button"
                class="inst-card__btn"
                :class="isInstitutionSubscribed(item) ? 'inst-card__btn--on' : 'inst-card__btn--off'"
                @click.stop.prevent="onSubscribeClick(item)"
              >
                {{ subscribeBtnText(item) }}
              </button>
            </div>
            <p v-if="item.description" class="inst-card__desc">
              <span class="inst-card__desc-label">{{ _t18('copy_trade_inst_intro') }}</span>
              {{ item.description }}
            </p>
          </div>
          <Nodata v-if="!loading && institutionList.length === 0" />
        </div>

      </div>
    </van-pull-refresh>

    <InstitutionSubscribeDialog
      v-model:show="showSubscribe"
      :item="subscribeTarget"
      :loading="subscribeLoading"
      @confirm="onSubscribeConfirm"
    />

    <CopyTradeDocumentDrawer v-model:show="showInfo" :doc="introDoc" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DarkHeaderBar from '@/components/DarkHeaderBar/index.vue'
import InstitutionSubscribeDialog from './components/InstitutionSubscribeDialog.vue'
import CopyTradeDocumentDrawer from './components/CopyTradeDocumentDrawer.vue'
import { getCopyTradeIntroDoc } from './documents'
import { _t18, _numberWithCommas } from '@/utils/public'
import {
  getCopyTradeConfig,
  getCopyTradeInstitutionList,
  subscribeCopyTradeInstitution
} from '@/api/copyTrade'
import {
  normalizeInstitutionListResponse,
  institutionRowId,
  isInstitutionSubscribed,
  institutionSubscriberCount,
  isInstitutionSecretLocked,
  isSecretKeyLockMessage,
  setInstitutionSecretLock,
  patchInstitutionSubscribed,
  formatSignedRate
} from './utils'
import { showToast } from 'vant'
import { getResponseErrorMsg } from '@/utils/request'
import { priceFormat } from '@/utils/decimal'

const router = useRouter()
const i18n = useI18n()
const { t } = i18n
const t18 = (key, platform = []) => _t18(key, platform, i18n)

const institutionList = ref([])
const bannerUrl = ref('')
const loading = ref(true)
const refreshing = ref(false)
const showInfo = ref(false)
const showSubscribe = ref(false)
const subscribeTarget = ref({})
const subscribeLoading = ref(false)

const introDoc = computed(() => getCopyTradeIntroDoc(t18))

function formatProfitRate(val) {
  return formatSignedRate(val, 2)
}

function subscriberText(item) {
  const count = _numberWithCommas(institutionSubscriberCount(item))
  return t('copy_trade_inst_subscribers', { n: count })
}

function subscribeBtnText(item) {
  const fromApi = String(item?.subscribeText || '').trim()
  if (fromApi) return fromApi
  return isInstitutionSubscribed(item)
    ? t18('copy_trade_inst_subscribed')
    : t18('copy_trade_inst_subscribe')
}

function onLogoError(e) {
  if (e?.target) e.target.style.display = 'none'
}

async function loadData() {
  loading.value = true
  try {
    const [cfgRes, listRes] = await Promise.all([
      getCopyTradeConfig(),
      getCopyTradeInstitutionList({})
    ])
    if (cfgRes?.code == 200 && cfgRes.data) {
      if (cfgRes.data.banner || cfgRes.data.bannerUrl) {
        bannerUrl.value = cfgRes.data.banner || cfgRes.data.bannerUrl
      }
    }
    if (listRes?.code == 200) {
      const { list, banner } = normalizeInstitutionListResponse(listRes)
      institutionList.value = list.filter((item) => {
        const st = item?.status
        return st === undefined || st === null || st === '' || st === 1 || st === '1'
      })
      if (banner && !bannerUrl.value) bannerUrl.value = banner
    }
  } catch (e) {
    void e
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onRefresh() {
  loadData()
}

function handleSubscribeFail(msg, institutionId) {
  const text = String(msg || '').trim() || t18('error')
  showToast(text)
  if (isSecretKeyLockMessage(text)) {
    setInstitutionSecretLock(institutionId)
  }
}

function goInstitution(item) {
  const id = institutionRowId(item)
  if (!id) return
  if (!isInstitutionSubscribed(item)) {
    onSubscribeClick(item)
    return
  }
  router.push({ path: '/copy-trade/institution', query: { institutionId: id } })
}

function onSubscribeClick(item) {
  const id = institutionRowId(item)
  if (!id) return
  if (isInstitutionSubscribed(item)) {
    router.push({ path: '/copy-trade/institution', query: { institutionId: id } })
    return
  }
  if (isInstitutionSecretLocked(id)) {
    showToast(t18('copy_trade_inst_locked'))
    return
  }
  subscribeTarget.value = item
  showSubscribe.value = true
}

async function onSubscribeConfirm({ institutionId, secretKey }) {
  if (!institutionId || !secretKey) return
  subscribeLoading.value = true
  try {
    const res = await subscribeCopyTradeInstitution({
      institutionId,
      secretKey
    })
    if (res?.code == 200) {
      showToast(res.msg || t18('copy_trade_inst_sub_ok'))
      institutionList.value = patchInstitutionSubscribed(
        institutionList.value,
        institutionId,
        res.data || {}
      )
      showSubscribe.value = false
    } else {
      handleSubscribeFail(res?.msg, institutionId)
    }
  } catch (e) {
    handleSubscribeFail(getResponseErrorMsg(e, ''), institutionId)
  } finally {
    subscribeLoading.value = false
  }
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
$green: #17ac74;

.inst-page {
  min-height: 100vh;
  background: #fff;
}

.header-info-btn {
  border: none;
  background: none;
  padding: 0;
  line-height: 0;
}

.header-info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: $green;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  font-style: italic;
  font-family: Georgia, serif;
}

.inst-body {
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.inst-banner {
  margin: 12px 15px 0;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f2f5;

  &--placeholder {
    border: 1px dashed #d1d5db;
    background: linear-gradient(135deg, #f8f9fb 0%, #eef1f4 100%);
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.inst-list {
  padding: 12px 15px 8px;
}

.inst-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  background: #fff;

  &__head {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  &__avatar-wrap {
    flex-shrink: 0;
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    display: block;

    &--ph {
      background: linear-gradient(135deg, #edf8f2, #d9f1e4);
    }
  }

  &__meta {
    flex: 1;
    min-width: 0;
  }

  &__name {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: #111;
    line-height: 1.25;
    word-break: break-word;
  }

  &__subs {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
  }

  &__rate {
    color: #17ac74;
    font-weight: 600;
  }

  &__btn {
    flex-shrink: 0;
    min-width: 72px;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
    border: 1px solid transparent;
    cursor: pointer;

    &--on {
      background: $green;
      color: #fff;
      border-color: $green;
    }

    &--off {
      background: #fff;
      color: #111;
      border-color: #d1d5db;
    }
  }

  &__desc {
    margin: 12px 0 0;
    font-size: 13px;
    color: #4b5563;
    line-height: 1.55;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  &__desc-label {
    font-weight: 600;
    color: #374151;
  }
}

</style>
